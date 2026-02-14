from mcp.server.fastmcp import FastMCP
from typing import List, Dict, Any
from transformation_and_enforcement.core import scan_mongo, scan_gmail, mask_data
from auditing_and_reporting.core import extract_and_store, retrieve_audits
from auditing_and_reporting.data_schema import AuditQuery

app = FastMCP("prismatic-mcp")

# --- Core Scanning Tools ---
@app.tool()
def mongo_scan(admin_email: str) -> dict:
    """Connect and Scan a MongoDB collection for PII/PHI."""
    return scan_mongo(admin_email)

@app.tool()
async def gmail_scan(user_email: str) -> dict:
    """Scan Gmail for PII/PHI."""
    return await scan_gmail(user_email)

# --- Data Transformation Tools ---
@app.tool()
def transform_data(admin_email: str, findings: list) -> dict:
    """Apply data transformations based on findings."""
    return mask_data(admin_email, findings)

# --- Auditing and Reporting Tools ---
@app.tool()
def audit_report(results: List[Dict[str, Any]],
    admin_email: str) -> None:
    """Log results into audit DB."""
    return extract_and_store(results, admin_email)

@app.tool()
async def get_audit_logs(query: AuditQuery) -> List[Dict[str, Any]]:
    """Retrieve audit logs with optional filters."""
    return retrieve_audits(query)

if __name__ == "__main__":
    app.run()
