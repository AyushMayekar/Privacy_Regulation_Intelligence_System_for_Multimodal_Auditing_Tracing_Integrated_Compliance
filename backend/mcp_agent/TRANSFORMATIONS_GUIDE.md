# PRISMATIC Data Transformation Engine

## Overview

The PRISMATIC Data Transformation Engine is a comprehensive system for dynamically transforming PII/PHI data based on DSAR (Data Subject Access Request) types and compliance requirements. It supports 13 different transformation methods and automatically maps them to regulatory compliance laws.

## 🎯 Supported Transformation Types

### 1. **Masking**
- **Static Masking**: Replace with fixed patterns (e.g., `a***@gmail.com`)
- **Dynamic Masking**: Original preserved, masked shown at query time

### 2. **Redaction**
- Complete removal or blackout of sensitive fields

### 3. **Encryption**
- **Deterministic**: Same input → same encrypted output (indexable)
- **Randomized**: Input → different output each time (more secure)

### 4. **Hashing**
- Irreversible one-way conversion (SHA-256)

### 5. **Pseudonymization**
- Replace with consistent fake values (reversible)

### 6. **Anonymization**
- Strip data so it cannot be re-identified (irreversible)

### 7. **Tokenization**
- Replace with tokens (mappable back to originals)

### 8. **Data Deletion**
- **Hard Delete**: Permanent removal
- **Soft Delete**: Mark deleted but keep for audit

### 9. **Data Portability**
- Export in machine-readable format (JSON, CSV, XML)

### 10. **Data Rectification**
- Update incorrect data entries

### 11. **Aggregation**
- Reduce granularity (e.g., exact date → year only)

### 12. **Suppression**
- Omit fields entirely from results

### 13. **Perturbation**
- Add statistical noise to values

## 🏛️ DSAR Type Mapping

| **DSAR Request** | **Data Type** | **Transformation** | **Compliance Basis** |
|------------------|---------------|-------------------|---------------------|
| **Access** | Identifiers | Dynamic Masking | GDPR Art. 15 |
| **Access** | Financial | Tokenization | PCI-DSS + GDPR |
| **Access** | Health | Pseudonymization | HIPAA Safe Harbor |
| **Access** | Location | Aggregation | GDPR minimization |
| **Delete** | Identifiers | Hard Delete | GDPR Art. 17 |
| **Delete** | Financial | Soft Delete | AML retention |
| **Delete** | Health | Anonymization | HIPAA research |
| **Rectify** | Any | Data Rectification | GDPR Art. 16 |
| **Restrict** | Any | Encryption | GDPR Art. 18 |
| **Portability** | Any | Data Export | GDPR Art. 20 |
| **Object** | Behavioral | Suppression | GDPR Art. 21 |

## 🔧 MCP Tools Available

### Core Transformation Tools

```python
# General transformation tool
transform_data(findings, dsar_type, data_types, compliance_laws, user_context)

# Individual transformation methods
static_masking(findings)
dynamic_masking(findings)
redact_data(findings)
encrypt_deterministic(findings)
encrypt_randomized(findings)
hash_data(findings)
pseudonymize_data(findings)
anonymize_data(findings)
tokenize_data(findings)
hard_delete_data(findings)
soft_delete_data(findings)
export_data(findings)
rectify_data(findings, corrected_values)
aggregate_data(findings)
suppress_data(findings)
perturb_data(findings)
```

### DSAR-Specific Tools

```python
# GDPR Article-specific handlers
handle_access_request(findings)           # Art. 15
handle_delete_request(findings)           # Art. 17
handle_rectify_request(findings, corrections)  # Art. 16
handle_restrict_processing(findings)      # Art. 18
handle_portability_request(findings)      # Art. 20
handle_object_processing(findings)        # Art. 21
```

### Analysis & Utility Tools

```python
# Reporting and analysis
summarize(findings)
get_transformation_recommendations(dsar_type, data_types, compliance_laws)
get_compliance_status(results)

# Utility functions
notify(user_email, report)
log(db, results)
```

## 📋 Usage Examples

### Example 1: Handle GDPR Access Request

