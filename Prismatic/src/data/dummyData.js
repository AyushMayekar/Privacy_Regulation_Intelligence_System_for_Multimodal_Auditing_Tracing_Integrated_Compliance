// Dummy data for Privacy Regulation Intelligence System
// This file contains realistic sample data representing various integrated sources
// and their privacy findings for development and testing purposes.

// Sample company data representing different integrated sources
export const integratedSources = [
  {
    id: 'mongodb_users',
    name: 'MongoDB - Users Collection',
    type: 'database',
    status: 'connected',
    lastSync: '2024-01-15T10:30:00Z',
    recordCount: 15420,
    collection: 'users',
    database: 'production',
    connectionString: 'mongodb://prod-cluster:27017/production'
  },
  {
    id: 'google_drive_hr',
    name: 'Google Drive - HR Documents',
    type: 'cloud_storage',
    status: 'connected',
    lastSync: '2024-01-15T09:45:00Z',
    recordCount: 2347,
    folderPath: '/HR Documents/Employee Forms',
    owner: 'hr@company.com'
  },
  {
    id: 'slack_workspace',
    name: 'Slack - Company Workspace',
    type: 'communication',
    status: 'connected',
    lastSync: '2024-01-15T11:15:00Z',
    recordCount: 89234,
    workspace: 'company-slack',
    channels: ['#general', '#hr', '#finance', '#engineering']
  },
  {
    id: 's3_uploads',
    name: 'AWS S3 - Company Uploads',
    type: 'cloud_storage',
    status: 'connected',
    lastSync: '2024-01-15T08:20:00Z',
    recordCount: 5678,
    bucket: 'company-uploads',
    region: 'us-east-1'
  },
  {
    id: 'google_drive_finance',
    name: 'Google Drive - Finance Reports',
    type: 'cloud_storage',
    status: 'connected',
    lastSync: '2024-01-15T07:30:00Z',
    recordCount: 1234,
    folderPath: '/Finance/Reports',
    owner: 'finance@company.com'
  }
];

