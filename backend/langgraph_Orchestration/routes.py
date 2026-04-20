from fastapi import APIRouter, HTTPException, Depends
from user_auth.core import extract_and_verify_token
from temp_storage import get_all_findings
from chat.routes import _sessions  

router_findings = APIRouter()


# ─────────────────────────────────────────────
# 🧠 Transform Findings (same logic as agent)
# ─────────────────────────────────────────────
def transform_findings(findings):
    total = len(findings)

    pii_counts = {}
    field_counts = {}
    law_counts = {}
    confidence_sum = 0

    for f in findings:
        pii = f.get("type", "unknown")
        pii_counts[pii] = pii_counts.get(pii, 0) + 1

        field = f.get("field_path", "unknown")
        field_counts[field] = field_counts.get(field, 0) + 1

        for law in f.get("mapped_laws", []):
            law_counts[law] = law_counts.get(law, 0) + 1

        confidence_sum += f.get("confidence", 0)

    avg_conf = (confidence_sum / total) if total else 0

    return {
        "total_findings": total,
        "avg_confidence": round(avg_conf * 100),
        "pii_distribution": pii_counts,
        "field_distribution": field_counts,
        "law_distribution": law_counts,
    }


# ─────────────────────────────────────────────
# 📡 GET /findings/latest
# ─────────────────────────────────────────────
@router_findings.get("/latest")
async def get_findings(
    session_id: str,
    admin_email: str = Depends(extract_and_verify_token),
):
    try:
        # 🔒 Validate session ownership
        state = _sessions.get(session_id)

        if not state:
            return {
                "status": "empty",
                "message": "No active session found. Run a scan first."
            }

        if state.get("admin_email") != admin_email:
            raise HTTPException(status_code=403, detail="Unauthorized session access")

        # 📦 Fetch findings from SQLite
        raw_findings = get_all_findings(session_id)

        if not raw_findings:
            return {
                "status": "empty",
                "message": "No findings available. Run a scan using the AI agent."
            }

        # 🧠 Transform into UI-ready analytics
        data = transform_findings(raw_findings)

        return {
            "status": "success",
            "data": data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch findings: {str(e)}")