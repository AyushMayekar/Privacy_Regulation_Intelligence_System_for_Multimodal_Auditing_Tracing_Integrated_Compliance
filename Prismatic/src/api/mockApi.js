// Mock API module for Privacy Regulation Intelligence System
// This module simulates API behavior with realistic network latency
// Replace these functions with real API calls when backend is implemented

import { 
  integratedSources, 
  privacyFindings, 
  dsarRequests, 
  auditLogs, 
  dataUtils 
} from '../data/dummyData.js';

// Utility function to simulate network latency
const simulateNetworkDelay = (minMs = 700, maxMs = 1200) => {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Utility function to simulate occasional API errors
const simulateError = (errorRate = 0.05) => {
  if (Math.random() < errorRate) {
    throw new Error('Simulated API error - network timeout');
  }
};

// Mock API functions
export const mockApi = {
  // ===== INTEGRATED SOURCES API =====
  
  /**
   * Get all integrated sources
   * TODO: Replace with real API call to GET /api/sources
   */
  getIntegratedSources: async () => {
    await simulateNetworkDelay();
    simulateError();
    
    return {
      success: true,
      data: integratedSources,
      message: 'Sources retrieved successfully'
    };
  },
  
  /**
   * Get a specific integrated source by ID
   * TODO: Replace with real API call to GET /api/sources/{id}
   */
  getIntegratedSource: async (sourceId) => {
    await simulateNetworkDelay();
    simulateError();
    
    const source = dataUtils.getSourceById(sourceId);
    
    if (!source) {
      return {
        success: false,
        data: null,
        message: 'Source not found'
      };
    }
    
    return {
      success: true,
      data: source,
      message: 'Source retrieved successfully'
    };
  },
  
  /**
   * Update source connection status
   * TODO: Replace with real API call to PUT /api/sources/{id}/status
   */
  updateSourceStatus: async (sourceId, status) => {
    await simulateNetworkDelay();
    simulateError();
    
    const source = dataUtils.getSourceById(sourceId);
    if (!source) {
      return {
        success: false,
        data: null,
        message: 'Source not found'
      };
    }
    
    // Simulate status update
    source.status = status;
    source.lastSync = new Date().toISOString();
    
    return {
      success: true,
      data: source,
      message: 'Source status updated successfully'
    };
  },
  
  // ===== PRIVACY FINDINGS API =====
  
  /**
   * Get all privacy findings
   * TODO: Replace with real API call to GET /api/findings
   */
  getAllFindings: async () => {
    await simulateNetworkDelay();
    simulateError();
    
    return {
      success: true,
      data: privacyFindings,
      message: 'Findings retrieved successfully'
    };
  },
  
  /**
   * Get findings by source ID
   * TODO: Replace with real API call to GET /api/findings?source={sourceId}
   */
  getFindingsBySource: async (sourceId) => {
    await simulateNetworkDelay();
    simulateError();
    
    const findings = dataUtils.getFindingsBySource(sourceId);
    
    return {
      success: true,
      data: findings,
      message: `Findings for source ${sourceId} retrieved successfully`
    };
  },
  
  /**
   * Get findings by severity
   * TODO: Replace with real API call to GET /api/findings?severity={severity}
   */
  getFindingsBySeverity: async (severity) => {
    await simulateNetworkDelay();
    simulateError();
    
    const findings = dataUtils.getFindingsBySeverity(severity);
    
    return {
      success: true,
      data: findings,
      message: `Findings with severity ${severity} retrieved successfully`
    };
  },
  
  /**
   * Get findings by category
   * TODO: Replace with real API call to GET /api/findings?category={category}
   */
  getFindingsByCategory: async (category) => {
    await simulateNetworkDelay();
    simulateError();
    
    const findings = dataUtils.getFindingsByCategory(category);
    
    return {
      success: true,
      data: findings,
      message: `Findings in category ${category} retrieved successfully`
    };
  },
  
  /**
   * Update finding status (e.g., mark as resolved)
   * TODO: Replace with real API call to PUT /api/findings/{id}/status
   */
  updateFindingStatus: async (findingId, status) => {
    await simulateNetworkDelay();
    simulateError();
    
    const finding = privacyFindings.find(f => f.id === findingId);
    if (!finding) {
      return {
        success: false,
        data: null,
        message: 'Finding not found'
      };
    }
    
    finding.status = status;
    finding.updatedAt = new Date().toISOString();
    
    return {
      success: true,
      data: finding,
      message: 'Finding status updated successfully'
    };
  },
  
  // ===== DSAR REQUESTS API =====
  
  /**
   * Get all DSAR requests
   * TODO: Replace with real API call to GET /api/dsar-requests
   */
  getDSARRequests: async () => {
    await simulateNetworkDelay();
    simulateError();
    
    return {
      success: true,
      data: dsarRequests,
      message: 'DSAR requests retrieved successfully'
    };
  },
  
  /**
   * Get DSAR requests by status
   * TODO: Replace with real API call to GET /api/dsar-requests?status={status}
   */
  getDSARRequestsByStatus: async (status) => {
    await simulateNetworkDelay();
    simulateError();
    
    const requests = dataUtils.getDSARByStatus(status);
    
    return {
      success: true,
      data: requests,
      message: `DSAR requests with status ${status} retrieved successfully`
    };
  },
  
  /**
   * Get a specific DSAR request by ID
   * TODO: Replace with real API call to GET /api/dsar-requests/{id}
   */
  getDSARRequest: async (requestId) => {
    await simulateNetworkDelay();
    simulateError();
    
    const request = dsarRequests.find(r => r.id === requestId);
    
    if (!request) {
      return {
        success: false,
        data: null,
        message: 'DSAR request not found'
      };
    }
    
    return {
      success: true,
      data: request,
      message: 'DSAR request retrieved successfully'
    };
  },
  
  /**
   * Create a new DSAR request
   * TODO: Replace with real API call to POST /api/dsar-requests
   */
  createDSARRequest: async (requestData) => {
    await simulateNetworkDelay();
    simulateError();
    
    const newRequest = {
      id: `dsar_${Date.now()}`,
      requestId: `REQ-2024-${String(dsarRequests.length + 1).padStart(3, '0')}`,
      ...requestData,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      priority: 'normal'
    };
    
    dsarRequests.push(newRequest);
    
    return {
      success: true,
      data: newRequest,
      message: 'DSAR request created successfully'
    };
  },
  
  /**
   * Update DSAR request status
   * TODO: Replace with real API call to PUT /api/dsar-requests/{id}/status
   */
  updateDSARRequestStatus: async (requestId, status, notes = '') => {
    await simulateNetworkDelay();
    simulateError();
    
    const request = dsarRequests.find(r => r.id === requestId);
    if (!request) {
      return {
        success: false,
        data: null,
        message: 'DSAR request not found'
      };
    }
    
    request.status = status;
    request.notes = notes;
    request.updatedAt = new Date().toISOString();
    
    if (status === 'completed') {
      request.completedAt = new Date().toISOString();
    }
    
    return {
      success: true,
      data: request,
      message: 'DSAR request status updated successfully'
    };
  },
  
  // ===== AUDIT LOGS API =====
  
  /**
   * Get audit logs
   * TODO: Replace with real API call to GET /api/audit-logs
   */
  getAuditLogs: async (filters = {}) => {
    await simulateNetworkDelay();
    simulateError();
    
    let filteredLogs = [...auditLogs];
    
    // Apply filters
    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }
    if (filters.system) {
      filteredLogs = filteredLogs.filter(log => log.system === filters.system);
    }
    if (filters.user) {
      filteredLogs = filteredLogs.filter(log => log.user === filters.user);
    }
    if (filters.dateFrom) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= new Date(filters.dateTo)
      );
    }
    
    return {
      success: true,
      data: filteredLogs,
      message: 'Audit logs retrieved successfully'
    };
  },
  
  // ===== DASHBOARD STATISTICS API =====
  
  /**
   * Get dashboard statistics
   * TODO: Replace with real API call to GET /api/dashboard/stats
   */
  getDashboardStats: async () => {
    await simulateNetworkDelay();
    simulateError();
    
    const stats = dataUtils.getStatistics();
    
    return {
      success: true,
      data: stats,
      message: 'Dashboard statistics retrieved successfully'
    };
  },
  
  // ===== INTEGRATION CONNECTION API =====
  
  /**
   * Connect an integration (OAuth flow simulation)
   * TODO: Replace with real OAuth flow - redirect to provider's OAuth URL
   */
  connectIntegration: async (integrationName, payload = {}) => {
    await simulateNetworkDelay(800, 1200); // OAuth flows take longer
    simulateError(0.08); // Slightly higher error rate for OAuth
    
    // Simulate OAuth success/failure
    const success = Math.random() > 0.1; // 90% success rate
    
    if (!success) {
      return {
        success: false,
        data: null,
        message: 'OAuth authorization failed. Please try again.'
      };
    }
    
    // Simulate successful connection
    const connectionData = {
      integrationName,
      connectionId: `conn_${Date.now()}`,
      connectedAt: new Date().toISOString(),
      status: 'connected',
      type: 'oauth',
      ...payload
    };
    
    return {
      success: true,
      data: connectionData,
      message: `${integrationName} connected successfully`
    };
  },
  
  /**
   * Test API key/secret for an integration
   * TODO: Replace with real API validation - make actual API call to provider
   */
  testApiKey: async (integrationName, credentials) => {
    await simulateNetworkDelay(600, 1000);
    simulateError(0.15); // Higher error rate for API key validation
    
    // Simulate validation logic
    const { apiKey, apiSecret, connectionString, accessKeyId, secretAccessKey } = credentials;
    
    // Basic validation rules
    let isValid = true;
    let errorMessage = '';
    
    if (apiKey && apiKey.length < 8) {
      isValid = false;
      errorMessage = 'API Key must be at least 8 characters long';
    }
    
    if (apiSecret && apiSecret.length < 8) {
      isValid = false;
      errorMessage = 'API Secret must be at least 8 characters long';
    }
    
    if (connectionString && !connectionString.includes('mongodb://') && !connectionString.includes('mongodb+srv://')) {
      isValid = false;
      errorMessage = 'Invalid MongoDB connection string format';
    }
    
    if (accessKeyId && accessKeyId.length < 16) {
      isValid = false;
      errorMessage = 'AWS Access Key ID must be at least 16 characters long';
    }
    
    if (secretAccessKey && secretAccessKey.length < 20) {
      isValid = false;
      errorMessage = 'AWS Secret Access Key must be at least 20 characters long';
    }
    
    // Simulate random validation failures
    if (isValid && Math.random() < 0.2) {
      isValid = false;
      errorMessage = 'Invalid credentials. Please check your API key and secret.';
    }
    
    if (!isValid) {
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
    
    // Simulate successful validation
    const connectionData = {
      integrationName,
      connectionId: `conn_${Date.now()}`,
      connectedAt: new Date().toISOString(),
      status: 'connected',
      type: 'api_key',
      credentials: {
        // Don't store actual credentials in mock
        hasApiKey: !!apiKey,
        hasApiSecret: !!apiSecret,
        hasConnectionString: !!connectionString,
        hasAccessKeyId: !!accessKeyId,
        hasSecretAccessKey: !!secretAccessKey
      }
    };
    
    return {
      success: true,
      data: connectionData,
      message: `${integrationName} credentials validated successfully`
    };
  },
  
  /**
   * Disconnect an integration
   * TODO: Replace with real API call to revoke OAuth tokens or disable API keys
   */
  disconnectIntegration: async (integrationName) => {
    await simulateNetworkDelay(500, 800);
    simulateError(0.05);
    
    return {
      success: true,
      data: {
        integrationName,
        disconnectedAt: new Date().toISOString(),
        status: 'disconnected'
      },
      message: `${integrationName} disconnected successfully`
    };
  },
  
  /**
   * Get integration connection status
   * TODO: Replace with real API call to check actual connection status
   */
  getIntegrationStatus: async (integrationName) => {
    await simulateNetworkDelay(300, 600);
    simulateError(0.02);
    
    // Check localStorage for connection status
    const savedConnections = JSON.parse(localStorage.getItem('prismatic-integrations') || '{}');
    const isConnected = savedConnections[integrationName]?.status === 'connected';
    
    return {
      success: true,
      data: {
        integrationName,
        status: isConnected ? 'connected' : 'disconnected',
        lastChecked: new Date().toISOString()
      },
      message: 'Integration status retrieved successfully'
    };
  },

  // ===== SCAN OPERATIONS API =====
  
  /**
   * Start a privacy scan for a specific source
   * TODO: Replace with real API call to POST /api/scan/start
   */
  startPrivacyScan: async (sourceId) => {
    await simulateNetworkDelay(1000, 2000); // Longer delay for scan operations
    simulateError(0.1); // Higher error rate for scan operations
    
    const source = dataUtils.getSourceById(sourceId);
    if (!source) {
      return {
        success: false,
        data: null,
        message: 'Source not found'
      };
    }
    
    // Simulate scan initiation
    const scanId = `scan_${Date.now()}`;
    
    return {
      success: true,
      data: {
        scanId,
        sourceId,
        status: 'started',
        startedAt: new Date().toISOString(),
        estimatedDuration: '5-10 minutes'
      },
      message: 'Privacy scan started successfully'
    };
  },
  
  /**
   * Get scan status
   * TODO: Replace with real API call to GET /api/scan/{scanId}/status
   */
  getScanStatus: async (scanId) => {
    await simulateNetworkDelay();
    simulateError();
    
    // Simulate different scan states
    const statuses = ['running', 'completed', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      success: true,
      data: {
        scanId,
        status: randomStatus,
        progress: randomStatus === 'running' ? Math.floor(Math.random() * 100) : 100,
        findingsCount: randomStatus === 'completed' ? Math.floor(Math.random() * 10) : 0,
        lastUpdated: new Date().toISOString()
      },
      message: 'Scan status retrieved successfully'
    };
  }
};

// Export individual functions for convenience
export const {
  getIntegratedSources,
  getIntegratedSource,
  updateSourceStatus,
  getAllFindings,
  getFindingsBySource,
  getFindingsBySeverity,
  getFindingsByCategory,
  updateFindingStatus,
  getDSARRequests,
  getDSARRequestsByStatus,
  getDSARRequest,
  createDSARRequest,
  updateDSARRequestStatus,
  getAuditLogs,
  getDashboardStats,
  connectIntegration,
  testApiKey,
  disconnectIntegration,
  getIntegrationStatus,
  startPrivacyScan,
  getScanStatus
} = mockApi;

// Export default mockApi object
export default mockApi;