// Sample privacy findings across different sources
export const privacyFindings = [
  // MongoDB findings
  {
    id: 'finding_001',
    sourceId: 'mongodb_users',
    sourceName: 'MongoDB - Users Collection',
    severity: 'high',
    category: 'PII',
    dataType: 'PAN',
    description: 'Plaintext PAN numbers found in user profiles',
    location: 'collection: users, field: pan_number',
    recordCount: 1247,
    sampleData: 'ABCDE1234F',
    detectedAt: '2024-01-15T10:30:00Z',
    status: 'active',
    compliance: ['PCI-DSS', 'GDPR']
  },
  {
    id: 'finding_002',
    sourceId: 'mongodb_users',
    sourceName: 'MongoDB - Users Collection',
    severity: 'critical',
    category: 'PII',
    dataType: 'Aadhaar',
    description: 'Unmasked Aadhaar numbers in user notes field',
    location: 'collection: users, field: notes',
    recordCount: 89,
    sampleData: '1234-5678-9012',
    detectedAt: '2024-01-15T10:25:00Z',
    status: 'active',
    compliance: ['Aadhaar Act', 'GDPR']
  },
  
  // Google Drive findings
  {
    id: 'finding_003',
    sourceId: 'google_drive_hr',
    sourceName: 'Google Drive - HR Documents',
    severity: 'high',
    category: 'PII',
    dataType: 'Aadhaar',
    description: 'Aadhaar numbers visible in employee forms PDF',
    location: 'file: employee_forms.pdf, page: 3',
    recordCount: 1,
    sampleData: '9876-5432-1098',
    detectedAt: '2024-01-15T09:45:00Z',
    status: 'active',
    compliance: ['Aadhaar Act', 'GDPR']
  },
  {
    id: 'finding_004',
    sourceId: 'google_drive_finance',
    sourceName: 'Google Drive - Finance Reports',
    severity: 'medium',
    category: 'Financial',
    dataType: 'Bank Account',
    description: 'Bank account numbers in salary reports',
    location: 'file: salary_report_2024.pdf, page: 12',
    recordCount: 1,
    sampleData: '1234567890123456',
    detectedAt: '2024-01-15T07:30:00Z',
    status: 'active',
    compliance: ['PCI-DSS', 'GDPR']
  },
  
  // Slack findings
  {
    id: 'finding_005',
    sourceId: 'slack_workspace',
    sourceName: 'Slack - Company Workspace',
    severity: 'high',
    category: 'PII',
    dataType: 'PAN',
    description: 'CSV file with PAN numbers shared in #general channel',
    location: 'channel: #general, file: employee_data.csv',
    recordCount: 1,
    sampleData: 'WXYZ9876A',
    detectedAt: '2024-01-15T11:15:00Z',
    status: 'active',
    compliance: ['PCI-DSS', 'GDPR']
  },
  {
    id: 'finding_006',
    sourceId: 'slack_workspace',
    sourceName: 'Slack - Company Workspace',
    severity: 'medium',
    category: 'PII',
    dataType: 'Email',
    description: 'Personal email addresses shared in HR channel',
    location: 'channel: #hr, message: 2024-01-14 15:30',
    recordCount: 23,
    sampleData: 'john.doe.personal@gmail.com',
    detectedAt: '2024-01-14T15:30:00Z',
    status: 'active',
    compliance: ['GDPR']
  },
  
  // S3 findings
  {
    id: 'finding_007',
    sourceId: 's3_uploads',
    sourceName: 'AWS S3 - Company Uploads',
    severity: 'critical',
    category: 'PHI',
    dataType: 'Medical Records',
    description: 'Public file containing PHI data accessible without authentication',
    location: 'bucket: company-uploads, key: medical/patient_data.xlsx',
    recordCount: 1,
    sampleData: 'Patient ID: P12345, Diagnosis: Diabetes',
    detectedAt: '2024-01-15T08:20:00Z',
    status: 'active',
    compliance: ['HIPAA', 'GDPR']
  },
  {
    id: 'finding_008',
    sourceId: 's3_uploads',
    sourceName: 'AWS S3 - Company Uploads',
    severity: 'high',
    category: 'PII',
    dataType: 'Passport',
    description: 'Passport numbers in travel documents',
    location: 'bucket: company-uploads, key: travel/visa_applications.pdf',
    recordCount: 1,
    sampleData: 'A1234567',
    detectedAt: '2024-01-15T08:15:00Z',
    status: 'active',
    compliance: ['GDPR', 'Local Privacy Laws']
  }
];

// Sample DSAR (Data Subject Access Request) data
export const dsarRequests = [
  {
    id: 'dsar_001',
    requestId: 'REQ-2024-001',
    requesterName: 'John Smith',
    requesterEmail: 'john.smith@email.com',
    requesterType: 'employee',
    requestType: 'access',
    status: 'pending',
    priority: 'normal',
    submittedAt: '2024-01-10T14:30:00Z',
    dueDate: '2024-01-24T14:30:00Z',
    description: 'Request for access to all personal data held by the company',
    dataTypes: ['PII', 'Employment Records', 'Performance Reviews'],
    sources: ['mongodb_users', 'google_drive_hr', 'slack_workspace'],
    assignedTo: 'privacy.officer@company.com',
    notes: 'Standard access request from current employee'
  },
  {
    id: 'dsar_002',
    requestId: 'REQ-2024-002',
    requesterName: 'Sarah Johnson',
    requesterEmail: 'sarah.j@email.com',
    requesterType: 'former_employee',
    requestType: 'deletion',
    status: 'in_progress',
    priority: 'high',
    submittedAt: '2024-01-08T09:15:00Z',
    dueDate: '2024-01-22T09:15:00Z',
    description: 'Request for deletion of all personal data as per GDPR Article 17',
    dataTypes: ['PII', 'Employment Records', 'Communication History'],
    sources: ['mongodb_users', 'google_drive_hr', 'slack_workspace', 's3_uploads'],
    assignedTo: 'privacy.officer@company.com',
    notes: 'Former employee requesting complete data deletion. Legal review required.'
  },
  {
    id: 'dsar_003',
    requestId: 'REQ-2024-003',
    requesterName: 'Mike Chen',
    requesterEmail: 'mike.chen@email.com',
    requesterType: 'customer',
    requestType: 'portability',
    status: 'completed',
    priority: 'normal',
    submittedAt: '2024-01-05T16:45:00Z',
    dueDate: '2024-01-19T16:45:00Z',
    description: 'Request for data portability in machine-readable format',
    dataTypes: ['Account Data', 'Transaction History', 'Preferences'],
    sources: ['mongodb_users', 's3_uploads'],
    assignedTo: 'privacy.officer@company.com',
    notes: 'Data exported in JSON format and delivered via secure portal',
    completedAt: '2024-01-12T10:20:00Z'
  }
];

