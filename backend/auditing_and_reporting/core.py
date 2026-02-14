from typing import List, Dict, Any
from datetime import datetime, UTC
from config import Audits
import hashlib

def extract_and_store(
    results: List[Dict[str, Any]],
    admin_email: str
) -> None:
    """
    Extracts compact audit entries from transformation results
    and stores them in MongoDB as append-only documents.
    """

    if not results:
        return

    audit_docs = []

    for result in results:
        doc = _build_audit_doc(result, admin_email)
        if doc:
            audit_docs.append(doc)

    if audit_docs:
        _bulk_insert(audit_docs)

def _build_audit_doc(result: Dict[str, Any], admin_email: str) -> Dict[str, Any]:
    """
    Converts a transformation result into a compact audit document.
    """

    metadata = result.get("metadata", {})
    original_value = result.get("original_value")

    if not metadata.get("phase") or not metadata.get("pii_type"):
        return None

    if not original_value:
        return None

    return {
        "admin": admin_email,
        "dsar_id": metadata.get("dsar_id"), 
        "phase": metadata.get("phase"),
        "pii": metadata.get("pii_type"),
        "act": result.get("transformation_type"),
        "laws": metadata.get("derived_laws", []),
        "conf": result.get("confidence"),
        "vh": _hash_value(original_value),
        "ts": _normalize_timestamp(metadata.get("finding_timestamp"))
    }


def _hash_value(value: str) -> str:
    """
    Generates SHA-256 hash of original value.
    """
    normalized = value.strip().lower()
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def _normalize_timestamp(ts_value: Any) -> datetime:
    """
    Ensures timestamp is stored as datetime object.
    """
    if isinstance(ts_value, datetime):
        return ts_value

    if isinstance(ts_value, str):
        return datetime.fromisoformat(ts_value)

    return datetime.now(UTC)


def _bulk_insert(docs: List[Dict[str, Any]]) -> None:
    """
    Bulk insert audit documents.
    """
    Audits.insert_many(docs, ordered=False)
