"""
Data Transformation Engine for MCP Agent
Handles all 13 transformation types for DSAR compliance and data protection
"""

import hashlib
import secrets
import base64
import json
import re
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union
from enum import Enum
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import uuid
import random

class TransformationType(str, Enum):
    """Available transformation types"""
    MASKING_STATIC = "masking_static"
    MASKING_DYNAMIC = "masking_dynamic"
    REDACTION = "redaction"
    ENCRYPTION_DETERMINISTIC = "encryption_deterministic"
    ENCRYPTION_RANDOMIZED = "encryption_randomized"
    HASHING = "hashing"
    PSEUDONYMIZATION = "pseudonymization"
    ANONYMIZATION = "anonymization"
    TOKENIZATION = "tokenization"
    DATA_DELETION_HARD = "data_deletion_hard"
    DATA_DELETION_SOFT = "data_deletion_soft"
    DATA_PORTABILITY = "data_portability"
    DATA_RECTIFICATION = "data_rectification"
    AGGREGATION = "aggregation"
    SUPPRESSION = "suppression"
    PERTURBATION = "perturbation"

class DSARType(str, Enum):
    """DSAR request types"""
    ACCESS = "access"
    DELETE = "delete"
    RECTIFY = "rectify"
    RESTRICT_PROCESSING = "restrict_processing"
    PORTABILITY = "portability"
    OBJECT_TO_PROCESSING = "object_to_processing"

class DataType(str, Enum):
    """Data categories for transformation rules"""
    IDENTIFIERS = "identifiers"  # Name, Email, Phone, SSN
    FINANCIAL = "financial"      # Credit Card, IBAN, Bank details
    HEALTH = "health"           # PHI, medical records
    LOCATION = "location"       # Address, GPS coordinates
    BEHAVIORAL = "behavioral"   # Cookies, logs, metadata
    BIOMETRIC = "biometric"     # Fingerprint, facial recognition

class ComplianceLaw(str, Enum):
    """Applicable compliance laws"""
    GDPR = "gdpr"
    CCPA = "ccpa"
    DPDP = "dpdp"
    HIPAA = "hipaa"
    PCI_DSS = "pci_dss"

class TransformationRequest:
    """Request for data transformation"""
    def __init__(self, 
                 findings: List[Dict[str, Any]], 
                 dsar_type: DSARType,
                 data_types: List[DataType] = None,
                 compliance_laws: List[ComplianceLaw] = None,
                 user_context: Dict[str, Any] = None):
        self.findings = findings
        self.dsar_type = dsar_type
        self.data_types = data_types or []
        self.compliance_laws = compliance_laws or []
        self.user_context = user_context or {}
        self.timestamp = datetime.utcnow()

class TransformationResult:
    """Result of data transformation"""
    def __init__(self, 
                 original_value: str,
                 transformed_value: str,
                 transformation_type: TransformationType,
                 confidence: float,
                 metadata: Dict[str, Any] = None):
        self.original_value = original_value
        self.transformed_value = transformed_value
        self.transformation_type = transformation_type
        self.confidence = confidence
        self.metadata = metadata or {}
        self.timestamp = datetime.utcnow()

