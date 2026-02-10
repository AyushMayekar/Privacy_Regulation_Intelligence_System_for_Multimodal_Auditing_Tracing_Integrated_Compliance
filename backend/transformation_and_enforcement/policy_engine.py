from enum import Enum
from typing import List, Dict, Any
from transformation_and_enforcement.transformations import TransformationType, DSARType, DataType, ComplianceLaw, DSAR_POLICY_MAP, LAW_OVERRIDES
from datetime import datetime
import uuid

# DSAR related Stuff
class DSARStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class DSARContext:
    def __init__(
        self,
        subject_identifier: str,   
        dsar_type: DSARType,        
        source: str,          
        mapped_laws: List[str],
    ):
        self.dsar_id = str(uuid.uuid4())
        self.subject_identifier = subject_identifier
        self.dsar_type = dsar_type
        self.mapped_laws = mapped_laws
        self.source = source

        self.created_at = datetime.utcnow()
        self.status = DSARStatus.OPEN

        # populated later
        self.targeted_sources: List[str] = []
        self.affected_findings_count: int = 0

BASELINE_POLICY_MAP = {
    DataType.IDENTIFIERS: TransformationType.MASKING_DYNAMIC,
    DataType.FINANCIAL: TransformationType.TOKENIZATION,
    DataType.HEALTH: TransformationType.ANONYMIZATION,
    DataType.LOCATION: TransformationType.AGGREGATION,
    DataType.BEHAVIORAL: TransformationType.HASHING,
    DataType.BIOMETRIC: TransformationType.ANONYMIZATION,
}

LAW_TIGHTENING = {
    ComplianceLaw.GDPR: {
        DataType.IDENTIFIERS: TransformationType.MASKING_DYNAMIC,
    },
    ComplianceLaw.HIPAA: {
        DataType.HEALTH: TransformationType.ANONYMIZATION,
    },
    ComplianceLaw.PCI_DSS: {
        DataType.FINANCIAL: TransformationType.TOKENIZATION,
    },
}

class TransformationDecision:
    def __init__(
        self,
        finding: Dict[str, Any],
        transformation_type: TransformationType,
        reason: str,
        derived_from: List[str],
    ):
        self.finding = finding
        self.transformation_type = transformation_type
        self.reason = reason
        self.derived_from = derived_from

    def __repr__(self):
        return (
            f"TransformationDecision("
            f"type={self.finding.get('type')}, "
            f"transformation={self.transformation_type.value}, "
            f"reason={self.reason}, "
            f"laws={self.derived_from})"
        )

# Transformation Engine for NON DSAR findings 
def resolve(findings: List[Dict[str, Any]]) -> List[TransformationDecision]:
    decisions = []

    for finding in findings:
        pii_type = finding.get("type", "")

        mapped_laws = [
            ComplianceLaw(l.lower())
            for l in finding.get("mapped_laws", [])
            if l.lower() in ComplianceLaw._value2member_map_
        ]

        # PII → DataType mapping
        data_type = {
            "aadhaar": DataType.IDENTIFIERS,
            "pan": DataType.FINANCIAL,
            "email": DataType.IDENTIFIERS,
            "phone": DataType.IDENTIFIERS,
            "name": DataType.IDENTIFIERS,
            "address": DataType.LOCATION,
            "dob": DataType.IDENTIFIERS,
            "health": DataType.HEALTH,
            "financial_info": DataType.FINANCIAL,
            "credit_card": DataType.FINANCIAL,
            "ssn": DataType.IDENTIFIERS,
            "passport": DataType.IDENTIFIERS,
            "ip_address": DataType.BEHAVIORAL,
            "biometric": DataType.BIOMETRIC
        }.get(pii_type, DataType.IDENTIFIERS)

        # 1️⃣ Baseline decision
        transformation = BASELINE_POLICY_MAP[data_type]
        reason_chain = ["BASELINE_POLICY"]

        # 2️⃣ Law tightening (never loosens)
        for law in mapped_laws:
            tightening = LAW_TIGHTENING.get(law, {})
            if data_type in tightening:
                transformation = tightening[data_type]
                reason_chain.append(f"{law.value}_TIGHTENING")

        decisions.append(
            TransformationDecision(
                finding=finding,
                transformation_type=transformation,
                reason=" → ".join(reason_chain),
                derived_from=[law.value for law in mapped_laws],
            )
        )

    return decisions

# Transformation Engine for DSAR findings
def resolve_dsar(findings: List[Dict[str, Any]]) -> List[TransformationDecision]:
    decisions = []

    for finding in findings:
        pii_type = finding.get("type", "")
        dsar_type = DSARType(finding.get("dsar_type"))

        mapped_laws = [
            ComplianceLaw(l.lower())
            for l in finding.get("mapped_laws", [])
            if l.lower() in ComplianceLaw._value2member_map_
        ]

        data_type = {
            "email": DataType.IDENTIFIERS,
            "phone": DataType.IDENTIFIERS,
            "dob": DataType.IDENTIFIERS,
            "credit_card": DataType.FINANCIAL,
            "health": DataType.HEALTH,
            "ip_address": DataType.BEHAVIORAL,
            "address": DataType.LOCATION,
            "biometric": DataType.BIOMETRIC,
        }.get(pii_type, DataType.IDENTIFIERS)

        # 1️⃣ DSAR policy (mandatory)
        transformation = DSAR_POLICY_MAP[dsar_type][data_type]
        reason_chain = [f"DSAR_{dsar_type.value.upper()}"]

        # 2️⃣ Law overrides (can tighten but not weaken)
        for law in mapped_laws:
            override = LAW_OVERRIDES.get(law, {})
            if dsar_type in override:
                transformation = override[dsar_type]
                reason_chain.append(f"{law.value}_OVERRIDE")
            elif data_type in override:
                transformation = override[data_type]
                reason_chain.append(f"{law.value}_OVERRIDE")

        decisions.append(
            TransformationDecision(
                finding=finding,
                transformation_type=transformation,
                reason=" → ".join(reason_chain),
                derived_from=[law.value for law in mapped_laws],
            )
        )

    return decisions
