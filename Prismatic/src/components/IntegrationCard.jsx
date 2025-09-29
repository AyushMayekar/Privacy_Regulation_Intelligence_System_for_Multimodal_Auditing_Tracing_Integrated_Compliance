// IntegrationCard component for displaying individual integrations
// Shows connection status, type badge, and action buttons

import React from 'react';

const IntegrationCard = ({ 
  integration, 
  onConnect, 
  onDisconnect, 
  isConnecting = false 
}) => {
  const { 
    name, 
    description, 
    icon, 
    connectionType, 
    isConnected, 
    lastConnected,
    category 
  } = integration;

  const getConnectionTypeBadge = (type) => {
    const badges = {
      oauth: { class: 'bg-primary', text: 'OAuth' },
      api_key: { class: 'bg-info', text: 'API Key' },
      connection_string: { class: 'bg-warning', text: 'Connection String' },
      aws_credentials: { class: 'bg-secondary', text: 'AWS Credentials' }
    };
    
    const badge = badges[type] || { class: 'bg-secondary', text: 'Unknown' };
    
    return (
      <span className={`badge ${badge.class} text-white`}>
        {badge.text}
      </span>
    );
  };

  const getStatusIndicator = () => {
    if (isConnected) {
      return (
        <div className="d-flex align-items-center gap-2">
          <div 
            className="rounded-circle" 
            style={{ 
              width: 10, 
              height: 10, 
              background: '#28a745',
              display: 'inline-block' 
            }} 
          />
          <span className="text-success fw-medium">Connected</span>
        </div>
      );
    }
    
    return (
      <div className="d-flex align-items-center gap-2">
        <div 
          className="rounded-circle" 
          style={{ 
            width: 10, 
            height: 10, 
            background: '#dc3545',
            display: 'inline-block' 
          }} 
        />
        <span className="text-muted">Not Connected</span>
      </div>
    );
  };

  const formatLastConnected = (timestamp) => {
    if (!timestamp) return null;
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body d-flex flex-column">
        {/* Header */}
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{ 
                width: 48, 
                height: 48, 
                background: 'linear-gradient(135deg, #0b1b2b 0%, #1a2b3d 100%)',
                color: 'white',
                fontSize: '1.5rem'
              }}
            >
              <i className={`bi bi-${icon}`}></i>
            </div>
            <div>
              <h6 className="mb-1 fw-bold">{name}</h6>
              <p className="text-muted small mb-0">{description}</p>
            </div>
          </div>
          {getConnectionTypeBadge(connectionType)}
        </div>

        {/* Status */}
        <div className="mb-3">
          {getStatusIndicator()}
          {isConnected && lastConnected && (
            <div className="small text-muted mt-1">
              Last connected: {formatLastConnected(lastConnected)}
            </div>
          )}
        </div>

        {/* Category */}
        {category && (
          <div className="mb-3">
            <span className="badge bg-light text-dark border">
              <i className="bi bi-tag me-1"></i>
              {category}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto">
          {isConnected ? (
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-success btn-sm flex-fill"
                disabled
              >
                <i className="bi bi-check2-circle me-1"></i>
                Connected
              </button>
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={() => onDisconnect(integration)}
                disabled={isConnecting}
                aria-label={`Disconnect ${name}`}
              >
                <i className="bi bi-x-circle"></i>
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-dark btn-sm w-100"
              onClick={() => onConnect(integration)}
              disabled={isConnecting}
              aria-label={`Connect ${name}`}
            >
              {isConnecting ? (
                <>
                  <span 
                    className="spinner-border spinner-border-sm me-2" 
                    role="status" 
                    aria-hidden="true"
                  ></span>
                  Connecting...
                </>
              ) : (
                <>
                  <i className="bi bi-plug me-1"></i>
                  Connect
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationCard;
