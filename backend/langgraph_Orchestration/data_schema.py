from typing import TypedDict, List, Dict, Any, Optional


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