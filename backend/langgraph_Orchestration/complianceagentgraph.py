import asyncio, uuid
import json, datetime, ast
from typing import TypedDict, Annotated
from dotenv import load_dotenv
from langgraph import graph
from config import Groq_API_Key
from temp_storage import store_data, init_db, cleanup_old_data
from langchain_groq import ChatGroq
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_mcp_adapters.client import MultiServerMCPClient

load_dotenv()

LOG_FILE = "prismatic_logs.jsonl"

def log_event(stage: str, data: dict):
    try:
        log_entry = {
            "timestamp": datetime.datetime.now().isoformat(),
            "stage": stage,
            "data": data
        }

        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry, default=str) + "\n")

    except Exception as e:
        print("Logging failed:", str(e))

# =========================
# 🧠 STATE
# =========================
class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    session_id: str
    admin_email:str


# =========================
# 🔒 SANITIZER (CRITICAL)
# =========================

# Extracting insughts from scan output
def extract_tool_data(content):
    try:
        # ✅ CASE 1: Already parsed (list/dict)
        if isinstance(content, list):
            if len(content) > 0 and isinstance(content[0], dict):
                if "text" in content[0]:
                    return json.loads(content[0]["text"])
            return content

        if isinstance(content, dict):
            return content

        # ✅ CASE 2: String → then parse
        if isinstance(content, str):
            outer = json.loads(content)

            if isinstance(outer, list) and len(outer) > 0:
                if isinstance(outer[0], dict) and "text" in outer[0]:
                    return json.loads(outer[0]["text"])

            return outer

        return None

    except Exception as e:
        print("❌ extract_tool_data failed:", e)
        return None



# Extracting insight from tranformation results 
def extract_transformation_insights(results):
    if not results:
        return {}

    total = len(results)

    type_counts = {}
    pii_counts = {}
    law_counts = {}
    avg_conf = 0

    for r in results:
        # transformation type
        t = r.get("transformation_type", "unknown")
        type_counts[t] = type_counts.get(t, 0) + 1

        # metadata
        meta = r.get("metadata", {})

        pii = meta.get("pii_type", "unknown")
        pii_counts[pii] = pii_counts.get(pii, 0) + 1

        for law in meta.get("derived_laws", []):
            law_counts[law.upper()] = law_counts.get(law.upper(), 0) + 1

        avg_conf += r.get("confidence", 0)

    avg_conf = avg_conf / total if total else 0

    return {
        "total_records": total,
        "transformation_types": type_counts,
        "pii_types": pii_counts,
        "laws_applied": law_counts,
        "average_confidence": round(avg_conf, 2)
    }


def summarize_findings(findings):
    if not findings:
        return "No sensitive data found."

    total = len(findings)

    type_counts = {}
    field_counts = {}
    law_counts = {}

    for f in findings:
        t = f.get("type", "unknown")
        type_counts[t] = type_counts.get(t, 0) + 1

        field = f.get("field_path", "unknown")
        field_counts[field] = field_counts.get(field, 0) + 1

        for law in f.get("mapped_laws", []):
            law_counts[law] = law_counts.get(law, 0) + 1

    confidence_avg = sum(f.get("confidence", 0) for f in findings) / total

    return (
        f"Detected {total} sensitive records.\n"
        f"Average Confidence: {round(confidence_avg, 2)}\n"
        f"Types: {type_counts}\n"
        f"Top Fields: {dict(list(field_counts.items())[:3])}\n"
        f"Laws: {law_counts}\n"
    )


