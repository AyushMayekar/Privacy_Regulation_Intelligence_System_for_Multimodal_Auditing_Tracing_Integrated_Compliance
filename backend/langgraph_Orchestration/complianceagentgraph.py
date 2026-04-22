import asyncio, uuid
import json
from typing import TypedDict, Annotated
from dotenv import load_dotenv
from config import Groq_API_Key
from temp_storage import store_data, init_db, cleanup_old_data
from langchain_groq import ChatGroq
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_mcp_adapters.client import MultiServerMCPClient

load_dotenv()

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

                # MCP format: [{"type":"text","text":"{...}"}]
                if "text" in content[0]:
                    parsed_items = []

                    for item in content:
                        if isinstance(item, dict) and "text" in item:
                            try:
                                parsed_items.append(json.loads(item["text"]))
                            except:
                                continue

                    # if only one → return dict (preserve old behavior)
                    if len(parsed_items) == 1:
                        return parsed_items[0]

                    return parsed_items

                # 🔥 FIX: handle case where DB already gives [{...}]
                if len(content) == 1 and isinstance(content[0], dict):
                    return content[0]

            return content

        # ✅ CASE 2: Already dict
        if isinstance(content, dict):
            return content

        # ✅ CASE 3: String → then parse
        if isinstance(content, str):
            outer = json.loads(content)

            if isinstance(outer, list) and len(outer) > 0:
                if isinstance(outer[0], dict) and "text" in outer[0]:
                    parsed = json.loads(outer[0]["text"])

                    # 🔥 SAME FIX HERE
                    if isinstance(parsed, list) and len(parsed) == 1:
                        return parsed[0]

                    return parsed

                # 🔥 unwrap plain list
                if len(outer) == 1 and isinstance(outer[0], dict):
                    return outer[0]

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


def summarize_audits(audits):
    if not audits:
        return "No audit logs found."

    total = len(audits)

    pii_counts = {}
    action_counts = {}
    law_counts = {}
    avg_conf = 0

    for a in audits:
        pii = a.get("pii", "unknown")
        pii_counts[pii] = pii_counts.get(pii, 0) + 1

        act = a.get("act", "unknown")
        action_counts[act] = action_counts.get(act, 0) + 1

        for law in a.get("laws", []):
            law_counts[law.upper()] = law_counts.get(law.upper(), 0) + 1

        avg_conf += a.get("conf", 0)

    avg_conf = avg_conf / total if total else 0

    return (
        f"Retrieved {total} audit logs.\n"
        f"Average Confidence: {round(avg_conf, 2)}\n"
        f"PII Types: {pii_counts}\n"
        f"Actions: {action_counts}\n"
        f"Laws: {law_counts}"
    )


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

    if not data:
        return "Tool executed."

    # =========================
    # CASE 1: DICT RESPONSE
    # =========================
    if isinstance(data, dict):

        # Handle audit logs
        if "result" in data and isinstance(data["result"], list):
            return summarize_audits(data["result"])

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
        if len(data) > 0 and "pii" in data[0]:
            return summarize_audits(data)

        return summarize_findings(data)

    return "Operation completed."

# =========================
# 🤖 SYSTEM PROMPT
# =========================
SYSTEM_PROMPT = """
You are PRISMATIC — a privacy and compliance assistant.

About PRISMATIC:
PRISMATIC helps organizations ensure data privacy compliance by:

* Scanning data sources (MongoDB, Gmail) for sensitive data (PII/PHI)
* Transforming data using privacy techniques (masking, tokenization, etc.)
* Maintaining audit logs for compliance tracking

Your role:

* Help users perform compliance tasks (scan, transform, audit)
* Explain how PRISMATIC works and how to use it
* Answer compliance-related questions within this system

Scope rules:

* ONLY respond to compliance, data privacy, or PRISMATIC-related queries
* If a query is unrelated (general knowledge, coding, trivia):
  → Politely refuse and redirect

Example:
"I'm here to help with data privacy and compliance tasks in PRISMATIC. Let me know how I can assist with that."

Tool rules:

* Use tools ONLY when action is explicitly required
* NEVER invent tools, arguments, or outputs
* If input is missing → ask the user clearly
* Do NOT use tools for informational questions

Safety:

* NEVER expose sensitive data
* Always use summarized/sanitized outputs

After tool execution:

* Explain what was done
* Summarize results clearly
* Suggest next steps

Style:

* Clear, concise, human
* Not robotic, not verbose
* No repetition

Goal:
Be a focused compliance assistant — not a general chatbot.
"""


RESPONSE_PROMPT = """
You are PRISMATIC Assistant.

You will receive a system-generated summary of a compliance operation.

Your job:

* Rewrite it in a clear, natural, conversational way
* Keep it concise and easy to understand

Rules:

* DO NOT change meaning
* DO NOT add or remove information
* DO NOT hallucinate
* DO NOT introduce new context

If the summary is empty or unclear:

* Respond briefly without assumptions

Style:

* Simple, human, professional
* No repetition
* No filler

Output only the final rewritten response.
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
                "args": ["server.py"], 
            }
        }
    )

    tools = await client.get_tools()

    # LLM
    llm = ChatGroq(api_key=Groq_API_Key, model="llama-3.1-8b-instant", temperature=0)

    llm_with_tools = llm.bind_tools(tools)

    # =========================
    # 🧠 LLM NODE
    # =========================


    # LLM to respond
    async def response_node(state: ChatState):

        last_msg = state["messages"][-1]

        # safety: only process sanitized outputs
        if not (isinstance(last_msg, AIMessage) and last_msg.additional_kwargs.get("sanitized")):
            return {"messages": [last_msg]}

        response = await llm.ainvoke([
            {"role": "system", "content": RESPONSE_PROMPT},
            {"role": "user", "content": last_msg.content}
        ])

        return {
            "messages": [
                AIMessage(
                    content=response.content,
                    additional_kwargs={
                        "safe": True,
                        "final": True
                    }
                )
            ]
        } 


    async def chat_node(state: ChatState):
        messages = state["messages"]

    
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

            response.tool_calls = filtered_calls

        if hasattr(response, "tool_calls") and not response.tool_calls:
            return {"messages": [response]}

        if hasattr(response, "tool_calls"):
            for tool_call in response.tool_calls:
                tool_call["args"]["session_id"] = state["session_id"]
                tool_call["args"]["admin_email"] = state["admin_email"]


        return {"messages": [response]}

    # =========================
    # 🔧 TOOL NODE
    # =========================

    async def tool_wrapper(state: ChatState):
        ai_msg = state["messages"][-1]


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

                if not findings and ("pii" in data and "act" in data):
                    findings = [data]

            elif isinstance(data, list):
                findings = data

            tool_name = None
            if i < len(tool_calls):
                tool_name = tool_calls[i].get("name")

            store_data(
                session_id=state["session_id"],
                data=findings,
                source=tool_name or "unknown_tool",
            )


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


        # ✅ Generate safe summary
        if raw_content:
            safe_summary = summarize_tool_output(raw_content)
        else:
            safe_summary = "Operation completed."


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
    graph.add_node("response", response_node)

    graph.add_edge(START, "chat")
    graph.add_conditional_edges("chat", tools_condition)

    graph.add_edge("tools", "sanitize")
    graph.add_edge("sanitize", "response")

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

        if user_input.lower() in ["exit", "quit", "Stop"]:
            break


        state["messages"].append(HumanMessage(content=user_input))

        result = await chatbot.ainvoke(state)


        final_msg = result["messages"][-1]

        print("\nAssistant:", final_msg.content, "\n")


        state = result


if __name__ == "__main__":
    asyncio.run(main())