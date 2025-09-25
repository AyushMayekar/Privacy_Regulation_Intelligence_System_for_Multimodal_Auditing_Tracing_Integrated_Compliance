from mcp.server.fastmcp import FastMCP
from mcp_agent.core import scan_mongo, scan_gmail, mask_data, summarize_findings, notify_user, log_results

app = FastMCP("prismatic-mcp")

# --- Tools exposed via MCP ---
@app.tool()
def mongo_scan(admin_email) -> dict:
    """Connect and Scan a MongoDB collection for PII/PHI."""
    return scan_mongo(admin_email)

@app.tool()
def gmail_scan(user_email: str) -> dict:
    """Scan Gmail for PII/PHI."""
    return scan_gmail(user_email)

@app.tool()
def mask(findings: list) -> list:
    """Mask detected sensitive data."""
    return mask_data(findings)

@app.tool()
def summarize(findings: list) -> str:
    """Summarize findings into a compliance report."""
    return summarize_findings(findings)

@app.tool()
def notify(user_email: str, report: str) -> str:
    """Notify user with compliance report."""
    return notify_user(user_email, report)

@app.tool()
def log(db: str, results: dict) -> str:
    """Log results into audit DB."""
    return log_results(db, results)


if __name__ == "__main__":
    app.run()
