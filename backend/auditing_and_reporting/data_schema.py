from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AuditQuery(BaseModel):
    admin_email: str = Field(..., description="Admin email to filter audit logs")

    dsar_id: Optional[str] = Field(
        default=None,
        description="Optional DSAR ID filter"
    )

    phase: Optional[str] = Field(
        default=None,
        description="Optional phase filter (PHASE_1_BASELINE / PHASE_2_DSAR)"
    )

    start_date: Optional[datetime] = Field(
        default=None,
        description="Start timestamp filter"
    )

    end_date: Optional[datetime] = Field(
        default=None,
        description="End timestamp filter"
    )

    limit: int = Field(
        default=100,
        ge=1,
        le=5000,
        description="Maximum number of records to return"
    )
