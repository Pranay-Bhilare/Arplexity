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