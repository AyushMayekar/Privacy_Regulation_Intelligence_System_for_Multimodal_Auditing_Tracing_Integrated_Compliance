from mcp.server.fastmcp import FastMCP
from transformation_and_enforcement.core import scan_mongo, scan_gmail, mask_data, summarize_findings, notify_user, log_results
from transformation_and_enforcement.transformations import transformation_engine, DSARType, DataType, ComplianceLaw

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

# --- Analysis and Reporting Tools ---
@app.tool()
def summarize(findings: list) -> str:
    """Summarize findings into a compliance report."""
    return summarize_findings(findings)

@app.tool()
def get_transformation_recommendations(dsar_type: str, data_types: list = None, 
                                    compliance_laws: list = None) -> dict:
    """Get recommended transformations for a given DSAR type and data types."""
    try:
        dsar_enum = DSARType(dsar_type.lower())
        data_type_enums = [DataType(dt.lower()) for dt in (data_types or [])]
        compliance_enums = [ComplianceLaw(cl.lower()) for cl in (compliance_laws or [])]
        
        recommendations = transformation_engine.get_transformation_recommendation(
            dsar_enum, data_type_enums[0] if data_type_enums else DataType.IDENTIFIERS, 
            compliance_enums
        )
        
        return {
            "success": True,
            "dsar_type": dsar_type,
            "data_types": data_types or ["identifiers"],
            "compliance_laws": compliance_laws or ["gdpr"],
            "recommended_transformations": [t.value for t in recommendations],
            "explanation": f"For {dsar_type} requests with {', '.join(data_types or ['identifiers'])} data types under {', '.join(compliance_laws or ['GDPR'])} compliance"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to get transformation recommendations"
        }

# --- Utility Tools ---
@app.tool()
def notify(user_email: str, report: str) -> str:
    """Notify user with compliance report."""
    return notify_user(user_email, report)

@app.tool()
def log(db: str, results: dict) -> str:
    """Log results into audit DB."""
    return log_results(db, results)

@app.tool()
def get_compliance_status(results: dict) -> dict:
    """Get compliance status from transformation results."""
    try:
        compliance_report = results.get("compliance_report", {})
        compliance_status = compliance_report.get("compliance_status", {})
        
        return {
            "success": True,
            "overall_status": compliance_status.get("overall_status", "UNKNOWN"),
            "risk_level": compliance_status.get("risk_level", "UNKNOWN"),
            "law_specific_status": compliance_status.get("law_specific_status", {}),
            "recommendations": compliance_report.get("recommendations", [])
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to extract compliance status"
        }

if __name__ == "__main__":
    app.run()
