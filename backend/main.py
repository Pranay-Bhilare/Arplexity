from typing import TypedDict, Annotated, Optional
from langgraph.graph import add_messages, StateGraph, START
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessageChunk, ToolMessage
from dotenv import load_dotenv
from langchain_community.tools.tavily_search import TavilySearchResults
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

search_tool = TavilySearchResults(
    max_results=4,
)
tools = [search_tool]
llm = ChatGroq(model="")

llm_with_tools = llm.bind_tools(tools=tools)


async def model(state: State) : 
    response = await llm_with_tools.ainvoke(state["messages"])  
    return {
        "messages": [response], 
    }

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

    if is_new_convo : 
        new_checkpoint_id = str(uuid4())

        config = {
            "configurable" : {
                "thread_id" : new_checkpoint_id
            }
        }

        events = graph.astream_events(
            {"messages" : [HumanMessage(query)]},
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
            {"messages": [HumanMessage(content=query)]},
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