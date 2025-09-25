import re, json
from typing import List, Dict, Any
from config import Integrations, cipher
from integrations.core import MongoConnection
from datetime import datetime
from pymongo import MongoClient

# --- Regex patterns for PII/PHI (MVP) ---
PII_PATTERNS = {
    "aadhaar": re.compile(r"\b\d{4}\s?\d{4}\s?\d{4}\b"),
    "pan": re.compile(r"\b[A-Z]{5}\d{4}[A-Z]\b", re.IGNORECASE),
    "email": re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"),
    "phone": re.compile(r"\b\d{10}\b"),
}
HEALTH_KEYWORDS = re.compile(r"\b(diabetes|cancer|asthma|blood sugar|diagnosis|patient)\b", re.IGNORECASE)

COMPLIANCE_MAP = {
    "aadhaar": ["DPDP"],
    "pan": ["DPDP", "GDPR"],
    "email": ["GDPR", "CCPA"],
    "phone": ["GDPR", "CCPA"],
    "health": ["HIPAA", "GDPR"]
}

def map_to_laws(pii_type: str) -> List[str]:
    return COMPLIANCE_MAP.get(pii_type, [])

def flatten_doc(doc: dict, parent: str = "") -> Dict[str, Any]:
    """
    Flatten nested dict into dotted keys.
    Always stringifies values for scanning.
    """
    out = {}
    for k, v in doc.items():
        path = f"{parent}.{k}" if parent else k
        if isinstance(v, dict):
            out.update(flatten_doc(v, path))
        elif isinstance(v, list):
            out[path] = json.dumps(v, default=str)
        else:
            out[path] = str(v) if v is not None else ""
    return out

def scan_mongo(admin_email: str):
    """
    Scan MongoDB collection for sensitive data (PII/PHI).
    Returns findings as dict.
    """
    integration = Integrations.find_one({"admin_email": admin_email})
    
    if not integration or not integration.get("MongoConnection", False):
        return {
            "success": False,
            "message": "No MongoDB connection found. Please connect via Integrations tab."
        }
    
    encrypted_uri = integration.get("encrypted_mongo_uri")
    if not encrypted_uri:
        return {"success": False, "message": "Mongo URI not found in database. Please connect via Integrations tab."}
    try:
        mongo_uri = cipher.decrypt(encrypted_uri.encode()).decode()
    except Exception as e:
        return {"success": False, "message": f"Failed to decrypt Mongo URI: {str(e)}"}

    # 🔎 Call your actual scanner logic (implement separately)
    findings = run_mongo_scan(mongo_uri, admin_email)  # you’ll build this function

    return {
        "success": True,
        "message": "Mongo scan completed",
        "findings": findings
    }

def run_mongo_scan(mongo_uri: str, admin_email: str, db_name: str = None,
                    collections: List[str] = None,
                    sample_size: int = 50) -> List[Dict[str, Any]]:
    """
    Connect to MongoDB and scan collections for PII/PHI.
    Args:
        mongo_uri: decrypted mongo connection string
    Returns:
        findings dict
    """
    
    findings = []

    connection_result = MongoConnection(mongo_uri, admin_email)
    if not connection_result.get("success"):
        raise Exception(f"Failed to connect to MongoDB: {connection_result.get('message')}")

    client: MongoClient = connection_result.get("client") 

    # Get DB list
    if db_name:
        db_names = [db_name]
    else:
        db_names = [d for d in client.list_database_names()
                    if d not in ("admin", "local", "config")]

    for dbn in db_names:
        db = client[dbn]
        coll_names = collections or db.list_collection_names()

        for coll in coll_names:
            cursor = db[coll].find({}, limit=sample_size)

            for doc in cursor:
                doc_id = str(doc.get("_id", ""))
                flat = flatten_doc(doc)

                for field_path, val_str in flat.items():
                    if not val_str.strip():
                        continue

                    matched = False
                    # --- Regex detection ---
                    for p_type, pattern in PII_PATTERNS.items():
                        m = pattern.search(val_str)
                        if m:
                            matched = True
                            findings.append({
                                "collection": f"{dbn}.{coll}",
                                "document_id": doc_id,
                                "field_path": field_path,
                                "value": m.group(0),
                                "raw_value_snippet": val_str[:200],
                                "type": p_type,
                                "confidence": 0.95,
                                "mapped_laws": map_to_laws(p_type),
                                "detector": "regex",
                                "timestamp": datetime.utcnow()
                            })

                    # --- Health keywords ---
                    if not matched and HEALTH_KEYWORDS.search(val_str):
                        findings.append({
                            "collection": f"{dbn}.{coll}",
                            "document_id": doc_id,
                            "field_path": field_path,
                            "value": val_str[:200],
                            "raw_value_snippet": val_str[:200],
                            "type": "health",
                            "confidence": 0.75,
                            "mapped_laws": map_to_laws("health"),
                            "detector": "keyword",
                            "timestamp": datetime.utcnow()
                        })

                    # --- Field name heuristic ---
                    lname = field_path.lower()
                    heuristics = {
                        "aadhaar": ["aadhaar", "aadhar"],
                        "pan": ["pan"],
                        "email": ["email", "e_mail", "mail"],
                        "phone": ["phone", "mobile", "contact"],
                        "health": ["medical", "health", "diagnosis", "patient"]
                    }
                    for p_type, keywords in heuristics.items():
                        if any(k in lname for k in keywords):
                            findings.append({
                                "collection": f"{dbn}.{coll}",
                                "document_id": doc_id,
                                "field_path": field_path,
                                "value": val_str[:200],
                                "raw_value_snippet": val_str[:200],
                                "type": p_type,
                                "confidence": 0.6,
                                "mapped_laws": map_to_laws(p_type),
                                "detector": "field-name-heuristic",
                                "timestamp": datetime.utcnow()
                            })
                            break

    client.close()
    return findings

def scan_gmail ():
    pass

def mask_data ():
    pass

def summarize_findings ():
    pass 

def notify_user ():
    pass

def log_results ():
    pass