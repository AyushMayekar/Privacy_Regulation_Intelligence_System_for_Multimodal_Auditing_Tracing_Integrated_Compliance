// ChatPanel component with hard-coded conversational logic
// TODO: Replace hard-coded responses with real LLM API calls when backend is implemented

import React, { useState, useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble.jsx';
import { mockApi } from '../api/mockApi.js';
import '../styles/chat.css';

const ChatPanel = () => {
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Hard-coded conversational logic - replace with real LLM API later
  const conversationIntents = {
    // MongoDB-related queries
    mongodb: {
      keywords: ['mongodb', 'mongo', 'mongo db', 'database', 'users collection'],
      response: async () => {
        const findings = await mockApi.getFindingsBySource('mongodb_users');
        const data = findings.data || [];
        
        return {
          message: `I found ${data.length} privacy issues in your MongoDB users collection:\n\n` +
                  `🔴 **Critical**: ${data.filter(f => f.severity === 'critical').length} findings\n` +
                  `🟠 **High**: ${data.filter(f => f.severity === 'high').length} findings\n` +
                  `🟡 **Medium**: ${data.filter(f => f.severity === 'medium').length} findings\n\n` +
                  `Most concerning: Unmasked Aadhaar numbers and plaintext PAN data detected.`,
          actions: [
            {
              label: 'Check Scan History',
              icon: 'clock-history',
              variant: 'btn-primary',
              onClick: () => navigateToPage('scans'),
              ariaLabel: 'Navigate to Scan History page'
            }
          ]
        };
      }
    },
    
    // Google Drive-related queries
    googleDrive: {
      keywords: ['google drive', 'drive', 'google', 'hr documents', 'finance reports'],
      response: async () => {
        const hrFindings = await mockApi.getFindingsBySource('google_drive_hr');
        const financeFindings = await mockApi.getFindingsBySource('google_drive_finance');
        const totalFindings = (hrFindings.data || []).length + (financeFindings.data || []).length;
        
        return {
          message: `I detected ${totalFindings} privacy issues across your Google Drive:\n\n` +
                  `📁 **HR Documents**: ${(hrFindings.data || []).length} findings\n` +
                  `📊 **Finance Reports**: ${(financeFindings.data || []).length} findings\n\n` +
                  `Issues include Aadhaar numbers in employee forms and bank account details in salary reports.`,
          actions: [
            {
              label: 'Open Integrations → Google Drive',
              icon: 'google',
              variant: 'btn-outline-primary',
              onClick: () => navigateToPage('integrations'),
              ariaLabel: 'Navigate to Integrations page for Google Drive'
            }
          ]
        };
      }
    },
    
    // Slack-related queries
    slack: {
      keywords: ['slack', 'workspace', 'channels', 'communication'],
      response: async () => {
        const findings = await mockApi.getFindingsBySource('slack_workspace');
        const data = findings.data || [];
        
        return {
          message: `I found ${data.length} privacy issues in your Slack workspace:\n\n` +
                  `💬 **Shared Files**: CSV files with PAN numbers in #general\n` +
                  `📧 **Personal Emails**: Personal email addresses shared in #hr\n\n` +
                  `These communications may contain sensitive data that should be reviewed.`,
          actions: [
            {
              label: 'Scan History',
              icon: 'clock-history',
              variant: 'btn-primary',
              onClick: () => navigateToPage('scans'),
              ariaLabel: 'Navigate to Scan History page'
            }
          ]
        };
      }
    },
    
    // DSAR-related queries
    dsar: {
      keywords: ['dsar', 'data subject', 'access request', 'delete my data', 'export my data', 'gdpr request'],
      response: async () => {
        const requests = await mockApi.getDSARRequests();
        const data = requests.data || [];
        const pending = data.filter(r => r.status === 'pending').length;
        const inProgress = data.filter(r => r.status === 'in_progress').length;
        const completed = data.filter(r => r.status === 'completed').length;
        
        return {
          message: `Here's your current DSAR request status:\n\n` +
                  `📋 **Total Requests**: ${data.length}\n` +
                  `⏳ **Pending**: ${pending}\n` +
                  `🔄 **In Progress**: ${inProgress}\n` +
                  `✅ **Completed**: ${completed}\n\n` +
                  `All requests are being processed within GDPR timelines.`,
          actions: [
            {
              label: 'DSAR Requests',
              icon: 'inbox',
              variant: 'btn-primary',
              onClick: () => navigateToPage('dsar'),
              ariaLabel: 'Navigate to DSAR Requests page'
            }
          ]
        };
      }
    },
    
    // S3-related queries
    s3: {
      keywords: ['s3', 'aws', 'bucket', 'uploads', 'cloud storage'],
      response: async () => {
        const findings = await mockApi.getFindingsBySource('s3_uploads');
        const data = findings.data || [];
        const critical = data.filter(f => f.severity === 'critical').length;
        
        return {
          message: `I found ${data.length} privacy issues in your S3 bucket:\n\n` +
                  `🚨 **Critical Alert**: ${critical} critical findings detected\n` +
                  `📁 **Public Files**: PHI data accessible without authentication\n` +
                  `🔒 **Security Risk**: Immediate attention required\n\n` +
                  `These issues pose significant compliance risks.`,
          actions: [
            {
              label: 'Check Scan History',
              icon: 'clock-history',
              variant: 'btn-danger',
              onClick: () => navigateToPage('scans'),
              ariaLabel: 'Navigate to Scan History page for S3 issues'
            }
          ]
        };
      }
    }
  };

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedChat = localStorage.getItem('prismatic-chat-history');
    if (savedChat) {
      try {
        const parsedChat = JSON.parse(savedChat);
        setMessages(parsedChat.messages || []);
        setIsChatStarted(parsedChat.isChatStarted || false);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('prismatic-chat-history', JSON.stringify({
        messages,
        isChatStarted,
        timestamp: new Date().toISOString()
      }));
    }
  }, [messages, isChatStarted]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Simple keyword-based NLP matching
  const findMatchingIntent = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    for (const [intentName, intent] of Object.entries(conversationIntents)) {
      const hasKeyword = intent.keywords.some(keyword => 
        message.includes(keyword.toLowerCase())
      );
      if (hasKeyword) {
        return intentName;
      }
    }
    
    return null;
  };

  // Generate fallback response
  const getFallbackResponse = () => {
    return {
      message: "I don't have live access to real-time data. For comprehensive reports and detailed analysis, please visit:\n\n" +
              "• **Scan History** - View all privacy scan results\n" +
              "• **DSAR Requests** - Manage data subject access requests\n" +
              "• **Integrations** - Monitor connected data sources\n\n" +
              "Try asking about specific sources like 'MongoDB', 'Google Drive', 'Slack', or 'DSAR requests'.",
      actions: [
        {
          label: 'Scan History',
          icon: 'clock-history',
          variant: 'btn-outline-primary',
          onClick: () => navigateToPage('scans'),
          ariaLabel: 'Navigate to Scan History page'
        },
        {
          label: 'DSAR Requests',
          icon: 'inbox',
          variant: 'btn-outline-primary',
          onClick: () => navigateToPage('dsar'),
          ariaLabel: 'Navigate to DSAR Requests page'
        }
      ]
    };
  };

  // Navigate to different pages (placeholder for routing)
  const navigateToPage = (page) => {
    // TODO: Implement actual routing when React Router is added
    console.log(`Navigating to ${page} page`);
    // For now, we'll dispatch a custom event that the parent can listen to
    window.dispatchEvent(new CustomEvent('navigateToPage', { detail: { page } }));
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    const newMessages = [...messages, {
      id: Date.now(),
      message: userMessage,
      isUser: true,
      timestamp: new Date().toISOString()
    }];
    setMessages(newMessages);
    setIsLoading(true);

    // Simulate typing delay (800-1500ms)
    const typingDelay = Math.random() * 700 + 800;
    
    setTimeout(async () => {
      try {
        // Find matching intent
        const matchedIntent = findMatchingIntent(userMessage);
        let response;
        
        if (matchedIntent && conversationIntents[matchedIntent]) {
          response = await conversationIntents[matchedIntent].response();
        } else {
          response = getFallbackResponse();
        }
        
        // Add assistant response
        const assistantMessage = {
          id: Date.now() + 1,
          message: response.message,
          isUser: false,
          timestamp: new Date().toISOString(),
          actions: response.actions || []
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Error generating response:', error);
        const errorMessage = {
          id: Date.now() + 1,
          message: "I'm sorry, I encountered an error while processing your request. Please try again or check the Scan History for detailed information.",
          isUser: false,
          timestamp: new Date().toISOString(),
          actions: [
            {
              label: 'Scan History',
              icon: 'clock-history',
              variant: 'btn-outline-primary',
              onClick: () => navigateToPage('scans'),
              ariaLabel: 'Navigate to Scan History page'
            }
          ]
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }, typingDelay);
  };

  // Handle starting chat
  const handleStartChat = () => {
    setIsChatStarted(true);
    
    // Add welcome message
    const welcomeMessage = {
      id: Date.now(),
      message: "Hello! I'm your Privacy Intelligence Assistant. I can help you understand your privacy findings and DSAR requests.\n\n" +
              "Try asking me about:\n" +
              "• MongoDB vulnerabilities\n" +
              "• Google Drive leaks\n" +
              "• Slack privacy issues\n" +
              "• DSAR request status\n" +
              "• S3 security findings",
      isUser: false,
      timestamp: new Date().toISOString(),
      actions: []
    };
    
    setMessages([welcomeMessage]);
  };

  // Handle input key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Clear chat history
  const clearChatHistory = () => {
    setMessages([]);
    setIsChatStarted(false);
    localStorage.removeItem('prismatic-chat-history');
  };

  if (!isChatStarted) {
    return (
      <div className="chat-panel">
        <div className="start-chat-container">
          <div className="start-chat-card">
            <div className="start-chat-icon">
              <i className="bi bi-chat-dots"></i>
            </div>
            <h5 className="mb-3">Privacy Intelligence Assistant</h5>
            <p className="text-muted mb-4">
              Get instant insights about your privacy findings, DSAR requests, and compliance status.
            </p>
            <button 
              className="start-chat-button"
              onClick={handleStartChat}
              aria-label="Start conversation with Privacy Intelligence Assistant"
            >
              Start Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-panel">
      {/* Chat Header */}
      <div className="chat-header">
        <h6>
          <i className="bi bi-robot"></i>
          Privacy Intelligence Assistant
        </h6>
        <div className="chat-status">
          <div className="status-dot"></div>
          <span>Online</span>
        </div>
        <button 
          className="btn btn-sm btn-outline-light ms-auto"
          onClick={clearChatHistory}
          aria-label="Clear chat history"
        >
          <i className="bi bi-trash"></i>
        </button>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.message}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
            actions={msg.actions}
          />
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <ChatBubble
            message=""
            isUser={false}
            isLoading={true}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="chat-input-container">
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <textarea
            ref={inputRef}
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your privacy findings, DSAR requests, or compliance status..."
            disabled={isLoading}
            rows="1"
            aria-label="Type your message"
          />
          <button
            type="submit"
            className="send-button"
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send message"
          >
            <i className="bi bi-send"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
