import re, json, base64, asyncio, httpx
import logging
import smtplib
from typing import List, Dict, Any
from config import Integrations, cipher, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SMTP_GMAIL_APP_PASSWORD, SENDER_EMAIL
from integrations.core import MongoConnection
from datetime import datetime
from pymongo import MongoClient
from dateutil import parser
from email.utils import parseaddr
from datetime import datetime
from dotenv import load_dotenv
from auditing_and_reporting.core import extract_and_store
from transformation_and_enforcement.patterns import COMPLIANCE_MAP, DSAR_PATTERNS, HEALTH_KEYWORDS, PII_PATTERNS, DSAR_LABELS
from transformation_and_enforcement.policy_engine import resolve, DSARContext, resolve_dsar
from transformation_and_enforcement.transformations import transformation_engine, DSARType
from transformation_and_enforcement.enforcement_engine import MongoEnforcer, is_enforcement_allowed
from transformers import pipeline
from email.message import EmailMessage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

dsar_classifier = pipeline(
            "zero-shot-classification", 
            model="typeform/distilbert-base-uncased-mnli")

def normalize_value(val: str, p_type: str) -> str:
    """Normalize values for deduplication of PII/PHI."""
    val = val.strip()

    if p_type == "aadhaar":
        # Aadhaar = 12 digits
        return re.sub(r"\D", "", val)
    
    if p_type == "pan":
        # PAN = uppercase for consistency
        return val.upper()
    
    if p_type == "phone":
        # Keep only digits, last 10
        return re.sub(r"\D", "", val)[-10:]
    
    if p_type == "email":
        # Lowercase email for uniformity
        return val.lower()
    
    if p_type == "credit_card":
        # Remove all non-digits, mask spaces/hyphens
        return re.sub(r"\D", "", val)
    
    if p_type == "ssn":
        # US SSN -> digits only
        return re.sub(r"\D", "", val)
    
    if p_type == "ip_address":
        # Standardize IP to lowercase (IPv6 can have hex chars)
        return val.lower()
    
    if p_type == "dob":
        # Normalize date format -> YYYY-MM-DD
        try:
            return parser.parse(val, dayfirst=True).strftime("%Y-%m-%d")
        except Exception:
            return val  # return raw if parsing fails
    
    if p_type == "passport":
        # Uppercase passport numbers
        return val.upper()
    
    if p_type == "health":
        # For health conditions -> lowercase and strip spaces
        return val.lower()
    
    return val

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

# Targetted Scanning Logic
class TargetedScanRequest:
    def __init__(
        self,
        dsar_id: str,
        subject_identifier: str,
        dsar_type: DSARType,
        sources: List[str]
    ):
        self.dsar_id = dsar_id
        self.subject_identifier = subject_identifier
        self.dsar_type = dsar_type
        self.sources = sources
    def __repr__(self):
        return (
        f"TargetedScanRequest("
        f"dsar_id={self.dsar_id}, "
        f"subject_identifier={self.subject_identifier}, "
        f"dsar_type={self.dsar_type.value}, "
        f"sources={self.sources}"
        f")"
        )

# Mongo Scanning Logic
def scan_mongo(admin_email: str, targeted_request: TargetedScanRequest = None):
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

    findings = run_mongo_scan(mongo_uri, admin_email, targeted_request=targeted_request)

    return {
        "success": True,
        "message": "Mongo scan completed",
        "findings": findings
    }

