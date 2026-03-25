import json, re, asyncio
import datetime
from langgraph_Orchestration.data_schema import AgentState
from config import Groq_API_Key
from groq import Groq
from langgraph_Orchestration.tool_registry import TOOL_REGISTRY
from langgraph.graph import StateGraph, START, END


MAX_STEPS = 5

# logging helper
def log_to_file(stage: str, data: dict):
    log_entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "stage": stage,
        "data": data
    }

    with open("debug_log.jsonl", "a") as f:
        f.write(json.dumps(log_entry) + "\n")

# LLM config
groq_client = Groq(api_key=Groq_API_Key)

def call_llm(messages, system_prompt):


    log_to_file("llm_input", {
        "messages": messages[-3:],
        "system_prompt": system_prompt[:500]
    })


    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            *messages
        ],
        temperature=0
    )

    content = response.choices[0].message.content

    log_to_file("llm_raw_output", {
        "content": content
    })

    try:
        parsed = extract_json(content)
        log_to_file("llm_parsed_output", parsed)
        return parsed
    except:
        return {"action": "mongo_scan"}  # fallback safety


def extract_json(text):
    try:
        return json.loads(text)
    except:
        match = re.search(r'\{.*?\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
        return {"action": "mongo_scan"}


# Orchestration
class ComplianceOrchestrator:

    def __init__(self):
        self.state_store = {}  # replace with Redis later

    def start(self, session_id: str, user_input: str, admin_email: str):

        print("\n===== START =====")
        print("User input:", user_input)

        state = {
            "messages": [{"role": "user", "content": user_input}],
            "raw_data": [],
            "safe_summary": None,
            "last_tool": None,
            "next_action": None,
            "requires_confirmation": False,
            "approved": False,
            "final_response": None,
            "admin_email": admin_email
        }

        state = agent_graph.invoke(state)
        state["messages"].append({
        "role": "assistant",
        "content": state["safe_summary"]
        })

        self.state_store[session_id] = state

        return {
            "message": state["safe_summary"],
            "requires_confirmation": True
        }

    def resume(self, session_id: str, user_input: str):

        print("\n===== RESUME =====")
        print("User said:", user_input)


        state = self.state_store.get(session_id)

        if not state:
            return {"error": "Session not found"}

        print("Approved:", state["approved"])

        # 🔥 update approval
        if user_input.lower() in ["yes", "y", "continue"]:
            state["approved"] = True
        else:
            state["approved"] = False

        # ❌ user stopped
        if not state["approved"]:
            return {
                "message": state["safe_summary"],
                "status": "stopped"
            }

        # ✅ continue execution
        state["messages"].append({
            "role": "user",
            "content": user_input
        })

        if len(state.get("raw_data", [])) > MAX_STEPS:
            return {
                "message": "Execution limit reached",
                "status": "stopped"
            }

        state = agent_graph.invoke(state)

        state["messages"].append({
        "role": "assistant",
        "content": state["safe_summary"]
        })

        self.state_store[session_id] = state

        return {
            "message": state["safe_summary"],
            "requires_confirmation": True
        }


# Main Compliance Workflow
def llm_node(state: AgentState):

    print("\n===== LLM NODE =====")
    print("Previous summary:", state.get("safe_summary"))
    print("Last tool:", state.get("last_tool"))

    safe_summary = state.get("safe_summary", "")
    messages = state["messages"]

    system_prompt = f"""
        You are PRISMATIC Compliance Assistant.

        Context:
        - Previous step: {safe_summary}
        - Last tool: {state.get("last_tool")}

        Available tools:
        - mongo_scan → Scan data
        - gmail_scan → Scan email data
        - transform_data → process data
        - audit_report → final report

        Rules:
        - Follow workflow:
        scan → transform → audit
        - Do NOT repeat the same tool unnecessarily
        - Do NOT skip steps
        - If everything is done → choose audit_report

        Return ONLY JSON:
        {{
        "action": "<tool_name>",
        "reason": "<one short sentence>"
        }}
"""

    response = call_llm(messages, system_prompt)

    state["next_action"] = response.get("action", "mongo_scan")

    print("Chosen action:", state["next_action"])

    return state


def tool_node(state: AgentState):

    print("\n===== TOOL NODE =====")
    print("Executing tool:", state["next_action"])


    action = state["next_action"]
    tool = TOOL_REGISTRY.get(action)

    if not tool:
        print("❌ Invalid tool")
        state["safe_summary"] = "Invalid tool selected"
        return state

    if action == "mongo_scan":
        result = tool(admin_email = state.get("admin_email"))
        print("\n--- TOOL OUTPUT ---")
        if isinstance(result, dict):
            print("Keys:", list(result.keys()))
            if "findings" in result:
                print("Findings count:", len(result["findings"]))
            if "results" in result and result["results"] is not None:
                print("Results count:", len(result["results"]))
            else:
                print("Results is empty or None")
        else:
            print("Result type:", type(result))
        log_to_file("tool_execution", {
        "action": action,
        "result_keys": list(result.keys()) if isinstance(result, dict) else str(type(result)),
        "sample": str(result)[:500]  # avoid huge dump
        })  

    elif action == "gmail_scan":
        result = asyncio.run(tool(user_email = state.get("admin_email")))
        print("\n--- TOOL OUTPUT ---")
        if isinstance(result, dict):
            print("Keys:", list(result.keys()))
            if "findings" in result:
                print("Findings count:", len(result["findings"]))
            if "results" in result and result["results"] is not None:
                print("Results count:", len(result["results"]))
            else:
                print("Results is empty or None")
        else:
            print("Result type:", type(result))
        log_to_file("tool_execution", {
        "action": action,
        "result_keys": list(result.keys()) if isinstance(result, dict) else str(type(result)),
        "sample": str(result)  # avoid huge dump
        })


    elif action == "run_dsar_workflow":
        result = tool(
            admin_email = state.get("admin_email"),
            findings=get_latest_findings(state)
        )
        print("\n--- TOOL OUTPUT ---")
        if isinstance(result, dict):
            print("Keys:", list(result.keys()))
            if "findings" in result:
                print("Findings count:", len(result["findings"]))
            if "results" in result and result["results"] is not None:
                print("Results count:", len(result["results"]))
            else:
                print("Results is empty or None")
        else:
            print("Result type:", type(result))
        log_to_file("tool_execution", {
        "action": action,
        "result_keys": list(result.keys()) if isinstance(result, dict) else str(type(result)),
        "sample": str(result)[:500]  # avoid huge dump
        })

    elif action == "transform_data":
        result = tool(
            admin_email = state.get("admin_email"),
            findings=get_latest_findings(state)
        )
        print("\n--- TOOL OUTPUT ---")
        if isinstance(result, dict):
            print("Keys:", list(result.keys()))
            if "findings" in result:
                print("Findings count:", len(result["findings"]))
            if "results" in result and result["results"] is not None:
                print("Results count:", len(result["results"]))
            else:
                print("Results is empty or None")
        else:
            print("Result type:", type(result))
        log_to_file("tool_execution", {
        "action": action,
        "result_keys": list(result.keys()) if isinstance(result, dict) else str(type(result)),
        "sample": str(result)[:500]  # avoid huge dump
        })

    elif action == "audit_report":
        result = tool(
            results=get_latest_findings(state),
            admin_email = state.get("admin_email")
    )
    log_to_file("tool_execution", {
    "action": action,
    "result_keys": list(result.keys()) if isinstance(result, dict) else str(type(result)),
    "sample": str(result)[:500]  # avoid huge dump
        })

    state["last_tool"] = action
    state["tool_output"] = result

    return state


def get_latest_findings(state):
    raw = state.get("raw_data", [])

    print("\n===== GET LATEST FINDINGS =====")
    print("raw_data length:", len(raw))

    if not raw:
        print("No previous data")

        log_to_file("get_latest_findings", {
            "raw_data_length": 0,
            "latest_keys": None
        })

        return []

    # ✅ define FIRST
    latest = raw[-1]

    # ✅ safe logging
    if isinstance(latest, dict):
        latest_keys = list(latest.keys())
    else:
        latest_keys = str(type(latest))

    log_to_file("get_latest_findings", {
        "raw_data_length": len(raw),
        "latest_keys": latest_keys
    })

    # ✅ extraction logic (safe)
    if isinstance(latest, dict):
        if latest.get("findings"):
            return latest["findings"]
        if latest.get("results"):
            return latest["results"]

    return []


def post_tool_node(state: AgentState):
    print("\n===== POST TOOL NODE =====")
    output = state.get("tool_output", {})

    if not state.get("raw_data"):
        state["raw_data"] = []
    
    state["raw_data"].append(output)

    last_tool = state.get("last_tool")

    findings = output.get("findings") or []
    results = output.get("results") or []

    if findings:
        count = len(findings)
    elif results:
        count = len(results)
    else:
        count = 0


    if last_tool == "mongo_scan":
        state["safe_summary"] = f"Scan complete. Found {count} records."
        log_to_file("post_tool", {
        "last_tool": last_tool,
        "raw_data_length": len(state["raw_data"]),
        "latest_keys": list(output.keys()) if isinstance(output, dict) else str(type(output)),
        "safe_summary": state["safe_summary"]
        })

    elif last_tool == "run_dsar_workflow":
        state["safe_summary"] = f"DSAR processed for {count} records."
        log_to_file("post_tool", {
        "last_tool": last_tool,
        "raw_data_length": len(state["raw_data"]),
        "latest_keys": list(output.keys()) if isinstance(output, dict) else str(type(output)),
        "safe_summary": state["safe_summary"]
    })

    elif last_tool == "transform_data":
        state["safe_summary"] = f"Transformed {count} records."
        log_to_file("post_tool", {
        "last_tool": last_tool,
        "raw_data_length": len(state["raw_data"]),
        "latest_keys": list(output.keys()) if isinstance(output, dict) else str(type(output)),
        "safe_summary": state["safe_summary"]
        })

    elif last_tool == "audit_report":
        state["safe_summary"] = "Audit report generated."
        log_to_file("post_tool", {
        "last_tool": last_tool,
        "raw_data_length": len(state["raw_data"]),
        "latest_keys": list(output.keys()) if isinstance(output, dict) else str(type(output)),
        "safe_summary": state["safe_summary"]
        })  

    else:
        state["safe_summary"] = "Operation completed"
        log_to_file("post_tool", {
        "last_tool": last_tool,
        "raw_data_length": len(state["raw_data"]),
        "latest_keys": list(output.keys()) if isinstance(output, dict) else str(type(output)),
        "safe_summary": state["safe_summary"]
        })

    return state


builder = StateGraph(AgentState)

builder.add_node("llm", llm_node)
builder.add_node("tool", tool_node)
builder.add_node("post_tool", post_tool_node)

builder.add_edge(START, "llm")
builder.add_edge("llm", "tool")
builder.add_edge("tool", "post_tool")

# 🔥 THIS is the interrupt
builder.add_edge("post_tool", END)

agent_graph = builder.compile()

# initiator code
if __name__ == "__main__":
    orchestrator = ComplianceOrchestrator()

    session_id = "test123"
    user_input = input("Speak MF!!!!: ")
    response = orchestrator.start(session_id, user_input, admin_email="ayush01.mayekar@example.com")
    print(response["message"])

    while response.get("requires_confirmation"):
        user_input = input("Continue? (yes/no): ")
        response = orchestrator.resume(session_id, user_input)
        print(response["message"])