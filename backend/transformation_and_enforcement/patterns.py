import re

DSAR_PATTERNS = {
    "access": re.compile(
        r"\b("
        r"data subject access request|dsar|"
        r"request (?:a )?copy of (?:all )?(?:my|the) (?:data|information)|"
        r"provide (?:all )?(?:my|the) (?:personal )?(?:data|information)|"
        r"access (?:all )?(?:my|the) (?:records|data|information)|"
        r"review (?:my|the) (?:data|information)|"
        r"what (?:data|information|details) (?:you|your company) (?:hold|have)|"
        r"show me (?:everything|all) (?:you have|about me)|"
        r"details you (?:collect|store) (?:about me|on me)|"
        r"disclosure of (?:my|the) (?:data|information)"
        r")\b",
        re.IGNORECASE
    ),

    "delete": re.compile(
        r"\b("
        r"delete (?:all )?(?:my|the) (?:personal )?(?:data|information|account)|"
        r"remove (?:my|the) (?:data|information)|"
        r"erase (?:my|the) (?:data|information)|"
        r"forget me|right to be forgotten|"
        r"account deletion|data deletion|permanently delete|"
        r"stop storing (?:my|the) (?:data|information)|"
        r"request deletion of (?:data|information)"
        r")\b",
        re.IGNORECASE
    ),

    "rectify": re.compile(
        r"\b("
        r"correct (?:my|the) (?:data|information)|"
        r"update (?:my|the) (?:data|information)|"
        r"fix (?:my|the) (?:records|data|information)|"
        r"rectify (?:my|the) (?:data|information)|"
        r"change (?:my|the) (?:data|information)|"
        r"amend (?:my|the) (?:details|data)|"
        r"data correction"
        r")\b",
        re.IGNORECASE
    ),

    "port": re.compile(
        r"\b("
        r"port (?:my|the) (?:data|information)|"
        r"transfer (?:my|the) (?:data|information)|"
        r"export (?:my|the) (?:data|information)|"
        r"data portability|"
        r"migrate (?:my|the) (?:data|information)|"
        r"move (?:my|the) (?:data|information)|"
        r"provide (?:my|the) data in (?:machine readable|portable) format"
        r")\b",
        re.IGNORECASE
    ),

    "object": re.compile(
        r"\b("
        r"object to processing|restrict processing|stop processing|"
        r"opt out|withdraw consent|"
        r"stop using (?:my|the) (?:data|information)|"
        r"do not (?:sell|share|process|track) (?:my|the) (?:data|information)|"
        r"stop tracking|"
        r"block use of (?:my|the) (?:data|information)"
        r")\b",
        re.IGNORECASE
    )
}

DSAR_LABELS = ["access", "delete", "rectify", "portability", "object", 
    "withdraw_consent", "restrict_processing", "complaint", 
    "transparency", "marketing_opt_out", "unsubscribe", "privacy_policy_info"]    

# --- Regex patterns for PII/PHI (MVP) ---
PII_PATTERNS = {
    "aadhaar": re.compile(r"\b[2-9][0-9]{3}[\s-]?[0-9]{4}[\s-]?[0-9]{4}\b"),
    "pan": re.compile(r"\b[A-Z]{5}\d{4}[A-Z]\b", re.IGNORECASE),
    "email": re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"),
    "phone": re.compile(r"\b\d{10}\b"),
    "credit_card": re.compile(r"\b(?:\d[ -]*?){13,16}\b"), 
    "ssn": re.compile(r"\b\d{3}-\d{2}-\d{4}\b"), 
    "ip_address": re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b"),
    "dob": re.compile(r"\b(0?[1-9]|[12][0-9]|3[01])[- /.](0?[1-9]|1[0-2])[- /.](19|20)\d\d\b"),
    "passport": re.compile(r"\b[A-PR-WY][1-9]\d\s?\d{4}[1-9]\b", re.IGNORECASE),

}
HEALTH_KEYWORDS = re.compile(r"\b(diabetes|cancer|asthma|blood sugar|diagnosis|patient|prescription|treatment|allergy)\b", re.IGNORECASE)

COMPLIANCE_MAP = {
    "aadhaar": ["DPDP"],
    "pan": ["DPDP", "GDPR"],
    "email": ["GDPR", "CCPA"],
    "phone": ["GDPR", "CCPA"],
    "credit_card": ["PCI-DSS", "GDPR"],
    "ssn": ["HIPAA", "GDPR"],
    "ip_address": ["GDPR", "CCPA"],
    "dob": ["GDPR", "CCPA"],
    "passport": ["GDPR"],
    "health": ["HIPAA", "GDPR"]
}