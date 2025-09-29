from mcp.server.fastmcp import FastMCP
from mcp_agent.core import scan_mongo, scan_gmail, mask_data, summarize_findings, notify_user, log_results
from mcp_agent.transformations import transformation_engine, DSARType, DataType, ComplianceLaw

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
def transform_data(findings: list, dsar_type: str = "access", 
                    data_types: list = None, compliance_laws: list = None,
                    user_context: dict = None) -> dict:
    """
    Transform detected sensitive data using appropriate method based on DSAR type.
    
    Args:
        findings: List of PII/PHI findings from scan
        dsar_type: Type of DSAR request (access, delete, rectify, restrict_processing, portability, object_to_processing)
        data_types: List of data types to transform (identifiers, financial, health, location, behavioral, biometric)
        compliance_laws: Applicable compliance laws (gdpr, ccpa, dpdp, hipaa, pci_dss)
        user_context: Additional context for transformations (e.g., corrected_value for rectification)
    
    Returns:
        Dict with transformation results and compliance report
    """
    return mask_data(findings, dsar_type, data_types, compliance_laws, user_context)

@app.tool()
def static_masking(findings: list) -> dict:
    """Apply static masking to sensitive data (replace with fixed patterns)."""
    return mask_data(findings, "access", ["identifiers"], ["gdpr", "ccpa"])

@app.tool()
def dynamic_masking(findings: list) -> dict:
    """Apply dynamic masking (original preserved, masked shown at query time)."""
    return mask_data(findings, "access", ["identifiers", "financial"], ["gdpr"])

@app.tool()
def redact_data(findings: list) -> dict:
    """Redact (black out) entire sensitive data fields."""
    return mask_data(findings, "access", ["identifiers", "health"], ["gdpr", "hipaa"])

@app.tool()
def encrypt_deterministic(findings: list) -> dict:
    """Apply deterministic encryption (same input → same encrypted output)."""
    return mask_data(findings, "restrict_processing", ["identifiers", "financial"], ["gdpr"])

@app.tool()
def encrypt_randomized(findings: list) -> dict:
    """Apply randomized encryption (input → different output each time)."""
    return mask_data(findings, "restrict_processing", ["identifiers", "health"], ["gdpr", "hipaa"])

@app.tool()
def hash_data(findings: list) -> dict:
    """Apply irreversible hashing to sensitive data."""
    return mask_data(findings, "object_to_processing", ["behavioral", "identifiers"], ["gdpr"])

@app.tool()
def pseudonymize_data(findings: list) -> dict:
    """Replace identifiers with consistent fake values."""
    return mask_data(findings, "access", ["identifiers", "health"], ["gdpr", "hipaa"])

@app.tool()
def anonymize_data(findings: list) -> dict:
    """Strip data so it cannot be re-identified."""
    return mask_data(findings, "delete", ["health", "identifiers"], ["gdpr", "hipaa"])

@app.tool()
def tokenize_data(findings: list) -> dict:
    """Replace sensitive values with tokens (mappable back to originals)."""
    return mask_data(findings, "restrict_processing", ["financial", "identifiers"], ["gdpr", "pci_dss"])

@app.tool()
def hard_delete_data(findings: list) -> dict:
    """Permanently delete sensitive data."""
    return mask_data(findings, "delete", ["identifiers", "behavioral"], ["gdpr"])

@app.tool()
def soft_delete_data(findings: list) -> dict:
    """Mark data as deleted but keep for audit purposes."""
    return mask_data(findings, "delete", ["financial"], ["gdpr", "ccpa"])

@app.tool()
def export_data(findings: list) -> dict:
    """Export data in machine-readable format for portability."""
    return mask_data(findings, "portability", ["identifiers", "financial", "health"], ["gdpr"])

@app.tool()
def rectify_data(findings: list, corrected_values: dict = None) -> dict:
    """Update incorrect data entries."""
    user_context = {"corrected_value": corrected_values} if corrected_values else {}
    return mask_data(findings, "rectify", ["identifiers", "financial"], ["gdpr"], user_context)

@app.tool()
def aggregate_data(findings: list) -> dict:
    """Reduce granularity of data (e.g., date → year only)."""
    return mask_data(findings, "access", ["identifiers", "location"], ["gdpr"])

@app.tool()
def suppress_data(findings: list) -> dict:
    """Omit fields entirely from results."""
    return mask_data(findings, "object_to_processing", ["behavioral"], ["gdpr", "ccpa"])

@app.tool()
def perturb_data(findings: list) -> dict:
    """Add statistical noise to values for anonymization."""
    return mask_data(findings, "access", ["identifiers"], ["gdpr"])

# --- DSAR-Specific Transformation Tools ---
@app.tool()
def handle_access_request(findings: list) -> dict:
    """Handle GDPR Article 15 access requests with appropriate data masking."""
    return mask_data(findings, "access", ["identifiers", "financial", "health", "location"], ["gdpr"])

@app.tool()
def handle_delete_request(findings: list) -> dict:
    """Handle GDPR Article 17 deletion requests (right to be forgotten)."""
    return mask_data(findings, "delete", ["identifiers", "behavioral"], ["gdpr"])

@app.tool()
def handle_rectify_request(findings: list, corrections: dict = None) -> dict:
    """Handle GDPR Article 16 rectification requests."""
    user_context = {"corrected_value": corrections} if corrections else {}
    return mask_data(findings, "rectify", ["identifiers", "financial"], ["gdpr"], user_context)

@app.tool()
def handle_restrict_processing(findings: list) -> dict:
    """Handle GDPR Article 18 processing restriction requests."""
    return mask_data(findings, "restrict_processing", ["identifiers", "financial", "health"], ["gdpr"])

@app.tool()
def handle_portability_request(findings: list) -> dict:
    """Handle GDPR Article 20 data portability requests."""
    return mask_data(findings, "portability", ["identifiers", "financial", "health"], ["gdpr"])

@app.tool()
def handle_object_processing(findings: list) -> dict:
    """Handle GDPR Article 21 object to processing requests."""
    return mask_data(findings, "object_to_processing", ["behavioral", "identifiers"], ["gdpr"])

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
