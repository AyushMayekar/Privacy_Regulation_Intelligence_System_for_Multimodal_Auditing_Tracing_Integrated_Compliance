# Dummy Data Documentation

This document describes the dummy data structure used in the Privacy Regulation Intelligence System for development and testing purposes.

## Overview

The dummy data simulates a realistic company environment with various integrated sources and privacy findings. All data is stored in `src/data/dummyData.js` and accessed through `src/api/mockApi.js`.

## Data Structure

### 1. Integrated Sources (`integratedSources`)

Represents different data sources connected to the privacy system:

```javascript
{
  id: 'mongodb_users',           // Unique identifier
  name: 'MongoDB - Users Collection', // Display name
  type: 'database',              // Source type: database, cloud_storage, communication
  status: 'connected',           // Connection status: connected, disconnected, error
  lastSync: '2024-01-15T10:30:00Z', // Last synchronization timestamp
  recordCount: 15420,            // Number of records in source
  collection: 'users',           // Database collection name (for databases)
  database: 'production',        // Database name (for databases)
  connectionString: 'mongodb://...' // Connection details (for databases)
}
```

**Supported Source Types:**
- `database`: MongoDB, PostgreSQL, MySQL, etc.
- `cloud_storage`: Google Drive, AWS S3, Dropbox, etc.
- `communication`: Slack, Microsoft Teams, etc.

### 2. Privacy Findings (`privacyFindings`)

Represents detected privacy violations and sensitive data:

```javascript
{
  id: 'finding_001',             // Unique identifier
  sourceId: 'mongodb_users',     // Reference to integrated source
  sourceName: 'MongoDB - Users Collection', // Source display name
  severity: 'high',              // Severity: critical, high, medium, low
  category: 'PII',               // Data category: PII, PHI, Financial, etc.
  dataType: 'PAN',               // Specific data type: PAN, Aadhaar, Email, etc.
  description: 'Plaintext PAN numbers found...', // Human-readable description
  location: 'collection: users, field: pan_number', // Exact location
  recordCount: 1247,             // Number of affected records
  sampleData: 'ABCDE1234F',      // Sample of detected data (masked)
  detectedAt: '2024-01-15T10:30:00Z', // Detection timestamp
  status: 'active',              // Status: active, resolved, false_positive
  compliance: ['PCI-DSS', 'GDPR'] // Applicable compliance frameworks
}
```

**Supported Data Types:**
- **PII**: PAN, Aadhaar, Passport, Email, Phone, Address
- **PHI**: Medical Records, Patient Data, Health Information
- **Financial**: Bank Account, Credit Card, Transaction Data
- **Other**: IP Address, Device ID, Location Data

**Supported Compliance Frameworks:**
- GDPR (General Data Protection Regulation)
- PCI-DSS (Payment Card Industry Data Security Standard)
- HIPAA (Health Insurance Portability and Accountability Act)
- Aadhaar Act (India)
- Local Privacy Laws

### 3. DSAR Requests (`dsarRequests`)

Represents Data Subject Access Requests:

```javascript
{
  id: 'dsar_001',                // Unique identifier
  requestId: 'REQ-2024-001',     // Human-readable request ID
  requesterName: 'John Smith',   // Requester's name
  requesterEmail: 'john.smith@email.com', // Requester's email
  requesterType: 'employee',     // Type: employee, former_employee, customer, other
  requestType: 'access',         // Type: access, deletion, portability, correction
  status: 'pending',             // Status: pending, in_progress, completed, rejected
  priority: 'normal',            // Priority: low, normal, high, urgent
  submittedAt: '2024-01-10T14:30:00Z', // Submission timestamp
  dueDate: '2024-01-24T14:30:00Z', // Due date (typically 30 days from submission)
  description: 'Request for access to all personal data...', // Request description
  dataTypes: ['PII', 'Employment Records'], // Types of data requested
  sources: ['mongodb_users', 'google_drive_hr'], // Relevant data sources
  assignedTo: 'privacy.officer@company.com', // Assigned privacy officer
  notes: 'Standard access request...', // Internal notes
  completedAt: '2024-01-12T10:20:00Z' // Completion timestamp (if completed)
}
```

### 4. Audit Logs (`auditLogs`)

Represents system audit trail:

```javascript
{
  id: 'log_001',                 // Unique identifier
  timestamp: '2024-01-15T10:30:00Z', // Event timestamp
  action: 'Scan Started',        // Action performed
  system: 'Web',                 // System component: Web, API, Worker
  user: 'admin@company.com',     // User who performed action
  result: 'Success',             // Result: Success, Warning, Error
  details: 'Privacy scan initiated...', // Additional details
  sourceId: 'mongodb_users'      // Related source (if applicable)
}
```

## Utility Functions

The `dataUtils` object provides helper functions for querying the dummy data:

```javascript
// Get findings by source
dataUtils.getFindingsBySource('mongodb_users')

// Get findings by severity
dataUtils.getFindingsBySeverity('critical')

// Get DSAR requests by status
dataUtils.getDSARByStatus('pending')

// Get statistics
dataUtils.getStatistics()
```

## Mock API

The `src/api/mockApi.js` file provides promise-based functions that simulate real API calls:

```javascript
// Get all findings
const response = await mockApi.getAllFindings()

// Get findings by source
const findings = await mockApi.getFindingsBySource('mongodb_users')

// Create new DSAR request
const newRequest = await mockApi.createDSARRequest({
  requesterName: 'Jane Doe',
  requesterEmail: 'jane@email.com',
  requestType: 'access'
})
```

**Network Simulation:**
- All API calls include 700-1200ms delay to simulate network latency
- 5% error rate to simulate occasional network failures
- Scan operations have longer delays (1-2 seconds) and higher error rates (10%)

## Extending the Dummy Data

### Adding New Sources

1. Add new source object to `integratedSources` array:
```javascript
{
  id: 'new_source_id',
  name: 'New Source Name',
  type: 'database', // or 'cloud_storage', 'communication'
  status: 'connected',
  lastSync: new Date().toISOString(),
  recordCount: 1000,
  // Add type-specific fields
}
```

2. Add corresponding findings to `privacyFindings` array
3. Update utility functions if needed

### Adding New Finding Types

1. Add new finding to `privacyFindings` array:
```javascript
{
  id: 'finding_new',
  sourceId: 'source_id',
  severity: 'high',
  category: 'NewCategory',
  dataType: 'NewDataType',
  // ... other fields
}
```

2. Update the supported data types documentation above

### Adding New DSAR Request Types

1. Add new request to `dsarRequests` array
2. Update `requesterType` and `requestType` options in documentation

## Integration with Real Backend

When implementing the real backend, replace the mock API functions with actual HTTP calls:

```javascript
// Replace this:
const response = await mockApi.getAllFindings()

// With this:
const response = await fetch('/api/findings')
  .then(res => res.json())
```

**API Endpoints to Implement:**
- `GET /api/sources` - Get all integrated sources
- `GET /api/findings` - Get all privacy findings
- `GET /api/dsar-requests` - Get all DSAR requests
- `GET /api/audit-logs` - Get audit logs
- `POST /api/scan/start` - Start privacy scan
- `PUT /api/findings/{id}/status` - Update finding status
- `POST /api/dsar-requests` - Create new DSAR request

## Data Privacy Note

All dummy data is fictional and does not contain real personal information. Sample data values are randomly generated and should not be used in production environments.
