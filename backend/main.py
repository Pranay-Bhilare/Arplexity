from typing import TypedDict, Annotated, Optional
from langgraph.graph import add_messages, StateGraph, START
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessageChunk, ToolMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from uuid import uuid4
from langgraph.checkpoint.memory import MemorySaver

load_dotenv()

memory = MemorySaver()

class State(TypedDict):
    messages: Annotated[list, add_messages]

search_tool = TavilySearch(
    max_results=5,
    # include_answer=True,
    include_raw_content=True
)
tools = [search_tool]
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")

llm_with_tools = llm.bind_tools(tools=tools)

SYSTEM_PROMPT = (
    "You are an AI assistant with access to the tavily_search tool, which allows you to search the web for any information, including real-time, current, or up-to-date data (such as weather, news, stock prices, or any other topic). "
    "For basic facts, logic, and reasoning (such as simple math, definitions, or universally true statements), you may use your own knowledge. "
    "For any other information—especially anything that could be looked up, gathered, or may change over time—you must always use the tavily_search tool to find the answer, regardless of whether the information is real-time, current, or general knowledge. You can always obtain any information by searching with this tool. "
    "Never make assumptions or use your own knowledge for information that could be searched or gathered. "
    "If you cannot access the tool, respond by stating that you are unable to provide information without it."
)

async def model(state: State) : 
    try:
        response = await llm_with_tools.ainvoke(state["messages"])
        return {
            "messages": [response], 
        }
    except Exception as e:
        print("Error in llm_with_tools.ainvoke:", e)
    raise

async def tool_node(state):
    """Custom tool node that handles tool calls from the LLM."""
    tool_calls = state["messages"][-1].tool_calls
    
    tool_messages = []
    
    for tool_call in tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        tool_id = tool_call["id"]

        if tool_name == "tavily_search_results_json":
            search_results = await search_tool.ainvoke(tool_args)
            
            tool_message = ToolMessage(
                content=str(search_results),
                tool_call_id=tool_id,
                name=tool_name
            )
            
            tool_messages.append(tool_message)
    
    # Add the tool messages to the state
    return {"messages": tool_messages}

graph_builder = StateGraph(State)
graph_builder.add_node("llm", model)
graph_builder.add_node("tools", ToolNode(tools))
graph_builder.add_edge(START,"llm")
graph_builder.add_conditional_edges("llm",tools_condition)
graph_builder.add_edge("tools", "llm")

graph = graph_builder.compile(checkpointer=memory)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
    expose_headers=["Content-Type"], 
)

def serialise_ai_message_chunk(chunk) : 
    if(isinstance(chunk, AIMessageChunk)):
        return chunk.content
    else : 
        raise TypeError(
            f"Object of type {type(chunk).__name__} is not formatted correctly for serialisation"
        )

async def generate_chat_response(query : str, checkpoint_id: Optional[str] = None) :
    is_new_convo = checkpoint_id is None 

    system_message = SystemMessage(content=SYSTEM_PROMPT)

    if is_new_convo : 
        new_checkpoint_id = str(uuid4())

        config = {
            "configurable" : {
                "thread_id" : new_checkpoint_id
            }
        }

        events = graph.astream_events(
            {"messages" : [system_message, HumanMessage(query)]},
            version = "v2",
            config = config
        )

        # Sending the checkppoint id first and then continuing the funtion
        yield f"data: {{\"type\": \"checkpoint\", \"checkpoint_id\": \"{new_checkpoint_id}\"}}\n\n"

    else :
        config = {
            "configurable": {
                "thread_id": checkpoint_id
            }
        }
        # Continues existing conversation
        events = graph.astream_events(
            {"messages": [system_message, HumanMessage(content=query)]},
            version="v2",
            config=config
        )

    async for event in events :
        print(event) 
        event_type = event["event"]

        if event_type == "on_chat_model_stream":
            chunk_content = serialise_ai_message_chunk(event["data"]["chunk"])
            # for safe JSON parsing
            safe_content = chunk_content.replace("'", "\\'").replace("\n", "\\n")
            
            yield f"data: {{\"type\": \"content\", \"content\": \"{safe_content}\"}}\n\n"
        elif event_type == "on_tool_start":
            # Tool call is starting
            tool_name = event.get("name", "")
            if tool_name == "tavily_search_results_json" or tool_name == "tavily_search":
                tool_input = event["data"]["input"]
                search_query = tool_input.get("query", "")
                safe_query = search_query.replace('"', '\\"').replace("'", "\\'").replace("\n", "\\n")
                yield f"data: {{\"type\": \"search_start\", \"query\": \"{safe_query}\"}}\n\n"
        elif event_type == "on_tool_end":
            tool_name = event.get("name", "")
            if tool_name == "tavily_search_results_json" or tool_name == "tavily_search":
                output = event["data"]["output"]
                # Try to extract URLs from the output
                try:
                    if isinstance(output, ToolMessage):
                        output_content = output.content
                    else:
                        output_content = output
                    # Try to parse as JSON
                    if isinstance(output_content, str):
                        output_json = json.loads(output_content)
                    else:
                        output_json = output_content
                    urls = []
                    if isinstance(output_json, dict) and "results" in output_json:
                        for item in output_json["results"]:
                            if isinstance(item, dict) and "url" in item:
                                urls.append(item["url"])
                    elif isinstance(output_json, list):
                        for item in output_json:
                            if isinstance(item, dict) and "url" in item:
                                urls.append(item["url"])
                    urls_json = json.dumps(urls)
                    yield f"data: {{\"type\": \"search_results\", \"urls\": {urls_json}}}\n\n"
                except Exception as e:
                    print("Error parsing tool output for URLs:", e)
        elif event_type == "on_chat_model_end":
            # Optionally, handle end of chat model
            pass
    yield f"data: {{\"type\": \"end\"}}\n\n"


@app.get("/chat_stream/{message}")
async def chat_stream(message: str, checkpoint_id: Optional[str] = Query(None)):
    return StreamingResponse(
        generate_chat_response(message, checkpoint_id), 
        media_type="text/event-stream"
    )