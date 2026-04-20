from fastapi import APIRouter, Depends, HTTPException, Body
from user_auth.core import extract_and_verify_token
from auditing_and_reporting.core import retrieve_audits
from auditing_and_reporting.data_schema import AuditQuery
from datetime import datetime
from typing import Optional

router_audits = APIRouter()

@router_audits.post("/logs")
async def get_audit_logs(
    payload: dict = Body(...),
    admin_email: str = Depends(extract_and_verify_token)
):
    try:
        # 🔥 Extract frontend filters safely
        limit = payload.get("limit", 100)
        phase = payload.get("phase")
        date_from = payload.get("date_from")
        date_to = payload.get("date_to")

        # 🔥 Convert dates if present
        start_date = datetime.fromisoformat(date_from) if date_from else None
        end_date = datetime.fromisoformat(date_to) if date_to else None

        # 🔥 Build internal query (THIS is where AuditQuery is used)
        query = AuditQuery(
            admin_email=admin_email,
            phase=phase,
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )

        logs = retrieve_audits(query)

        return logs

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve audit logs: {str(e)}"
        )