def run_mongo_scan(mongo_uri: str, admin_email: str, db_name: str = None,
                    collections: List[str] = None,
                    sample_size: int = 50,  targeted_request: TargetedScanRequest = None) -> List[Dict[str, Any]]:
    """
    Connect to MongoDB and scan collections for PII/PHI.
    Args:
        mongo_uri: decrypted mongo connection string
    Returns:
        findings dict
    """
    
    findings = []
    seen = {}

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

                    lname = field_path.lower()
                    matched = False
                    # --- Regex detection ---
                    for p_type, pattern in PII_PATTERNS.items():
                        m = pattern.search(val_str)
                        if m:
                            norm_val = normalize_value(m.group(0), p_type)
                            if targeted_request:
                                if norm_val != targeted_request.subject_identifier:
                                    continue
                            key = (f"{dbn}.{coll}", doc_id, field_path, norm_val, p_type)
                            if key not in seen:
                                finding = {
                                "collection": f"{dbn}.{coll}",
                                "document_id": doc_id,
                                "field_path": field_path,
                                "value": m.group(0),
                                "raw_value_snippet": val_str[:200],
                                "type": p_type,
                                "confidence": 0.95,
                                "mapped_laws": map_to_laws(p_type),
                                "detectors": ["regex"],
                                "timestamp": datetime.utcnow(),
                                }
                                if targeted_request:
                                    finding["dsar_id"] = targeted_request.dsar_id
                                    finding["dsar_type"] = targeted_request.dsar_type.value
                                    finding["scan_type"] = "TARGETED"
                                seen[key] = finding
                                matched = True
                            else:
                                seen[key]["detectors"].append("regex")

                    # --- Health keywords ---
                    if not matched and HEALTH_KEYWORDS.search(val_str):
                        norm_val = normalize_value(val_str, "health")
                        if targeted_request:
                            if norm_val != targeted_request.subject_identifier:
                                continue
                        key = (f"{dbn}.{coll}", doc_id, field_path, norm_val, "health")
                        if key not in seen:
                            finding = {
                            "collection": f"{dbn}.{coll}",
                            "document_id": doc_id,
                            "field_path": field_path,
                            "value": val_str[:200],
                            "raw_value_snippet": val_str[:200],
                            "type": "health",
                            "confidence": 0.75,
                            "mapped_laws": map_to_laws("health"),
                            "detectors": ["keyword"],
                            "timestamp": datetime.utcnow(),
                        }
                            if targeted_request:
                                finding["dsar_id"] = targeted_request.dsar_id
                                finding["dsar_type"] = targeted_request.dsar_type.value
                                finding["scan_type"] = "TARGETED"
                            seen[key] = finding
                            matched = True
                        else:
                            seen[key]["detectors"].append("keyword")

                    # --- Field name heuristic ---
                    heuristics = {
                        "aadhaar": ["aadhaar", "aadhar"],
                        "pan": ["pan"],
                        "email": ["email", "e_mail", "mail"],
                        "phone": ["phone", "mobile", "contact"],
                        "dob": ["dob", "birth", "birthday", "birthdate"],
                        "passport": ["passport"],
                        "health": ["medical", "health", "diagnosis", "patient"]
                    }
                    if targeted_request:
                        for p_type, keywords in heuristics.items():
                            if any(k in lname for k in keywords):
                                norm_val = normalize_value(val_str, p_type)
                                if targeted_request:
                                    if norm_val != targeted_request.subject_identifier:
                                        continue
                                key = (f"{dbn}.{coll}", doc_id, field_path, norm_val, p_type)
                                if key not in seen:
                                    finding = {
                                    "collection": f"{dbn}.{coll}",
                                    "document_id": doc_id,
                                    "field_path": field_path,
                                    "value": val_str[:200],
                                    "raw_value_snippet": val_str[:200],
                                    "type": p_type,
                                    "confidence": 0.6,
                                    "mapped_laws": map_to_laws(p_type),
                                    "detectors": ["field-name-heuristic"],
                                    "timestamp": datetime.utcnow()
                                }
                                    if targeted_request:
                                        finding["dsar_id"] = targeted_request.dsar_id
                                        finding["dsar_type"] = targeted_request.dsar_type.value
                                        finding["scan_type"] = "TARGETED"
                                    seen[key] = finding
                                    matched = True
                                else:
                                    seen[key]["detectors"].append("field-name-heuristic")
                                break
    client.close()

    for finding in seen.values():
        detectors = set(finding["detectors"])
        if detectors == {"regex"}:
            finding["confidence"] = 0.95
        elif detectors == {"keyword"}:
            finding["confidence"] = 0.75
        elif detectors == {"field-name-heuristic"}:
            finding["confidence"] = 0.60
        elif detectors == {"regex", "field-name-heuristic"}:
            finding["confidence"] = 0.97
        elif detectors == {"regex", "keyword"}:
            finding["confidence"] = 0.96
        elif len(detectors) == 3:
            finding["confidence"] = 0.99

    findings = list(seen.values())
    return findings

