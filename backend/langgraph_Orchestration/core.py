from typing import List, Dict, Any
from langgraph.graph import StateGraph, START, END
from transformation_and_enforcement.core import (
    extract_dsar_contexts,
    scan_mongo,
    send_dsar_access_email,
    TargetedScanRequest
)
from transformation_and_enforcement.policy_engine import resolve_dsar
from transformation_and_enforcement.enforcement_engine import MongoEnforcer, is_enforcement_allowed
from transformation_and_enforcement.transformations import transformation_engine, DSARType
from auditing_and_reporting.core import extract_and_store
from langgraph_Orchestration.data_schema import DSARAccessState

# DSAR specific Workflow
def extract_dsar_node(state: DSARAccessState):
    contexts = extract_dsar_contexts(state["findings"])
    state["dsar_contexts"] = contexts
    return state


def dsar_branch_condition(state: DSARAccessState):
    if not state.get("dsar_contexts"):
        state["status"] = "NO_DSAR_FOUND"
        return "no_dsar"
    return "has_dsar"


def targeted_scan_node(state: DSARAccessState):
    all_findings = []

    for context in state["dsar_contexts"]:
        targeted_request = TargetedScanRequest(
            dsar_id=context.dsar_id,
            subject_identifier=context.subject_identifier,
            dsar_type=context.dsar_type,
            sources=["mongo"]
        )

        result = scan_mongo(state["admin_email"], targeted_request)
        if result.get("success"):
            mongo_findings = result.get("findings", [])
            for f in mongo_findings:
                f["dsar_type"] = context.dsar_type.value
                f["dsar_id"] = context.dsar_id
            all_findings.extend(mongo_findings)

    state["targeted_findings"] = all_findings
    return state


def resolve_dsar_node(state: DSARAccessState):
    decisions = resolve_dsar(state.get("targeted_findings", []))
    state["dsar_decisions"] = decisions
    return state


def apply_transformations_node(state: DSARAccessState):
    results = []

    for decision in state.get("dsar_decisions", []):
        value = decision.finding.get("value", "")

        transformed_value, confidence, metadata = (
            transformation_engine._apply_transformation(
                value=value,
                transformation_type=decision.transformation_type,
                finding=decision.finding,
                request=None
            )
        )

        if is_enforcement_allowed(
            dsar_type=DSARType(decision.finding.get("dsar_type"))
        ):
            MongoEnforcer.apply(
                admin_email=state["admin_email"],
                decision=decision,
                transformed_value=transformed_value
            )

        metadata.update({
            "decision_reason": decision.reason,
            "derived_laws": decision.derived_from,
            "dsar_id": decision.finding.get("dsar_id"),
            "pii_type": decision.finding.get("type"),
            "finding_timestamp": decision.finding.get("timestamp"),
            "phase": "PHASE_2_DSAR"
        })

        results.append({
            "original_value": value,
            "transformed_value": transformed_value,
            "transformation_type": decision.transformation_type.value,
            "confidence": confidence,
            "metadata": metadata
        })

    state["results"] = results
    return state


def audit_node(state: DSARAccessState):
    if not state.get("audit_logged") and state.get("results"):
        extract_and_store(
            results=state["results"],
            admin_email=state["admin_email"]
        )
        state["audit_logged"] = True
    return state


def email_node(state: DSARAccessState):
    if state.get("email_sent"):
        return state

    results = state.get("results", [])
    contexts = state.get("dsar_contexts", [])

    for context in contexts:
        if context.dsar_type != DSARType.ACCESS:
            continue

        dsar_results = [
            r for r in results
            if r.get("metadata", {}).get("dsar_id") == context.dsar_id
        ]

        if not dsar_results:
            continue

        send_dsar_access_email(
            requester_email=context.requester_email,
            dsar_id=context.dsar_id,
            results=dsar_results
        )

    state["email_sent"] = True
    state["status"] = "COMPLETED"
    return state


builder = StateGraph(DSARAccessState)

builder.add_node("extract_dsar", extract_dsar_node)
builder.add_node("targeted_scan", targeted_scan_node)
builder.add_node("resolve_dsar", resolve_dsar_node)
builder.add_node("apply_transformations", apply_transformations_node)
builder.add_node("audit", audit_node)
builder.add_node("email", email_node)

builder.add_edge(START, "extract_dsar")

builder.add_conditional_edges(
    "extract_dsar",
    dsar_branch_condition,
    {
        "no_dsar": END,
        "has_dsar": "targeted_scan"
    }
)

builder.add_edge("targeted_scan", "resolve_dsar")
builder.add_edge("resolve_dsar", "apply_transformations")
builder.add_edge("apply_transformations", "audit")
builder.add_edge("audit", "email")
builder.add_edge("email", END)

dsar_access_graph = builder.compile()


def run_dsar_access_workflow(admin_email: str, findings: List[Dict[str, Any]]):
    initial_state: DSARAccessState = {
        "admin_email": admin_email,
        "findings": findings,
        "dsar_contexts": None,
        "targeted_findings": None,
        "dsar_decisions": None,
        "results": None,
        "audit_logged": False,
        "email_sent": False,
        "status": "IN_PROGRESS"
    }

    return dsar_access_graph.invoke(initial_state)