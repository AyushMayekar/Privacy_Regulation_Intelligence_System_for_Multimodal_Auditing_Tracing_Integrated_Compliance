from typing import TypedDict, List, Dict, Any, Optional

# DSAR Specific State Schema
class DSARAccessState(TypedDict):
    admin_email: str
    findings: List[Dict[str, Any]]
    dsar_contexts: Optional[List[Any]]
    targeted_findings: Optional[List[Dict[str, Any]]]
    dsar_decisions: Optional[List[Any]]
    results: Optional[List[Dict[str, Any]]]
    audit_logged: bool
    email_sent: bool
    status: str

# Main Compliance State Schema
class AgentState(TypedDict):
    messages: List[Dict[str, str]]

    # hidden
    raw_data: Optional[Any]
    tool_output: Optional[Any]

    # visible to LLM
    safe_summary: Optional[str]

    # flow control
    last_tool: Optional[str]
    next_action: Optional[str]

    requires_confirmation: bool
    approved: bool

    final_response: Optional[str]
    admin_email: str