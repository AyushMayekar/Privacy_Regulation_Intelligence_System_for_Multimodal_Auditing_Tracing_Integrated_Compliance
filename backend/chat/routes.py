"""
chat/routes.py — Prismatic Chat API

POST /chat         → Run AI agent, return structured response
GET  /chat/audits  → Retrieve audit logs for the admin

The agent graph (build_graph) is built once and cached.
Session state is held in-memory per session_id.
"""

import uuid
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from user_auth.core import extract_and_verify_token
from langgraph_Orchestration.complianceagentgraph import build_graph
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from temp_storage import get_all_findings, init_db, cleanup_old_data
from auditing_and_reporting.core import retrieve_audits
from auditing_and_reporting.data_schema import AuditQuery

router_chat = APIRouter()

# ────────────────────────────────────────────────────────────
# Graph cache — built once, reused across requests
# ────────────────────────────────────────────────────────────
_graph = None

async def _get_graph():
    global _graph
    if _graph is None:
        init_db()
        cleanup_old_data(60)
        _graph = await build_graph()
    return _graph


# ────────────────────────────────────────────────────────────
# In-memory session store  { session_id → LangGraph state }
# ────────────────────────────────────────────────────────────
_sessions: Dict[str, dict] = {}


# ────────────────────────────────────────────────────────────
# Schemas
# ────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    type: str           # "scan" | "transform" | "audit" | "info"
    summary: str
    data: Dict[str, Any]
    session_id: str


# ────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────
SCAN_TOOLS      = {"mongo_scan", "gmail_scan"}
TRANSFORM_TOOLS = {"transform_data"}
AUDIT_TOOLS     = {"get_audit_logs"}


def _detect_type(messages: list) -> str:
    """Walk message history in reverse to find the last tool call."""
    for msg in reversed(messages):
        calls = getattr(msg, "tool_calls", None)
        if calls:
            for tc in calls:
                name = tc.get("name", "")
                if name in SCAN_TOOLS:
                    return "scan"
                if name in TRANSFORM_TOOLS:
                    return "transform"
                if name in AUDIT_TOOLS:
                    return "audit"
    return "info"


def _build_scan_data(findings: List[Dict]) -> Dict:
    if not findings:
        return {}

    total = len(findings)
    pii_counts: Dict[str, int] = {}
    law_counts: Dict[str, int] = {}
    field_counts: Dict[str, int] = {}
    conf_sum = 0.0

    for f in findings:
        t = f.get("type", "Unknown")
        pii_counts[t] = pii_counts.get(t, 0) + 1

        for law in f.get("mapped_laws", []):
            law_counts[law] = law_counts.get(law, 0) + 1

        field = f.get("field_path", "unknown")
        field_counts[field] = field_counts.get(field, 0) + 1

        conf_sum += f.get("confidence", 0)

    return {
        "total_records": total,
        "average_confidence": round(conf_sum / total, 2) if total else 0,
        "pii_types": [{"name": k, "value": v} for k, v in pii_counts.items()],
        "laws": list(law_counts.keys()),
        "top_fields": list(field_counts.keys())[:5],
    }


def _build_transform_data(findings: List[Dict]) -> Dict:
    if not findings:
        return {}

    total = len(findings)
    type_counts: Dict[str, int] = {}
    pii_counts: Dict[str, int] = {}
    law_counts: Dict[str, int] = {}
    conf_sum = 0.0

    for r in findings:
        t = r.get("transformation_type", r.get("type", "Unknown"))
        type_counts[t] = type_counts.get(t, 0) + 1

        meta = r.get("metadata", {})
        pii = meta.get("pii_type", r.get("type", "Unknown"))
        pii_counts[pii] = pii_counts.get(pii, 0) + 1

        for law in meta.get("derived_laws", r.get("mapped_laws", [])):
            law_counts[law] = law_counts.get(law, 0) + 1

        conf_sum += r.get("confidence", 0)

    return {
        "total_records": total,
        "average_confidence": round(conf_sum / total, 2) if total else 0,
        "transformation_types": [{"name": k, "value": v} for k, v in type_counts.items()],
        "pii_types": [{"name": k, "value": v} for k, v in pii_counts.items()],
        "laws_applied": list(law_counts.keys()),
    }


def _build_audit_data(audits: List[Dict]) -> Dict:
    if not audits:
        return {"total": 0, "entries": [], "pii_counts": [], "action_counts": []}

    pii_counts: Dict[str, int] = {}
    action_counts: Dict[str, int] = {}
    conf_sum = 0.0

    for a in audits:
        pii = a.get("pii", "Unknown")
        pii_counts[pii] = pii_counts.get(pii, 0) + 1
        act = a.get("act", "Unknown")
        action_counts[act] = action_counts.get(act, 0) + 1
        conf_sum += a.get("conf", 0)

    total = len(audits)
    entries = []
    for a in audits[:50]:   # cap at 50 for the UI
        ts = a.get("ts")
        entries.append({
            "pii":     a.get("pii", ""),
            "action":  a.get("act", ""),
            "laws":    a.get("laws", []),
            "phase":   a.get("phase", ""),
            "confidence": a.get("conf", 0),
            "timestamp": str(ts) if ts else "",
        })

    return {
        "total": total,
        "average_confidence": round(conf_sum / total, 2) if total else 0,
        "entries": entries,
        "pii_counts": [{"name": k, "value": v} for k, v in pii_counts.items()],
        "action_counts": [{"name": k, "value": v} for k, v in action_counts.items()],
    }


# ────────────────────────────────────────────────────────────
# POST /chat
# ────────────────────────────────────────────────────────────
@router_chat.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    admin_email: str = Depends(extract_and_verify_token),
):
    try:
        graph = await _get_graph()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Agent unavailable: {e}")

    # Resolve session
    session_id = request.session_id or str(uuid.uuid4())

    if session_id not in _sessions:
        _sessions[session_id] = {
            "messages": [],
            "session_id": session_id,
            "admin_email": admin_email,
        }

    state = _sessions[session_id]
    state["messages"].append(HumanMessage(content=request.message))

    try:
        result = await graph.ainvoke(state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {e}")

    _sessions[session_id] = result

    # Extract safe final summary
    final_msg = result["messages"][-1]
    summary = getattr(final_msg, "content", "Operation completed.")

    # Detect response type
    response_type = _detect_type(result["messages"])

    # Build structured data
    data: Dict[str, Any] = {}
    try:
        if response_type == "scan":
            raw = get_all_findings(session_id) or []
            data = _build_scan_data(raw)

        elif response_type == "transform":
            raw = get_all_findings(session_id) or []
            data = _build_transform_data(raw)

        elif response_type == "audit":
            query = AuditQuery(admin_email=admin_email, limit=100)
            audits = retrieve_audits(query)
            data = _build_audit_data(audits)

    except Exception:
        data = {}

    return ChatResponse(
        type=response_type,
        summary=summary,
        data=data,
        session_id=session_id,
    )