# Gmail Scanning Logic
def get_refresh_token(admin_email: str) -> str:
    """Fetch and decrypt refresh token from MongoDB."""
    integration = Integrations.find_one({"admin_email": admin_email})
    if not integration or not integration.get("GmailConnection"):
        raise Exception("Gmail not connected for this admin_email")
    
    encrypted_refresh_token = integration.get("encrypted_gmail_refresh_token")
    if not encrypted_refresh_token:
        raise Exception("No refresh token found")
    
    # Decrypt token
    refresh_token = cipher.decrypt(encrypted_refresh_token.encode()).decode()
    return refresh_token

async def get_access_token(refresh_token: str) -> str:
    """Exchange refresh token for access token using Google OAuth."""
    token_url = "https://oauth2.googleapis.com/token"
    payload = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(token_url, data=payload, timeout=30.0)
        resp.raise_for_status()
        raw_bytes = await resp.aread()          
        data = json.loads(raw_bytes.decode())
    if "access_token" not in data:
        raise Exception(f"Failed to get access token: {data}")
    return data["access_token"]

async def list_emails(access_token: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """Get list of emails from Gmail API."""
    headers = {"Authorization": f"Bearer {access_token}"}
    url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults={max_results}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        raw_bytes = await resp.aread()           
        data = json.loads(raw_bytes.decode())
    return data.get("messages", [])

async def fetch_email(access_token: str, message_id: str) -> Dict[str, Any]:
    """Fetch full email content for a single message."""
    headers = {"Authorization": f"Bearer {access_token}"}
    url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}?format=full"
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        raw_bytes = await resp.aread() # read the response body asynchronously
        data = json.loads(raw_bytes.decode())
    
    # Extract headers
    headers_data = {h['name']: h.get('value', '') for h in data.get('payload', {}).get('headers', [])}
    
    # Extract body (plain text if available)
    body = ""
    for part in data.get('payload', {}).get('parts', []):
        if part.get('mimeType') == "text/plain":
            body_data = part.get('body', {}).get('data', "")
            if body_data:
                body += base64.urlsafe_b64decode(body_data.encode()).decode()
    
    return {
        "message_id": message_id,
        "thread_id": data.get("threadId"),
        "from": headers_data.get("From", ""),
        "subject": headers_data.get("Subject", ""),
        "body": body
    }

def extract_email_from_from_field(from_field: str) -> str:
    """
    Extracts a clean email address from a Gmail 'From' header.
    Returns empty string if not found.
    """
    if not from_field:
        return ""

    name, email = parseaddr(from_field)
    return email.lower().strip()

sem = asyncio.Semaphore(5)

async def fetch_with_limit(access_token, eid):
    async with sem:
        return await fetch_email(access_token, eid)

async def fetch_all_emails(access_token: str, email_ids: List[str]) -> List[Dict[str, Any]]:
    tasks = [fetch_with_limit(access_token, eid) for eid in email_ids]
    return await asyncio.gather(*tasks)

