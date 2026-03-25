from server import mongo_scan, gmail_scan, run_dsar_workflow, transform_data, audit_report


TOOL_REGISTRY = {
    "mongo_scan": mongo_scan,
    "gmail_scan": gmail_scan,
    "run_dsar_workflow": run_dsar_workflow,
    "transform_data": transform_data,
    "audit_report": audit_report,
}