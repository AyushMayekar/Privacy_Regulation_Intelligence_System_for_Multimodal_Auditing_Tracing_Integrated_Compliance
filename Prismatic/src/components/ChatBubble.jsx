// ChatBubble component for displaying individual chat messages
// Provides premium styling with Bootstrap classes and accessibility features

import React from 'react';

const ChatBubble = ({ 
  message, 
  isUser = false, 
  timestamp, 
  actions = [], 
  isLoading = false 
}) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div 
      className={`d-flex mb-3 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}
      role="article"
      aria-label={`${isUser ? 'Your message' : 'Assistant message'}: ${message}`}
    >
      <div 
        className={`chat-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'} ${
          isLoading ? 'loading' : ''
        }`}
        style={{
          maxWidth: '80%',
          position: 'relative'
        }}
      >
        {/* Message Content */}
        <div className="message-content">
          {isLoading ? (
            <div className="d-flex align-items-center gap-2">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="text-muted small">Assistant is typing...</span>
            </div>
          ) : (
            <>
              <div className="message-text">
                {message}
              </div>
              
              {/* Action Buttons */}
              {actions.length > 0 && (
                <div className="action-buttons mt-2">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      className={`btn btn-sm ${action.variant || 'btn-outline-primary'} me-2 mb-1`}
                      onClick={action.onClick}
                      aria-label={action.ariaLabel || action.label}
                    >
                      {action.icon && <i className={`bi bi-${action.icon} me-1`}></i>}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Timestamp */}
        {timestamp && !isLoading && (
          <div 
            className={`timestamp small text-muted mt-1 ${
              isUser ? 'text-end' : 'text-start'
            }`}
            aria-label={`Sent at ${formatTime(timestamp)}`}
          >
            {formatTime(timestamp)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