async def scan_email_content(email: Dict[str, Any], dsar_classifier=dsar_classifier) -> List[Dict[str, Any]]:
    """Scan a single email's content for PII/PHI/DSAR."""
    findings = []
    seen = {}
    # Combine headers + body
    content = f"{email['from']} {email['subject']} {email['body']}"
    
    # --- Regex PII/PHI ---
    for p_type, pattern in PII_PATTERNS.items():
        for m in pattern.finditer(content):
            norm_val = normalize_value(m.group(0), p_type)
            key = (email["message_id"], norm_val, p_type)
            if key not in seen:
                finding = {
                    "email_id": email["message_id"],
                    "thread_id": email["thread_id"],
                    "from": email["from"],
                    "subject": email["subject"],
                    "value": m.group(0),
                    "normalized_value": norm_val,
                    "type": p_type,
                    "confidence": 0.95,
                    "mapped_laws": COMPLIANCE_MAP.get(p_type, []),
                    "detectors": ["regex"],
                    "timestamp": datetime.utcnow()
                }
                seen[key] = finding
    
    # --- Health keywords ---
    for m in HEALTH_KEYWORDS.finditer(content):
        norm_val = normalize_value(m.group(0), "health")
        key = (email["message_id"], norm_val, "health")
        if key not in seen:
            finding = {
                "email_id": email["message_id"],
                "thread_id": email["thread_id"],
                "from": email["from"],
                "subject": email["subject"],
                "value": m.group(0),
                "normalized_value": norm_val,
                "type": "health",
                "confidence": 0.75,
                "mapped_laws": COMPLIANCE_MAP.get("health", []),
                "detectors": ["keyword"],
                "timestamp": datetime.utcnow()
            }
            seen[key] = finding
    
    # --- DSAR requests ---
    for dsar_type, pattern in DSAR_PATTERNS.items():
        for m in pattern.finditer(content):
            norm_val = m.group(0).lower()
            key = (email["message_id"], norm_val, "dsar")
            if key not in seen:
                finding = {
                "email_id": email["message_id"],
                "thread_id": email["thread_id"],
                "from": email["from"],
                "subject": email["subject"],
                "value": m.group(0),
                "normalized_value": norm_val,
                "type": "dsar",
                "dsar_category": dsar_type,
                "confidence": 0.85,
                "mapped_laws": ["GDPR", "CCPA"],  # DSAR is usually under these
                "detectors": ["keyword"],
                "timestamp": datetime.utcnow()
                }
                seen[key] = finding
    # NLP DSAR Detector
    result = await asyncio.to_thread(dsar_classifier, content, candidate_labels=DSAR_LABELS)
    for label, score in zip(result["labels"], result["scores"]):
        if score > 0.7:  # threshold
            key = (email["message_id"], label, "dsar")
            if key not in seen:
                finding = {
                    "email_id": email["message_id"],
                    "thread_id": email["thread_id"],
                    "from": email["from"],
                    "subject": email["subject"],
                    "value": content[:200],  # snippet for context
                    "normalized_value": label,
                    "type": "dsar",
                    "dsar_category": label,
                    "confidence": float(score),
                    "mapped_laws": ["GDPR", "CCPA"],
                    "detectors": ["zero-shot-nlp"],
                    "timestamp": datetime.utcnow()
                }
                seen[key] = finding
    
    findings = list(seen.values())
    return findings

async def scan_gmail(admin_email: str) -> List[Dict[str, Any]]:
    """Scan connected Gmail account for PII/PHI and DSAR requests."""
    
    # Get decrypted refresh token
    refresh_token = get_refresh_token(admin_email)
    
    # Exchange refresh token for access token
    access_token = await get_access_token(refresh_token)
    
    # List emails (first 50 by default)
    emails = await list_emails(access_token)
    email_ids = [e["id"] for e in emails]
    all_emails = await fetch_all_emails(access_token, email_ids)

    
    tasks = [scan_email_content(e, dsar_classifier = dsar_classifier) for e in all_emails]
    all_findings = await asyncio.gather(*tasks)
    
    return [f for sublist in all_findings for f in sublist]

# Data Transformation Logic
def route_findings(findings):
    baseline = []
    dsar = []

    for f in findings:
        if f.get("type") == "dsar":
            dsar.append(f)
        else:
            baseline.append(f)
    return baseline, dsar