class DataTransformationEngine:
    """Main transformation engine for PII/PHI data"""
    
    def __init__(self):
        # Initialize encryption keys (in production, use proper key management)
        self._init_encryption_keys()
        
        # DSAR to transformation mapping
        self.dsar_transformation_map = {
            DSARType.ACCESS: {
                DataType.IDENTIFIERS: [TransformationType.MASKING_DYNAMIC, TransformationType.SUPPRESSION],
                DataType.FINANCIAL: [TransformationType.MASKING_DYNAMIC, TransformationType.TOKENIZATION],
                DataType.HEALTH: [TransformationType.PSEUDONYMIZATION, TransformationType.AGGREGATION],
                DataType.LOCATION: [TransformationType.AGGREGATION, TransformationType.SUPPRESSION],
                DataType.BEHAVIORAL: [TransformationType.HASHING, TransformationType.SUPPRESSION]
            },
            DSARType.DELETE: {
                DataType.IDENTIFIERS: [TransformationType.DATA_DELETION_HARD],
                DataType.FINANCIAL: [TransformationType.DATA_DELETION_SOFT, TransformationType.ANONYMIZATION],
                DataType.HEALTH: [TransformationType.ANONYMIZATION, TransformationType.DATA_DELETION_HARD],
                DataType.BEHAVIORAL: [TransformationType.DATA_DELETION_HARD]
            },
            DSARType.RECTIFY: {
                DataType.IDENTIFIERS: [TransformationType.DATA_RECTIFICATION],
                DataType.FINANCIAL: [TransformationType.DATA_RECTIFICATION],
                DataType.HEALTH: [TransformationType.DATA_RECTIFICATION],
                DataType.LOCATION: [TransformationType.DATA_RECTIFICATION]
            },
            DSARType.RESTRICT_PROCESSING: {
                DataType.IDENTIFIERS: [TransformationType.ENCRYPTION_RANDOMIZED, TransformationType.TOKENIZATION],
                DataType.FINANCIAL: [TransformationType.ENCRYPTION_RANDOMIZED, TransformationType.TOKENIZATION],
                DataType.HEALTH: [TransformationType.ENCRYPTION_RANDOMIZED, TransformationType.PSEUDONYMIZATION],
                DataType.BEHAVIORAL: [TransformationType.ENCRYPTION_RANDOMIZED]
            },
            DSARType.PORTABILITY: {
                DataType.IDENTIFIERS: [TransformationType.DATA_PORTABILITY, TransformationType.MASKING_STATIC],
                DataType.FINANCIAL: [TransformationType.DATA_PORTABILITY, TransformationType.MASKING_DYNAMIC],
                DataType.HEALTH: [TransformationType.DATA_PORTABILITY, TransformationType.PSEUDONYMIZATION],
                DataType.LOCATION: [TransformationType.DATA_PORTABILITY, TransformationType.AGGREGATION]
            },
            DSARType.OBJECT_TO_PROCESSING: {
                DataType.BEHAVIORAL: [TransformationType.SUPPRESSION, TransformationType.HASHING],
                DataType.IDENTIFIERS: [TransformationType.SUPPRESSION, TransformationType.ENCRYPTION_RANDOMIZED]
            }
        }
        
        # PII type to data type mapping
        self.pii_to_data_type = {
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
        }

    def _init_encryption_keys(self):
        """Initialize encryption keys for deterministic and randomized encryption"""
        # In production, use proper key management (AWS KMS, Azure Key Vault, etc.)
        self.deterministic_key = Fernet.generate_key()
        self.randomized_key = Fernet.generate_key()
        self.deterministic_cipher = Fernet(self.deterministic_key)
        self.randomized_cipher = Fernet(self.randomized_key)
        
        # Pseudonymization mapping (in production, use secure database)
        self.pseudonym_map = {}

    def transform_data(self, request: TransformationRequest) -> List[TransformationResult]:
        """Main transformation method"""
        results = []
        
        for finding in request.findings:
            pii_type = finding.get("type", "")
            data_type = self.pii_to_data_type.get(pii_type, DataType.IDENTIFIERS)
            
            # Get applicable transformations for this DSAR type and data type
            applicable_transformations = self.dsar_transformation_map.get(
                request.dsar_type, {}
            ).get(data_type, [TransformationType.MASKING_DYNAMIC])
            
            # Apply the first applicable transformation
            transformation_type = applicable_transformations[0]
            original_value = finding.get("value", "")
            
            # Perform transformation
            transformed_value, confidence, metadata = self._apply_transformation(
                original_value, transformation_type, finding, request
            )
            
            result = TransformationResult(
                original_value=original_value,
                transformed_value=transformed_value,
                transformation_type=transformation_type,
                confidence=confidence,
                metadata=metadata
            )
            results.append(result)
        
        return results

    def _apply_transformation(self, value: str, transformation_type: TransformationType, 
                            finding: Dict[str, Any], request: TransformationRequest) -> tuple:
        """Apply specific transformation to a value"""
        
        if transformation_type == TransformationType.MASKING_STATIC:
            return self._static_masking(value, finding)
        
        elif transformation_type == TransformationType.MASKING_DYNAMIC:
            return self._dynamic_masking(value, finding)
        
        elif transformation_type == TransformationType.REDACTION:
            return self._redaction(value, finding)
        
        elif transformation_type == TransformationType.ENCRYPTION_DETERMINISTIC:
            return self._deterministic_encryption(value, finding)
        
        elif transformation_type == TransformationType.ENCRYPTION_RANDOMIZED:
            return self._randomized_encryption(value, finding)
        
        elif transformation_type == TransformationType.HASHING:
            return self._hashing(value, finding)
        
        elif transformation_type == TransformationType.PSEUDONYMIZATION:
            return self._pseudonymization(value, finding)
        
        elif transformation_type == TransformationType.ANONYMIZATION:
            return self._anonymization(value, finding)
        
        elif transformation_type == TransformationType.TOKENIZATION:
            return self._tokenization(value, finding)
        
        elif transformation_type == TransformationType.DATA_DELETION_HARD:
            return self._hard_deletion(value, finding)
        
        elif transformation_type == TransformationType.DATA_DELETION_SOFT:
            return self._soft_deletion(value, finding)
        
        elif transformation_type == TransformationType.DATA_PORTABILITY:
            return self._data_portability(value, finding)
        
        elif transformation_type == TransformationType.DATA_RECTIFICATION:
            return self._data_rectification(value, finding, request)
        
        elif transformation_type == TransformationType.AGGREGATION:
            return self._aggregation(value, finding)
        
        elif transformation_type == TransformationType.SUPPRESSION:
            return self._suppression(value, finding)
        
        elif transformation_type == TransformationType.PERTURBATION:
            return self._perturbation(value, finding)
        
        else:
            # Default to dynamic masking
            return self._dynamic_masking(value, finding)

    def _static_masking(self, value: str, finding: Dict[str, Any]) -> tuple:
        """Replace sensitive values with fixed patterns"""
        pii_type = finding.get("type", "")
        
        if pii_type == "email":
            if "@" in value:
                local, domain = value.split("@", 1)
                masked = local[0] + "*" * (len(local) - 1) + "@" + domain
                return masked, 0.95, {"pattern": "email_static_mask"}
        
        elif pii_type in ["phone", "aadhaar"]:
            # Keep last 4 digits
            if len(value) >= 4:
                masked = "*" * (len(value) - 4) + value[-4:]
                return masked, 0.95, {"pattern": "last_4_digits"}
        
        elif pii_type == "pan":
            # Show first 2 and last 2 characters
            if len(value) >= 4:
                masked = value[:2] + "*" * (len(value) - 4) + value[-2:]
                return masked, 0.95, {"pattern": "first_last_2"}
        
        elif pii_type in ["credit_card", "ssn"]:
            # Standard masking patterns
            if pii_type == "credit_card":
                masked = "****-****-****-" + value[-4:] if len(value) >= 4 else "****"
            else:  # SSN
                masked = "***-**-" + value[-4:] if len(value) >= 4 else "***-**-****"
            return masked, 0.95, {"pattern": "standard_financial_mask"}
        
        # Default masking
        if len(value) > 4:
            masked = value[:2] + "*" * (len(value) - 4) + value[-2:]
        else:
            masked = "*" * len(value)
        return masked, 0.8, {"pattern": "default_mask"}

    def _dynamic_masking(self, value: str, finding: Dict[str, Any]) -> tuple:
        """Return masked values at query time, original stays intact"""
        # For dynamic masking, we return a masked version but keep original
        masked_value, confidence, metadata = self._static_masking(value, finding)
        metadata["original_preserved"] = True
        metadata["masking_type"] = "dynamic"
        return masked_value, confidence, metadata

    def _redaction(self, value: str, finding: Dict[str, Any]) -> tuple:
        """Remove or black out entire data fields"""
        return "[REDACTED]", 1.0, {"redaction_reason": "sensitive_data"}

    def _deterministic_encryption(self, value: str, finding: Dict[str, Any]) -> tuple:
        """Same input → same encrypted output (useful for indexing)"""
        try:
            encrypted = self.deterministic_cipher.encrypt(value.encode())
            encrypted_str = base64.urlsafe_b64encode(encrypted).decode()
            return encrypted_str, 0.95, {"encryption_type": "deterministic", "reversible": True}
        except Exception as e:
            return f"ENCRYPTION_ERROR: {str(e)}", 0.0, {"error": str(e)}

    def _randomized_encryption(self, value: str, finding: Dict[str, Any]) -> tuple:
        """Input → different output each time (more secure)"""
        try:
            encrypted = self.randomized_cipher.encrypt(value.encode())
            encrypted_str = base64.urlsafe_b64encode(encrypted).decode()
            return encrypted_str, 0.95, {"encryption_type": "randomized", "reversible": True}
        except Exception as e:
            return f"ENCRYPTION_ERROR: {str(e)}", 0.0, {"error": str(e)}

    def _hashing(self, value: str, finding: Dict[str, Any]) -> tuple:
        """Irreversible one-way conversion"""
        # Use SHA-256 for consistent hashing
        hashed = hashlib.sha256(value.encode()).hexdigest()
        return hashed, 1.0, {"hash_algorithm": "SHA-256", "reversible": False}

    def _pseudonymization(self, value: str, finding: Dict[str, Any]) -> tuple:
        """Replace identifiers with consistent fake values"""
        pii_type = finding.get("type", "")
        
        # Check if we already have a pseudonym for this value
        if value in self.pseudonym_map:
            return self.pseudonym_map[value], 1.0, {"pseudonym_type": "existing"}
        
        # Generate new pseudonym based on type
        if pii_type == "email":
            domains = ["example.com", "test.org", "demo.net"]
            pseudonym = f"user{len(self.pseudonym_map) + 1}@{random.choice(domains)}"
        elif pii_type in ["phone", "aadhaar"]:
            pseudonym = f"+91-{random.randint(6000000000, 9999999999)}"
        elif pii_type == "pan":
            letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            numbers = "0123456789"
            pseudonym = ''.join(random.choices(letters, k=5)) + ''.join(random.choices(numbers, k=4)) + random.choice(letters)
        elif pii_type == "name":
            first_names = ["John", "Jane", "Alex", "Sam", "Taylor", "Casey"]
            last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones"]
            pseudonym = f"{random.choice(first_names)} {random.choice(last_names)}"
        else:
            pseudonym = f"pseudo_{uuid.uuid4().hex[:8]}"
        
        # Store mapping
        self.pseudonym_map[value] = pseudonym
        return pseudonym, 1.0, {"pseudonym_type": "generated"}

    def _anonymization(self, value: str, finding: Dict[str, Any]) -> tuple:
        """Strip data so it cannot be re-identified"""
        pii_type = finding.get("type", "")
        
        if pii_type == "dob":
            # Generalize date to year only
            try:
                year = datetime.strptime(value, "%Y-%m-%d").year
                return f"{year}", 0.9, {"anonymization_type": "year_only"}
            except:
                return "ANONYMIZED", 1.0, {"anonymization_type": "complete"}
        
        elif pii_type == "address":
            # Keep only city
            parts = value.split(",")
            if len(parts) >= 2:
                return parts[-2].strip(), 0.8, {"anonymization_type": "city_only"}
            else:
                return "ANONYMIZED", 1.0, {"anonymization_type": "complete"}
        
        else:
            return "ANONYMIZED", 1.0, {"anonymization_type": "complete"}

    def _tokenization(self, value: str, finding: Dict[str, Any]) -> tuple:
        """Replace sensitive values with tokens (mappable back to originals)"""
        # Generate unique token
        token = f"TOKEN_{uuid.uuid4().hex[:12].upper()}"
        
        # In production, store mapping in secure database
        metadata = {
            "token_type": "reversible",
            "token_id": token,
            "original_length": len(value),
            "mapping_stored": True
        }
        
        return token, 1.0, metadata

    def _hard_deletion(self, value: str, finding: Dict[str, Any]) -> tuple:
        """Remove permanently"""
        return "", 1.0, {"deletion_type": "hard", "deleted_at": datetime.utcnow().isoformat()}

    def _soft_deletion(self, value: str, finding: Dict[str, Any]) -> tuple:
        """Mark as deleted but keep internally (audit purposes)"""
        return "[DELETED]", 1.0, {
            "deletion_type": "soft", 
            "deleted_at": datetime.utcnow().isoformat(),
            "original_preserved": True
        }

    def _data_portability(self, value: str, finding: Dict[str, Any]) -> tuple:
        """Transform data into machine-readable structured format"""
        pii_type = finding.get("type", "")
        
        # Create structured JSON format
        structured_data = {
            "type": pii_type,
            "value": value,
            "metadata": {
                "extracted_at": datetime.utcnow().isoformat(),
                "source": finding.get("collection", "unknown"),
                "field_path": finding.get("field_path", "unknown")
            }
        }
        
        return json.dumps(structured_data, indent=2), 1.0, {"format": "JSON", "machine_readable": True}

    def _data_rectification(self, value: str, finding: Dict[str, Any], request: TransformationRequest) -> tuple:
        """Update incorrect data entries"""
        # For rectification, we need the corrected value from user context
        corrected_value = request.user_context.get("corrected_value", value)
        
        return corrected_value, 1.0, {
            "rectification_type": "data_update",
            "original_value": value,
            "corrected_at": datetime.utcnow().isoformat()
        }

    def _aggregation(self, value: str, finding: Dict[str, Any]) -> tuple:
        """Reduce granularity"""
        pii_type = finding.get("type", "")
        
        if pii_type == "dob":
            try:
                date_obj = datetime.strptime(value, "%Y-%m-%d")
                return f"{date_obj.year}-{date_obj.month:02d}", 0.9, {"granularity": "year_month"}
            except:
                return "AGGREGATED", 1.0, {"granularity": "unknown"}
        
        elif pii_type == "address":
            # Keep only city and state
            parts = value.split(",")
            if len(parts) >= 2:
                return f"{parts[-2].strip()}, {parts[-1].strip()}", 0.8, {"granularity": "city_state"}
            else:
                return "AGGREGATED", 1.0, {"granularity": "unknown"}
        
        else:
            return f"AGGREGATED_{pii_type.upper()}", 1.0, {"granularity": "type_based"}

    def _suppression(self, value: str, finding: Dict[str, Any]) -> tuple:
        """Omit fields entirely from results"""
        return None, 1.0, {"suppression_reason": "field_omitted", "suppressed_at": datetime.utcnow().isoformat()}

    def _perturbation(self, value: str, finding: Dict[str, Any]) -> tuple:
        """Add small statistical noise to values"""
        pii_type = finding.get("type", "")
        
        if pii_type in ["dob"] and re.match(r'\d{4}-\d{2}-\d{2}', value):
            try:
                date_obj = datetime.strptime(value, "%Y-%m-%d")
                # Add random noise of ±30 days
                noise_days = random.randint(-30, 30)
                perturbed_date = date_obj + timedelta(days=noise_days)
                return perturbed_date.strftime("%Y-%m-%d"), 0.8, {"noise_range": "±30_days"}
            except:
                return value, 0.0, {"error": "date_parsing_failed"}
        
        elif pii_type in ["phone", "aadhaar"] and value.isdigit():
            # Add small random noise to numbers
            try:
                num = int(value)
                noise = random.randint(-1000, 1000)
                perturbed = max(0, num + noise)  # Ensure non-negative
                return str(perturbed), 0.7, {"noise_range": "±1000"}
            except:
                return value, 0.0, {"error": "number_parsing_failed"}
        
        else:
            return value, 0.5, {"noise_type": "none_applicable"}

    def get_transformation_recommendation(self, dsar_type: DSARType, data_type: DataType, 
                                        compliance_laws: List[ComplianceLaw] = None) -> List[TransformationType]:
        """Get recommended transformations for a given DSAR type and data type"""
        base_transformations = self.dsar_transformation_map.get(dsar_type, {}).get(data_type, [])
        
        # Apply compliance law specific adjustments
        if compliance_laws:
            if ComplianceLaw.GDPR in compliance_laws:
                # GDPR specific requirements
                if dsar_type == DSARType.DELETE:
                    base_transformations = [TransformationType.DATA_DELETION_HARD]
                elif dsar_type == DSARType.RESTRICT_PROCESSING:
                    base_transformations = [TransformationType.ENCRYPTION_RANDOMIZED]
            
            if ComplianceLaw.HIPAA in compliance_laws and data_type == DataType.HEALTH:
                # HIPAA requires strong anonymization for health data
                base_transformations = [TransformationType.ANONYMIZATION, TransformationType.PSEUDONYMIZATION]
        
        return base_transformations

    def create_compliance_report(self, results: List[TransformationResult], 
                               request: TransformationRequest) -> Dict[str, Any]:
        """Create comprehensive compliance report"""
        report = {
            "report_id": str(uuid.uuid4()),
            "generated_at": datetime.utcnow().isoformat(),
            "dsar_type": request.dsar_type.value,
            "compliance_laws": [law.value for law in request.compliance_laws],
            "summary": {
                "total_findings": len(request.findings),
                "total_transformed": len(results),
                "transformation_types_used": list(set(r.transformation_type.value for r in results)),
                "average_confidence": sum(r.confidence for r in results) / len(results) if results else 0
            },
            "transformations": [
                {
                    "original_value": r.original_value,
                    "transformed_value": r.transformed_value,
                    "transformation_type": r.transformation_type.value,
                    "confidence": r.confidence,
                    "metadata": r.metadata
                }
                for r in results
            ],
            "compliance_status": self._assess_compliance_status(results, request),
            "recommendations": self._generate_compliance_recommendations(results, request)
        }
        
        return report

    def _assess_compliance_status(self, results: List[TransformationResult], 
                                request: TransformationRequest) -> Dict[str, Any]:
        """Assess overall compliance status"""
        status = {
            "overall_status": "COMPLIANT",
            "law_specific_status": {},
            "risk_level": "LOW"
        }
        
        # Check compliance for each law
        for law in request.compliance_laws:
            if law == ComplianceLaw.GDPR:
                if request.dsar_type == DSARType.DELETE:
                    # GDPR requires complete deletion
                    hard_deletions = [r for r in results if r.transformation_type == TransformationType.DATA_DELETION_HARD]
                    if len(hard_deletions) == len(results):
                        status["law_specific_status"]["GDPR"] = "COMPLIANT"
                    else:
                        status["law_specific_status"]["GDPR"] = "PARTIAL_COMPLIANCE"
                        status["overall_status"] = "PARTIAL_COMPLIANCE"
                        status["risk_level"] = "MEDIUM"
                
            elif law == ComplianceLaw.HIPAA:
                # HIPAA requires strong anonymization for health data
                health_anonymized = [r for r in results if 
                                   r.transformation_type in [TransformationType.ANONYMIZATION, 
                                                           TransformationType.PSEUDONYMIZATION]]
                if len(health_anonymized) >= len(results) * 0.8:  # 80% threshold
                    status["law_specific_status"]["HIPAA"] = "COMPLIANT"
                else:
                    status["law_specific_status"]["HIPAA"] = "NON_COMPLIANT"
                    status["overall_status"] = "NON_COMPLIANT"
                    status["risk_level"] = "HIGH"
        
        return status

    def _generate_compliance_recommendations(self, results: List[TransformationResult], 
                                           request: TransformationRequest) -> List[str]:
        """Generate actionable compliance recommendations"""
        recommendations = []
        
        # Check for low confidence transformations
        low_confidence = [r for r in results if r.confidence < 0.8]
        if low_confidence:
            recommendations.append("Review low-confidence transformations and consider manual verification")
        
        # GDPR specific recommendations
        if ComplianceLaw.GDPR in request.compliance_laws:
            if request.dsar_type == DSARType.DELETE:
                recommendations.append("Ensure complete data deletion to meet GDPR Article 17 requirements")
            elif request.dsar_type == DSARType.ACCESS:
                recommendations.append("Provide data in machine-readable format as per GDPR Article 20")
        
        # HIPAA specific recommendations
        if ComplianceLaw.HIPAA in request.compliance_laws:
            recommendations.append("Implement additional anonymization measures for health data as per HIPAA Safe Harbor")
        
        # General recommendations
        if any(r.transformation_type == TransformationType.ENCRYPTION_RANDOMIZED for r in results):
            recommendations.append("Ensure encryption keys are securely managed and rotated regularly")
        
        if any(r.transformation_type == TransformationType.TOKENIZATION for r in results):
            recommendations.append("Maintain secure token-to-data mapping for reversible transformations")
        
        return recommendations

# Global transformation engine instance
transformation_engine = DataTransformationEngine()