def summarize_tool_output(content):
    data = extract_tool_data(content)

    log_event("extracted_tool_data", {
        "is_none": data is None,
        "data_type": str(type(data)),
        "has_findings": isinstance(data, dict) and ("findings" in data or "results" in data),
        "preview": str(data)[:2000]
    })

    if not data:
        return "Tool executed."

    # =========================
    # CASE 1: DICT RESPONSE
    # =========================
    if isinstance(data, dict):

        # 🔍 SCAN RESULTS
        if "findings" in data:
            return summarize_findings(data["findings"])

        # 🔁 TRANSFORMATION RESULTS
        elif "results" in data:
            insights = extract_transformation_insights(data["results"])

            return (
                f"Transformed {insights['total_records']} records.\n"
                f"Average Confidence: {insights['average_confidence']}\n"
                f"Transformation Types: {insights['transformation_types']}\n"
                f"PII Types: {insights['pii_types']}\n"
                f"Laws Applied: {insights['laws_applied']}"
            )

        # fallback
        elif data.get("message"):
            return data["message"]

    # =========================
    # CASE 2: LIST RESPONSE (rare)
    # =========================
    if isinstance(data, list):
        return summarize_findings(data)

    return "Operation completed."

# =========================
# 🤖 SYSTEM PROMPT
# =========================
SYSTEM_PROMPT = """
    You are PRISMATIC Compliance Assistant.

- Handle privacy/compliance tasks: scan → process → transform → audit
- Use ONLY the provided tools when action is required
- NEVER invent tools, arguments, or data
- If input is missing, ask the user instead of guessing

- NEVER expose sensitive data (PII/PHI)
- Always use sanitized summaries

- After tool execution:
- Explain what was done
- Summarize results clearly
- Suggest next steps

- If user asks questions (not actions), respond with guidance, NOT tools

- Always give meaningful responses
- Be concise, clear, and professional
- Do NOT repeat the same summary
- Clearly report failures if any
"""


# =========================
# 🔧 BUILD GRAPH
# =========================
async def build_graph():

    # MCP CLIENT
    client = MultiServerMCPClient(
        {
            "prismatic": {
                "transport": "stdio",
                "command": "python",
                "args": ["server.py"],  # your MCP server
            }
        }
    )

    tools = await client.get_tools()

#     log_event("mcp_tools_loaded", {
#     "tool_count": len(tools),
#     "tool_names": [t.name for t in tools]
# })

    # LLM
    llm = ChatGroq(api_key=Groq_API_Key, model="llama-3.1-8b-instant", temperature=0)

    llm_with_tools = llm.bind_tools(tools)

    # =========================
    # 🧠 LLM NODE
    # =========================
    async def chat_node(state: ChatState):
        messages = state["messages"]

    #     log_event("llm_input", {
    #     "message_count": len(messages),
    #     "last_3_messages": [str(m.content) for m in messages[-3:]]
    # })
    
        filtered_messages = [
    m for m in state["messages"]
    if isinstance(m, HumanMessage)
    or (isinstance(m, AIMessage) and m.additional_kwargs.get("safe") and not m.additional_kwargs.get("final"))
]
        last_msg = state["messages"][-1]

        if isinstance(last_msg, AIMessage) and last_msg.additional_kwargs.get("final"):
            return {"messages": [last_msg]}

        response = await llm_with_tools.ainvoke(
            [{"role": "system", "content": SYSTEM_PROMPT}, *filtered_messages]
        )

        valid_tool_names = [t.name for t in tools]

        if hasattr(response, "tool_calls") and response.tool_calls:
            filtered_calls = []

            for call in response.tool_calls:
                if call["name"] in valid_tool_names:
                    filtered_calls.append(call)
                else:
                    log_event("invalid_tool_blocked", {
                        "tool": call["name"]
                    })

            response.tool_calls = filtered_calls

        if hasattr(response, "tool_calls") and not response.tool_calls:
            return {"messages": [response]}

        if hasattr(response, "tool_calls"):
            for tool_call in response.tool_calls:
                tool_call["args"]["session_id"] = state["session_id"]
                tool_call["args"]["admin_email"] = state["admin_email"]