def mask_data(admin_email, findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    try:
        baseline_findings, dsar_findings = route_findings(findings)
        results = []
        if baseline_findings:
            decisions = resolve(baseline_findings)
            for decision in decisions:
                value = decision.finding.get("value", "")

                transformed_value, confidence, metadata = (
                    transformation_engine._apply_transformation(
                        value=value,
                        transformation_type=decision.transformation_type,
                        finding=decision.finding,
                        request=None  
                    )
                )

                metadata.update({
                    "decision_reason": decision.reason,
                    "derived_laws": decision.derived_from,
                    "phase": "PHASE_1_BASELINE",
                    "pii_type": decision.finding.get("type"),
                    "finding_timestamp": decision.finding.get("timestamp")
                })

                results.append({
                    "original_value": value,
                    "transformed_value": transformed_value,
                    "transformation_type": decision.transformation_type.value,
                    "confidence": confidence,
                    "metadata": metadata
                })

        if dsar_findings:
            dsar_contexts = extract_dsar_contexts(dsar_findings)
            all_targeted_findings = []
            for context in dsar_contexts:
                targeted_request = TargetedScanRequest(
                    dsar_id=context.dsar_id,
                    subject_identifier=context.subject_identifier,
                    dsar_type=context.dsar_type,
                    sources=["mongo"]
                )
                scan_result = scan_mongo(admin_email, targeted_request=targeted_request)
                all_targeted_findings.extend(scan_result.get("findings", []))

            dsar_decisions = resolve_dsar(all_targeted_findings)

            for decision in dsar_decisions:
                value = decision.finding.get("value", "")

                transformed_value, confidence, metadata = (
                    transformation_engine._apply_transformation(
                        value=value,
                        transformation_type=decision.transformation_type,
                        finding=decision.finding,
                        request=None
                    )
                )
                
                if is_enforcement_allowed(dsar_type = DSARType(decision.finding.get("dsar_type"))):
                    MongoEnforcer.apply(
                        admin_email=admin_email,
                        decision=decision,
                        transformed_value=transformed_value
                    )

                metadata.update({
                    "decision_reason": decision.reason,
                    "derived_laws": decision.derived_from,
                    "dsar_id": decision.finding.get("dsar_id"),
                    "pii_type": decision.finding.get("type"),
                    "finding_timestamp": decision.finding.get("timestamp"),
                    "phase": "PHASE_2_DSAR"
                })

                results.append({
                    "original_value": value,
                    "transformed_value": transformed_value,
                    "transformation_type": decision.transformation_type.value,
                    "confidence": confidence,
                    "metadata": metadata
                })
# Send DSAR access emails with results
            for context in dsar_contexts:
                if context.dsar_type != "access":
                    continue

                dsar_results = [
                    r for r in results
                    if r.get("metadata", {}).get("dsar_id") == context.dsar_id
                ]

                if not dsar_results:
                    continue

                send_dsar_access_email(
                    requester_email=context.requester_email,
                    dsar_id=context.dsar_id,
                    results=dsar_results
                )

        extract_and_store(results, admin_email)

        return {
            "success": True,
            "results": results
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# DSAR Transformation/Handling Logic
def extract_dsar_contexts(gmail_findings):
    """Extract DSAR contexts from Gmail findings."""
    dsar_contexts = []
    for f in gmail_findings:
        if f.get("dsar_id"):
            continue

        if f.get("type") != "dsar":
            continue

        context = DSARContext(
            subject_identifier = f.get("normalized_value") or f.get("value"),
            requester_email=extract_email_from_from_field(f.get("from")),
            dsar_type=DSARType(f.get("dsar_category")),
            source="gmail",
            mapped_laws=f.get("mapped_laws", [])
        )

        dsar_contexts.append(context)
    return dsar_contexts

# Send Emails Logic (Responding to DSARs)
def send_dsar_access_email(requester_email: str, dsar_id: str, results: list):
    payload = {
        "dsar_id": dsar_id,
        "record_count": len(results),
        "data": [
            {
                "transformed_value": r["transformed_value"],
                "pii_type": r["metadata"].get("pii_type"),
                "confidence": r.get("confidence")
            }
            for r in results
        ]
    }

    payload_bytes = json.dumps(payload, indent=2).encode("utf-8")

    send_email_with_attachment(
        to_email=requester_email,
        subject="Your Data Access Request (DSAR)",
        body="Attached is your requested personal data.",
        attachment_bytes=payload_bytes,
        filename=f"dsar-access-{dsar_id}.json"
    )

def send_email_with_attachment(
    to_email: str,
    subject: str,
    body: str,
    attachment_bytes: bytes,
    filename: str
):
    sender_email = SENDER_EMAIL
    smtp_gmail_app_password = SMTP_GMAIL_APP_PASSWORD
    msg = EmailMessage()
    msg["To"] = to_email
    msg["From"] = sender_email
    msg["Subject"] = subject
    msg.set_content(body)

    msg.add_attachment(
        attachment_bytes,
        maintype="application",
        subtype="json",
        filename=filename
    )

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender_email, smtp_gmail_app_password)
        server.send_message(msg)