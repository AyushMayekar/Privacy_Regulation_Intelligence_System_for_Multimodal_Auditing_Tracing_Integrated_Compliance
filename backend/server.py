from mcp.server.fastmcp import FastMCP
from typing import List, Dict, Any, Optional
from temp_storage import get_all_findings
from transformation_and_enforcement.core import scan_mongo, scan_gmail, mask_data
from auditing_and_reporting.core import retrieve_audits
from auditing_and_reporting.data_schema import AuditQuery

app = FastMCP("prismatic-mcp")

# --- Core Scanning Tools ---
@app.tool()
def mongo_scan(admin_email: str, session_id: str) -> dict:
    """Connect and Scan a MongoDB collection for PII/PHI."""
    return scan_mongo(admin_email)

@app.tool()
async def gmail_scan(admin_email: str, session_id: str) -> dict:
    """Scan Gmail for PII/PHI."""
    return await scan_gmail(admin_email)

# --- Data Transformation Tools ---
@app.tool()
def transform_data(admin_email: str, session_id: str) -> dict:
    """Apply data transformations based on findings."""
    findings = get_all_findings(session_id)
    if not findings:
        return {"error": "No findings available for transformation"}
    return mask_data(admin_email, findings)


# retrieve audit logs
@app.tool()
async def get_audit_logs(
    admin_email: str,
    session_id: Optional[str] = None,
    dsar_id: Optional[str] = None,
    phase: Optional[str] = None
) -> List[Dict[str, Any]]:
    
    query = AuditQuery(
        admin_email=admin_email,
        dsar_id=dsar_id,
        phase=phase
    )

    return retrieve_audits(query)

if __name__ == "__main__":
    app.run()