```python
# Scan for PII
findings = await gmail_scan("user@example.com")

# Handle access request with appropriate masking
result = handle_access_request(findings)

# Get compliance status
status = get_compliance_status(result)
```

### Example 2: Data Rectification

```python
# Scan MongoDB for PII
findings = mongo_scan("admin@company.com")

# Correct email address
corrections = {"email": "corrected@example.com"}
result = rectify_data(findings, corrections)

# Log the rectification
log("audit_db", result)
```

### Example 3: Custom Transformation

```python
# Transform with specific requirements
result = transform_data(
    findings=findings,
    dsar_type="restrict_processing",
    data_types=["identifiers", "financial"],
    compliance_laws=["gdpr", "pci_dss"],
    user_context={"reason": "security_incident"}
)
```

### Example 4: Get Recommendations

```python
# Get transformation recommendations
recommendations = get_transformation_recommendations(
    dsar_type="delete",
    data_types=["identifiers", "health"],
    compliance_laws=["gdpr", "hipaa"]
)
```

## 🔍 Data Type Classifications

### Identifiers
- Names, emails, phone numbers, SSN, Aadhaar, PAN, passport numbers
- **Default Transformations**: Masking, pseudonymization, encryption

### Financial
- Credit cards, bank accounts, IBAN, transaction data
- **Default Transformations**: Tokenization, masking, encryption

### Health (PHI)
- Medical records, diagnoses, prescriptions, lab results
- **Default Transformations**: Anonymization, pseudonymization

### Location
- Addresses, GPS coordinates, IP addresses
- **Default Transformations**: Aggregation, generalization

### Behavioral
- Cookies, logs, metadata, tracking data
- **Default Transformations**: Hashing, suppression

### Biometric
- Fingerprints, facial recognition, voice patterns
- **Default Transformations**: Anonymization, encryption

## 📊 Compliance Law Mappings

### GDPR (General Data Protection Regulation)
- **Article 15**: Right of access → Dynamic masking, aggregation
- **Article 16**: Right to rectification → Data rectification
- **Article 17**: Right to erasure → Hard deletion, anonymization
- **Article 18**: Right to restriction → Encryption, tokenization
- **Article 20**: Data portability → Structured export
- **Article 21**: Right to object → Suppression, hashing

### CCPA (California Consumer Privacy Act)
- **Access Rights**: Masking, aggregation
- **Deletion Rights**: Soft deletion (audit retention)
- **Opt-out Rights**: Suppression, hashing

### DPDP (Digital Personal Data Protection Act - India)
- **Access Rights**: Dynamic masking for Indian PII
- **Correction Rights**: Data rectification
- **Erase Rights**: Hard deletion for identifiers
- **Data Portability**: Structured export

### HIPAA (Health Insurance Portability and Accountability Act)
- **Minimum Necessary**: Aggregation, suppression
- **Safe Harbor**: Anonymization, de-identification
- **Research Use**: Pseudonymization

### PCI-DSS (Payment Card Industry Data Security Standard)
- **Data Protection**: Tokenization, encryption
- **Access Control**: Masking for display

## ⚙️ Configuration

### Environment Variables

```bash
# Encryption keys (in production, use proper key management)
DETERMINISTIC_ENCRYPTION_KEY=your_deterministic_key
RANDOMIZED_ENCRYPTION_KEY=your_randomized_key

# Compliance settings
DEFAULT_COMPLIANCE_LAWS=gdpr,dpdp
DEFAULT_DETECTION_THRESHOLD=0.7
DEFAULT_TRANSFORMATION_TIMEOUT=30
```

### Custom Transformation Rules

```python
# Add custom transformation mapping
transformation_engine.dsar_transformation_map[DSARType.CUSTOM] = {
    DataType.IDENTIFIERS: [TransformationType.CUSTOM_METHOD]
}
```

## 🔒 Security Considerations

### Key Management
- **Production**: Use AWS KMS, Azure Key Vault, or HashiCorp Vault
- **Development**: Generated keys with proper rotation
- **Encryption**: AES-256 for all encryption operations