// Sample audit log entries
export const auditLogs = [
  {
    id: 'log_001',
    timestamp: '2024-01-15T10:30:00Z',
    action: 'Scan Started',
    system: 'Web',
    user: 'admin@company.com',
    result: 'Success',
    details: 'Privacy scan initiated for MongoDB users collection',
    sourceId: 'mongodb_users'
  },
  {
    id: 'log_002',
    timestamp: '2024-01-15T10:25:00Z',
    action: 'DSAR Request Completed',
    system: 'API',
    user: 'privacy.officer@company.com',
    result: 'Success',
    details: 'DSAR REQ-2024-003 completed and data delivered',
    sourceId: null
  },
  {
    id: 'log_003',
    timestamp: '2024-01-15T09:45:00Z',
    action: 'Integration Connected',
    system: 'Worker',
    user: 'system@company.com',
    result: 'Success',
    details: 'Google Drive HR documents integration established',
    sourceId: 'google_drive_hr'
  },
  {
    id: 'log_004',
    timestamp: '2024-01-15T08:20:00Z',
    action: 'Scan Completed',
    system: 'Web',
    user: 'admin@company.com',
    result: 'Warning',
    details: 'Critical PHI finding detected in S3 bucket',
    sourceId: 's3_uploads'
  }
];

// Utility functions for querying dummy data
export const dataUtils = {
  // Get findings by source ID
  getFindingsBySource: (sourceId) => {
    return privacyFindings.filter(finding => finding.sourceId === sourceId);
  },
  
  // Get findings by severity
  getFindingsBySeverity: (severity) => {
    return privacyFindings.filter(finding => finding.severity === severity);
  },
  
  // Get findings by category
  getFindingsByCategory: (category) => {
    return privacyFindings.filter(finding => finding.category === category);
  },
  
  // Get DSAR requests by status
  getDSARByStatus: (status) => {
    return dsarRequests.filter(request => request.status === status);
  },
  
  // Get DSAR requests by requester type
  getDSARByRequesterType: (requesterType) => {
    return dsarRequests.filter(request => request.requesterType === requesterType);
  },
  
  // Get audit logs by action
  getAuditLogsByAction: (action) => {
    return auditLogs.filter(log => log.action === action);
  },
  
  // Get source by ID
  getSourceById: (sourceId) => {
    return integratedSources.find(source => source.id === sourceId);
  },
  
  // Get all critical findings
  getCriticalFindings: () => {
    return privacyFindings.filter(finding => finding.severity === 'critical');
  },
  
  // Get overdue DSAR requests
  getOverdueDSARRequests: () => {
    const now = new Date();
    return dsarRequests.filter(request => 
      new Date(request.dueDate) < now && request.status !== 'completed'
    );
  },
  
  // Get statistics
  getStatistics: () => {
    return {
      totalSources: integratedSources.length,
      totalFindings: privacyFindings.length,
      criticalFindings: privacyFindings.filter(f => f.severity === 'critical').length,
      highFindings: privacyFindings.filter(f => f.severity === 'high').length,
      mediumFindings: privacyFindings.filter(f => f.severity === 'medium').length,
      totalDSARRequests: dsarRequests.length,
      pendingDSARRequests: dsarRequests.filter(r => r.status === 'pending').length,
      inProgressDSARRequests: dsarRequests.filter(r => r.status === 'in_progress').length,
      completedDSARRequests: dsarRequests.filter(r => r.status === 'completed').length,
      overdueDSARRequests: dsarRequests.filter(r => 
        new Date(r.dueDate) < new Date() && r.status !== 'completed'
      ).length
    };
  }
};

// Export all data as default for easy importing
export default {
  integratedSources,
  privacyFindings,
  dsarRequests,
  auditLogs,
  dataUtils
};
