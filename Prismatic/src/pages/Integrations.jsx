// Integrations page with connection modals for different integration types
// TODO: Replace OAuth simulation with real OAuth flows and secure credential storage

import React, { useState, useEffect, useRef } from 'react';
import IntegrationCard from '../components/IntegrationCard';
import { mockApi } from '../api/mockApi.js';

const Integrations = () => {
  const [integrations, setIntegrations] = useState([]);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('oauth');
  const [credentials, setCredentials] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  const modalRef = useRef(null);
  const toastRef = useRef(null);

  // Integration definitions with connection types
  const integrationDefinitions = [
    {
      id: 'google_drive',
      name: 'Google Drive',
      description: 'Connect to Google Drive to scan documents and files',
      icon: 'google',
      connectionType: 'oauth',
      category: 'Cloud Storage'
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Connect to Gmail to scan emails and attachments',
      icon: 'envelope',
      connectionType: 'oauth',
      category: 'Email'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Connect to Slack workspace to scan messages and files',
      icon: 'slack',
      connectionType: 'oauth',
      category: 'Communication'
    },
    {
      id: 'mongodb',
      name: 'MongoDB',
      description: 'Connect to MongoDB database to scan collections',
      icon: 'database',
      connectionType: 'connection_string',
      category: 'Database'
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Connect to Salesforce CRM to scan customer data',
      icon: 'cloud',
      connectionType: 'api_key',
      category: 'CRM'
    },
    {
      id: 'airtable',
      name: 'Airtable',
      description: 'Connect to Airtable bases to scan records',
      icon: 'table',
      connectionType: 'api_key',
      category: 'Database'
    },
    {
      id: 'aws_s3',
      name: 'AWS S3',
      description: 'Connect to AWS S3 buckets to scan files',
      icon: 'bucket',
      connectionType: 'aws_credentials',
      category: 'Cloud Storage'
    }
  ];

  // Load integration statuses from localStorage on component mount
  useEffect(() => {
    loadIntegrationStatuses();
  }, []);

  const loadIntegrationStatuses = () => {
    const savedConnections = JSON.parse(localStorage.getItem('prismatic-integrations') || '{}');
    
    const integrationsWithStatus = integrationDefinitions.map(integration => ({
      ...integration,
      isConnected: savedConnections[integration.id]?.status === 'connected',
      lastConnected: savedConnections[integration.id]?.connectedAt
    }));
    
    setIntegrations(integrationsWithStatus);
  };

  const saveIntegrationStatus = (integrationId, status, data = {}) => {
    const savedConnections = JSON.parse(localStorage.getItem('prismatic-integrations') || '{}');
    savedConnections[integrationId] = {
      status,
      connectedAt: status === 'connected' ? new Date().toISOString() : null,
      ...data
    };
    localStorage.setItem('prismatic-integrations', JSON.stringify(savedConnections));
    loadIntegrationStatuses();
  };

  const showToastNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const handleConnect = (integration) => {
    setSelectedIntegration(integration);
    setModalType(integration.connectionType);
    setCredentials({});
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleDisconnect = async (integration) => {
    try {
      setIsConnecting(true);
      const response = await mockApi.disconnectIntegration(integration.name);
      
      if (response.success) {
        saveIntegrationStatus(integration.id, 'disconnected');
        showToastNotification(`${integration.name} disconnected successfully`);
        
        // Refresh dashboard statistics
        window.dispatchEvent(new CustomEvent('refreshDashboardStats'));
      } else {
        showToastNotification(response.message, 'error');
      }
    } catch (error) {
      showToastNotification('Failed to disconnect integration', 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOAuthConnect = async () => {
    try {
      setIsConnecting(true);
      setError('');
      
      // TODO: Replace with real OAuth flow
      // For OAuth, you would typically:
      // 1. Redirect to provider's OAuth URL
      // 2. Handle callback with authorization code
      // 3. Exchange code for access token
      // 4. Store token securely
      
      const response = await mockApi.connectIntegration(selectedIntegration.name);
      
      if (response.success) {
        saveIntegrationStatus(selectedIntegration.id, 'connected', response.data);
        setSuccess('Connected successfully!');
        showToastNotification(`${selectedIntegration.name} connected successfully`);
        
        // Refresh dashboard statistics
        window.dispatchEvent(new CustomEvent('refreshDashboardStats'));
        
        setTimeout(() => {
          setShowModal(false);
        }, 1500);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Failed to connect. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleApiKeyConnect = async () => {
    try {
      setIsConnecting(true);
      setError('');
      
      // TODO: Replace with real API key validation
      // For API key validation, you would typically:
      // 1. Make a test API call to the provider
      // 2. Validate the response
      // 3. Store credentials securely (encrypted)
      
      const response = await mockApi.testApiKey(selectedIntegration.name, credentials);
      
      if (response.success) {
        saveIntegrationStatus(selectedIntegration.id, 'connected', response.data);
        setSuccess('Credentials validated and connected successfully!');
        showToastNotification(`${selectedIntegration.name} connected successfully`);
        
        // Refresh dashboard statistics
        window.dispatchEvent(new CustomEvent('refreshDashboardStats'));
        
        setTimeout(() => {
          setShowModal(false);
        }, 1500);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Failed to validate credentials. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectionStringConnect = async () => {
    try {
      setIsConnecting(true);
      setError('');
      
      // TODO: Replace with real MongoDB connection test
      // For MongoDB connection, you would typically:
      // 1. Parse the connection string
      // 2. Attempt to connect to the database
      // 3. Test a simple query
      // 4. Store connection string securely (encrypted)
      
      const response = await mockApi.testApiKey(selectedIntegration.name, { connectionString: credentials.connectionString });
      
      if (response.success) {
        saveIntegrationStatus(selectedIntegration.id, 'connected', response.data);
        setSuccess('Connection successful!');
        showToastNotification(`${selectedIntegration.name} connected successfully`);
        
        // Refresh dashboard statistics
        window.dispatchEvent(new CustomEvent('refreshDashboardStats'));
        
        setTimeout(() => {
          setShowModal(false);
        }, 1500);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Failed to connect to database. Please check your connection string.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAwsConnect = async () => {
    try {
      setIsConnecting(true);
      setError('');
      
      // TODO: Replace with real AWS credential validation
      // For AWS credentials, you would typically:
      // 1. Create AWS SDK client with credentials
      // 2. Test with a simple API call (e.g., ListBuckets)
      // 3. Store credentials securely (encrypted)
      
      const response = await mockApi.testApiKey(selectedIntegration.name, {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        region: credentials.region
      });
      
      if (response.success) {
        saveIntegrationStatus(selectedIntegration.id, 'connected', response.data);
        setSuccess('AWS credentials validated successfully!');
        showToastNotification(`${selectedIntegration.name} connected successfully`);
        
        // Refresh dashboard statistics
        window.dispatchEvent(new CustomEvent('refreshDashboardStats'));
        
        setTimeout(() => {
          setShowModal(false);
        }, 1500);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Failed to validate AWS credentials. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    switch (modalType) {
      case 'oauth':
        handleOAuthConnect();
        break;
      case 'api_key':
        handleApiKeyConnect();
        break;
      case 'connection_string':
        handleConnectionStringConnect();
        break;
      case 'aws_credentials':
        handleAwsConnect();
        break;
      default:
        setError('Unknown connection type');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedIntegration(null);
    setCredentials({});
    setError('');
    setSuccess('');
  };

  const renderOAuthModal = () => (
    <div className="text-center">
      <div className="mb-4">
        <div 
          className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
          style={{ 
            width: 80, 
            height: 80, 
            background: 'linear-gradient(135deg, #0b1b2b 0%, #1a2b3d 100%)',
            color: 'white',
            fontSize: '2rem'
          }}
        >
          <i className={`bi bi-${selectedIntegration?.icon}`}></i>
        </div>
        <h5>Connect with {selectedIntegration?.name}</h5>
        <p className="text-muted">
          This is a simulated OAuth flow — replace with real OAuth redirect later.
        </p>
      </div>
      
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        <strong>OAuth Flow:</strong> In production, this would redirect to {selectedIntegration?.name}'s OAuth authorization page.
      </div>
      
      <button 
        className="btn btn-primary btn-lg w-100"
        onClick={handleOAuthConnect}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Connecting...
          </>
        ) : (
          <>
            <i className={`bi bi-${selectedIntegration?.icon} me-2`}></i>
            Connect with {selectedIntegration?.name}
          </>
        )}
      </button>
    </div>
  );

  const renderApiKeyModal = () => (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="apiKey" className="form-label">API Key</label>
        <input
          type="password"
          className="form-control"
          id="apiKey"
          value={credentials.apiKey || ''}
          onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
          placeholder="Enter your API key"
          required
        />
        <div className="form-text">
          Your {selectedIntegration?.name} API key. Keep this secure.
        </div>
      </div>
      
      <div className="mb-3">
        <label htmlFor="apiSecret" className="form-label">API Secret</label>
        <input
          type="password"
          className="form-control"
          id="apiSecret"
          value={credentials.apiSecret || ''}
          onChange={(e) => setCredentials({ ...credentials, apiSecret: e.target.value })}
          placeholder="Enter your API secret"
          required
        />
        <div className="form-text">
          Your {selectedIntegration?.name} API secret. This will be encrypted and stored securely.
        </div>
      </div>
      
      <div className="d-grid gap-2">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isConnecting || !credentials.apiKey || !credentials.apiSecret}
        >
          {isConnecting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Testing Connection...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle me-2"></i>
              Save & Test
            </>
          )}
        </button>
      </div>
    </form>
  );

  const renderConnectionStringModal = () => (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="connectionString" className="form-label">MongoDB Connection URI</label>
        <input
          type="password"
          className="form-control"
          id="connectionString"
          value={credentials.connectionString || ''}
          onChange={(e) => setCredentials({ ...credentials, connectionString: e.target.value })}
          placeholder="mongodb+srv://<user>:<password>@cluster0.mongodb.net/dbname"
          required
        />
        <div className="form-text">
          Your MongoDB connection string. Include database name in the URI.
        </div>
      </div>
      
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle me-2"></i>
        <strong>Security:</strong> Connection strings contain sensitive credentials and will be encrypted.
      </div>
      
      <div className="d-grid gap-2">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isConnecting || !credentials.connectionString}
        >
          {isConnecting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Testing Connection...
            </>
          ) : (
            <>
              <i className="bi bi-database me-2"></i>
              Test Connection
            </>
          )}
        </button>
      </div>
    </form>
  );

  const renderAwsModal = () => (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="accessKeyId" className="form-label">Access Key ID</label>
        <input
          type="text"
          className="form-control"
          id="accessKeyId"
          value={credentials.accessKeyId || ''}
          onChange={(e) => setCredentials({ ...credentials, accessKeyId: e.target.value })}
          placeholder="AKIAIOSFODNN7EXAMPLE"
          required
        />
        <div className="form-text">
          Your AWS Access Key ID (minimum 16 characters).
        </div>
      </div>
      
      <div className="mb-3">
        <label htmlFor="secretAccessKey" className="form-label">Secret Access Key</label>
        <input
          type="password"
          className="form-control"
          id="secretAccessKey"
          value={credentials.secretAccessKey || ''}
          onChange={(e) => setCredentials({ ...credentials, secretAccessKey: e.target.value })}
          placeholder="Enter your secret access key"
          required
        />
        <div className="form-text">
          Your AWS Secret Access Key (minimum 20 characters).
        </div>
      </div>
      
      <div className="mb-3">
        <label htmlFor="region" className="form-label">Region</label>
        <select
          className="form-select"
          id="region"
          value={credentials.region || 'us-east-1'}
          onChange={(e) => setCredentials({ ...credentials, region: e.target.value })}
          required
        >
          <option value="us-east-1">US East (N. Virginia)</option>
          <option value="us-west-2">US West (Oregon)</option>
          <option value="eu-west-1">Europe (Ireland)</option>
          <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
        </select>
        <div className="form-text">
          Select the AWS region where your S3 buckets are located.
        </div>
      </div>
      
      <div className="d-grid gap-2">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isConnecting || !credentials.accessKeyId || !credentials.secretAccessKey}
        >
          {isConnecting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Testing Credentials...
            </>
          ) : (
            <>
              <i className="bi bi-bucket me-2"></i>
              Save & Test
            </>
          )}
        </button>
      </div>
    </form>
  );

  const renderModalContent = () => {
    switch (modalType) {
      case 'oauth':
        return renderOAuthModal();
      case 'api_key':
        return renderApiKeyModal();
      case 'connection_string':
        return renderConnectionStringModal();
      case 'aws_credentials':
        return renderAwsModal();
      default:
        return <div>Unknown connection type</div>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="mb-1">Integrations</h4>
          <p className="text-muted mb-0">Connect your data sources to start privacy monitoring</p>
        </div>
        <div className="text-end">
          <div className="small text-muted">
            {integrations.filter(i => i.isConnected).length} of {integrations.length} connected
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="row g-4">
        {integrations.map((integration) => (
          <div key={integration.id} className="col-12 col-md-6 col-lg-4">
            <IntegrationCard
              integration={integration}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              isConnecting={isConnecting}
            />
          </div>
        ))}
      </div>

      {/* Connection Modal */}
      {showModal && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
          ref={modalRef}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Connect {selectedIntegration?.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle me-2"></i>
                    {success}
                  </div>
                )}
                
                {renderModalContent()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {showToast && (
        <div 
          className={`toast show position-fixed top-0 end-0 m-3`}
          style={{ zIndex: 9999 }}
          ref={toastRef}
        >
          <div className={`toast-header ${toastType === 'error' ? 'bg-danger text-white' : 'bg-success text-white'}`}>
            <i className={`bi ${toastType === 'error' ? 'bi-exclamation-triangle' : 'bi-check-circle'} me-2`}></i>
            <strong className="me-auto">
              {toastType === 'error' ? 'Error' : 'Success'}
            </strong>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setShowToast(false)}
            ></button>
          </div>
          <div className="toast-body">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;
