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
    max_results=4,
    description=(
        "Use this tool to search the web for any real-time, current, or up-to-date information, "
        "including weather, news, stock prices, or anything that may have changed recently. "
        "Always use this tool for questions about the current weather, news, or other live data."
    )
)
tools = [search_tool]
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")

llm_with_tools = llm.bind_tools(tools=tools)

SYSTEM_PROMPT = (
    "You are an AI assistant with access to external tools and APIs for fetching real-time or up-to-date information (such as weather, news, stock prices, etc.). "
    "You must always use the appropriate tool or API to answer any question that requires current, real-time, or frequently changing data. "
    "Do not attempt to answer such questions from your own knowledge or by guessing. "
    "If a user asks for information that may have changed since your last update (e.g., 'What is the current weather in Delhi?'), you must call the relevant tool or API to fetch the latest data. "
    "If you cannot access the required tool or API, respond by stating that you are unable to provide real-time information without the tool. "
    "For all other questions that do not require real-time data, you may answer from your own knowledge. "
    "Always prioritize tool use for any request involving current or live data, you must use the TavilySearch tool to search for the answer. Never answer from your own knowledge for such questions."
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
        event_type = event["event"]

        if event_type == "on_chat_model_stream":
            chunk_content = serialise_ai_message_chunk(event["data"]["chunk"])
            # for safe JSON parsing
            safe_content = chunk_content.replace("'", "\\'").replace("\n", "\\n")
            
            yield f"data: {{\"type\": \"content\", \"content\": \"{safe_content}\"}}\n\n"
        elif event_type == "on_chat_model_end" : 
            # Checking if there are any tool calls
            tool_calls = event["data"]["output"].tool_calls if hasattr(event["data"]["output"], "tool_calls") else []
            search_calls = [call for call in tool_calls if call["name"] == "tavily_search_results_json"]

            if search_calls:
                search_query = search_calls[0]["args"].get("query", "")
                # safe json parsing
                safe_query = search_query.replace('"', '\\"').replace("'", "\\'").replace("\n", "\\n")
                # Signal that a search is starting
                yield f"data: {{\"type\": \"search_start\", \"query\": \"{safe_query}\"}}\n\n"
        elif event_type == "on_tool_end" and event["name"] == "tavily_search_results_json":
            output = event["data"]["output"]

            if isinstance(output, list):
                # extract URLs from list of search results
                urls = []
                for item in output:
                    if isinstance(item, dict) and "url" in item:
                        urls.append(item["url"])
                urls_json = json.dumps(urls)
                yield f"data : {{\"type\": \"search_results\", \"urls\": {urls_json}}}\n\n"

    yield f"data: {{\"type\": \"end\"}}\n\n"


@app.get("/chat_stream/{message}")
async def chat_stream(message: str, checkpoint_id: Optional[str] = Query(None)):
    return StreamingResponse(
        generate_chat_response(message, checkpoint_id), 
        media_type="text/event-stream"
    )