### Data Handling
- **In-Memory**: Minimize data retention in memory
- **Logging**: Never log sensitive transformed values
- **Audit**: Complete audit trail for all transformations

### Access Control
- **Authentication**: JWT-based authentication required
- **Authorization**: Role-based access to transformation tools
- **Monitoring**: Real-time monitoring of transformation operations

## 📈 Performance Optimization

### Caching
- **Pseudonymization**: Cache pseudonym mappings
- **Encryption**: Cache encryption keys
- **Patterns**: Cache compiled regex patterns

### Batch Processing
- **Large Datasets**: Process in batches of 1000 records
- **Async Processing**: Non-blocking transformation operations
- **Progress Tracking**: Real-time progress updates

### Memory Management
- **Streaming**: Process large datasets in streaming mode
- **Garbage Collection**: Explicit cleanup of large objects
- **Resource Limits**: Configurable memory and CPU limits

## 🧪 Testing

### Unit Tests
```python
# Test individual transformations
def test_static_masking():
    result = static_masking([{"type": "email", "value": "test@example.com"}])
    assert "test@example.com" in result["transformation_results"][0]["original_value"]

# Test compliance mapping
def test_gdpr_access_mapping():
    result = handle_access_request(sample_findings)
    assert result["compliance_report"]["compliance_status"]["overall_status"] == "COMPLIANT"
```

### Integration Tests
```python
# Test end-to-end transformation pipeline
def test_full_dsar_pipeline():
    findings = scan_data_source("mongodb", "test_db")
    transformed = transform_data(findings, "access", ["identifiers"], ["gdpr"])
    assert transformed["success"] == True
```

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM python:3.9-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "server.py"]
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prismatic-transformation-engine
spec:
  replicas: 3
  selector:
    matchLabels:
      app: transformation-engine
  template:
    metadata:
      labels:
        app: transformation-engine
    spec:
      containers:
      - name: transformation-engine
        image: prismatic/transformation-engine:latest
        ports:
        - containerPort: 8000
        env:
        - name: ENCRYPTION_KEY
          valueFrom:
            secretKeyRef:
              name: encryption-secrets
              key: key
```

## 📚 API Reference

### Request Format
```json
{
  "findings": [
    {
      "type": "email",
      "value": "user@example.com",
      "confidence": 0.95,
      "location": {"field": "email", "record_id": "123"}
    }
  ],
  "dsar_type": "access",
  "data_types": ["identifiers"],
  "compliance_laws": ["gdpr"],
  "user_context": {}
}
```

### Response Format
```json
{
  "success": true,
  "message": "Data transformation completed for access request",
  "transformation_results": [
    {
      "original_value": "user@example.com",
      "transformed_value": "u***@example.com",
      "transformation_type": "masking_dynamic",
      "confidence": 0.95,
      "metadata": {"pattern": "email_static_mask"}
    }
  ],
  "compliance_report": {
    "report_id": "uuid",
    "compliance_status": {
      "overall_status": "COMPLIANT",
      "risk_level": "LOW"
    },
    "recommendations": ["Review low-confidence transformations"]
  }
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Encryption Key Errors**
   ```bash
   # Regenerate encryption keys
   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key())"
   ```

2. **Memory Issues with Large Datasets**
   ```python
   # Process in smaller batches
   batch_size = 100
   for i in range(0, len(findings), batch_size):
       batch = findings[i:i+batch_size]
       result = transform_data(batch, dsar_type, data_types, compliance_laws)
   ```

3. **Compliance Validation Failures**
   ```python
   # Check compliance status
   status = get_compliance_status(result)
   if status["overall_status"] != "COMPLIANT":
       print("Recommendations:", status["recommendations"])
   ```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=1
export LOG_LEVEL=DEBUG
python server.py
```

## 📞 Support

- **Documentation**: [docs.prismatic.ai/transformations](https://docs.prismatic.ai/transformations)
- **GitHub Issues**: [github.com/prismatic/mcp-agent/issues](https://github.com/prismatic/mcp-agent/issues)
- **Email Support**: support@prismatic.ai
- **Community**: [discord.gg/prismatic](https://discord.gg/prismatic)

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**License**: MIT
