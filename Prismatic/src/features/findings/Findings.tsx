// Findings page to display privacy findings with filtering and details
// TODO: Replace with real API calls when backend is implemented

import React, { useState, useEffect } from 'react';
// @ts-ignore
import { mockApi } from '../../api/mockApi.js';

type Severity = "critical" | "high" | "medium" | "low";
type Category = "PII" | "PHI" | "Financial" | "Other";

interface Finding {
  id: string;
  severity: Severity;
  category: Category;
  dataType: string;
  sourceId: string;
  sourceName: string;
  location: string;
  description: string;
  recordCount: number;
  detectedAt: string;
  status: "active" | "resolved";
}

const Findings = () => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [filteredFindings, setFilteredFindings] = useState<Finding[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | "">("");
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadFindings();
  }, []);

  useEffect(() => {
    filterFindings();
  }, [findings, selectedSeverity, selectedSource]);

  const loadFindings = async () => {
    try {
      setIsLoading(true);
      const response = await mockApi.getAllFindings();
      setFindings(response.data || []);
    } catch (error) {
      console.error('Error loading findings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterFindings = () => {
    let filtered = [...findings];

    if (selectedSeverity) {
      filtered = filtered.filter(finding => finding.severity === selectedSeverity);
    }

    if (selectedSource) {
      filtered = filtered.filter(finding => finding.sourceId === selectedSource);
    }

    setFilteredFindings(filtered);
  };

  const getSeverityBadge = (severity: Severity) => {
    const badges = {
      critical: { class: 'bg-danger', text: 'Critical' },
      high: { class: 'bg-warning', text: 'High' },
      medium: { class: 'bg-info', text: 'Medium' },
      low: { class: 'bg-secondary', text: 'Low' }
    };
    
    const badge = badges[severity];
    
    return (
      <span className={`badge ${badge.class} text-white`}>
        {badge.text}
      </span>
    );
  };

  const getCategoryIcon = (category:Category) => {
    const icons = {
      PII: 'person-badge',
      PHI: 'heart-pulse',
      Financial: 'credit-card',
      Other: 'exclamation-triangle'
    };
    
    return icons[category] || 'exclamation-triangle';
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="mb-1">Privacy Findings</h4>
          <p className="text-muted mb-0">Review and manage detected privacy violations</p>
        </div>
        <div className="text-end">
          <div className="small text-muted">
            {filteredFindings.length} of {findings.length} findings
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label small">Severity</label>
              <select 
                className="form-select" 
                value={selectedSeverity} 
                onChange={(e) => setSelectedSeverity(e.target.value as Severity | "")}
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small">Source</label>
              <select 
                className="form-select" 
                value={selectedSource} 
                onChange={(e) => setSelectedSource(e.target.value)}
              >
                <option value="">All Sources</option>
                <option value="mongodb_users">MongoDB</option>
                <option value="google_drive_hr">Google Drive HR</option>
                <option value="google_drive_finance">Google Drive Finance</option>
                <option value="slack_workspace">Slack</option>
                <option value="s3_uploads">AWS S3</option>
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button 
                className="btn btn-outline-dark"
                onClick={() => {
                  setSelectedSeverity('');
                  setSelectedSource('');
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Findings List */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
        <div className="card-body p-0">
          {filteredFindings.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-shield-check text-success" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3">No Findings</h5>
              <p className="text-muted">No privacy findings match your current filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Severity</th>
                    <th>Category</th>
                    <th>Data Type</th>
                    <th>Source</th>
                    <th>Description</th>
                    <th>Records</th>
                    <th>Detected</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFindings.map((finding) => (
                    <tr key={finding.id}>
                      <td>{getSeverityBadge(finding.severity)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <i className={`bi bi-${getCategoryIcon(finding.category)}`}></i>
                          {finding.category}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {finding.dataType}
                        </span>
                      </td>
                      <td>
                        <div className="small">
                          <div className="fw-medium">{finding.sourceName}</div>
                          <div className="text-muted">{finding.location}</div>
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          {finding.description}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-info text-white">
                          {finding.recordCount}
                        </span>
                      </td>
                      <td>
                        <div className="small text-muted">
                          {new Date(finding.detectedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${finding.status === 'active' ? 'bg-warning' : 'bg-success'} text-white`}>
                          {finding.status === 'active' ? 'Active' : 'Resolved'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Findings;