#         log_event("routing_decision", {
#     "has_tool_call": hasattr(response, "tool_calls") and response.tool_calls is not None
# })

    #     log_event("llm_output", {
    #     "response": str(response),
    #     "tool_calls": getattr(response, "tool_calls", None)
    # })

        return {"messages": [response]}

    # =========================
    # 🔧 TOOL NODE
    # =========================

    async def tool_wrapper(state: ChatState):
        ai_msg = state["messages"][-1]

        # log_event("tool_call_detected", {
        #     "message": str(ai_msg)
        # })

        # Run actual ToolNode
        result = await tool_node.ainvoke(state)

        new_messages = result.get("messages", [])

        tool_calls = getattr(ai_msg, "tool_calls", None)
        if not tool_calls:
            tool_calls = ai_msg.additional_kwargs.get("tool_calls", [])

        for i, tool_msg in enumerate(new_messages[-len(tool_calls):] if tool_calls else new_messages):
            raw_content = getattr(tool_msg, "content", "")
            data = extract_tool_data(raw_content)

            findings = []

            if isinstance(data, dict):
                findings = data.get("findings", []) or data.get("results", [])

            elif isinstance(data, list):
                findings = data

            tool_name = None
            if i < len(tool_calls):
                tool_name = tool_calls[i].get("name")

            store_data(
                session_id=state["session_id"],
                data=findings,
                source=tool_name or "unknown"
            )

            log_event("db_write", {
                "session_id": state["session_id"],
                "source": tool_name,
                "preview": str(findings)[:200]
            })

        # log_event("tool_execution_result", {
        #     "result": str(result)
        # })

        return result
    
    tool_node = ToolNode(tools)

    # =========================
    # 🔒 SANITIZE NODE
    # =========================
    async def sanitize_node(state: ChatState):

        last_msg = state["messages"][-1]
        raw_content = getattr(last_msg, "content", "")

        if isinstance(last_msg, AIMessage) and last_msg.additional_kwargs.get("final"):
            return {"messages": [last_msg]}

        log_event("sanitize_input", {
            "raw_tool_output": str(raw_content)[:1000]
        })

        # ✅ Generate safe summary
        if raw_content:
            safe_summary = summarize_tool_output(raw_content)
        else:
            safe_summary = "Operation completed."

        log_event("sanitize_output", {
            "safe_summary": safe_summary
        })

        # 🔥 CRITICAL FIX: REMOVE RAW TOOL OUTPUTS FROM STATE
        cleaned_messages = []

        for msg in state["messages"]:
            # ✅ Keep ONLY:
            # - Human messages
            # - Already sanitized messages
            if isinstance(msg, HumanMessage):
                cleaned_messages.append(msg)

            elif isinstance(msg, AIMessage) and msg.additional_kwargs.get("safe"):
                cleaned_messages.append(msg)

            # ❌ DROP EVERYTHING ELSE (tool outputs, raw AI responses, etc.)

        return {
        "messages": cleaned_messages + [
            AIMessage(
                content = safe_summary,
                additional_kwargs={
                    "safe": True,
                    "sanitized": True,
                    "final": True 
                }
            )
        ]
    }

    # =========================
    # 🧩 GRAPH
    # =========================
    graph = StateGraph(ChatState)

    graph.add_node("chat", chat_node)
    graph.add_node("tools", tool_wrapper)
    graph.add_node("sanitize", sanitize_node)

    graph.add_edge(START, "chat")
    graph.add_conditional_edges("chat", tools_condition)

    graph.add_edge("tools", "sanitize")
    graph.add_edge("sanitize", "chat")

    chatbot = graph.compile()

    return chatbot


# =========================
# 🚀 MAIN LOOP
# =========================
async def main():

    init_db()
    cleanup_old_data(30)
    chatbot = await build_graph()

    print("\n🔵 PRISMATIC AI Ready\n")

    state = {
        "messages": [],
        "session_id": str(uuid.uuid4()),
        "admin_email": "ayush01.mayekar@example.com"
    }

    while True:
        user_input = input("You: ")

        if user_input.lower() in ["exit", "quit"]:
            break

#         log_event("user_input", {
#     "input": user_input,
#     "session_id": state["session_id"],
#     "admin_email": state["admin_email"]
# })

        state["messages"].append(HumanMessage(content=user_input))

        result = await chatbot.ainvoke(state)

#         log_event("state_snapshot", {
#     "message_count": len(result["messages"])
# })

        final_msg = result["messages"][-1]

        print("\nAssistant:", final_msg.content, "\n")

        log_event("final_output", {
    "response": final_msg.content
})

        state = result


if __name__ == "__main__":
    asyncio.run(main())