import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Findings page to display privacy findings with filtering and details
// TODO: Replace with real API calls when backend is implemented
import { useState, useEffect } from 'react';
// @ts-ignore
import { mockApi } from '../../api/mockApi.js';
const Findings = () => {
    const [findings, setFindings] = useState([]);
    const [filteredFindings, setFilteredFindings] = useState([]);
    const [selectedSeverity, setSelectedSeverity] = useState("");
    const [selectedSource, setSelectedSource] = useState("");
    const [isLoading, setIsLoading] = useState(true);
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
        }
        catch (error) {
            console.error('Error loading findings:', error);
        }
        finally {
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
    const getSeverityBadge = (severity) => {
        const badges = {
            critical: { class: 'bg-danger', text: 'Critical' },
            high: { class: 'bg-warning', text: 'High' },
            medium: { class: 'bg-info', text: 'Medium' },
            low: { class: 'bg-secondary', text: 'Low' }
        };
        const badge = badges[severity];
        return (_jsx("span", { className: `badge ${badge.class} text-white`, children: badge.text }));
    };
    const getCategoryIcon = (category) => {
        const icons = {
            PII: 'person-badge',
            PHI: 'heart-pulse',
            Financial: 'credit-card',
            Other: 'exclamation-triangle'
        };
        return icons[category] || 'exclamation-triangle';
    };
    if (isLoading) {
        return (_jsx("div", { className: "d-flex justify-content-center align-items-center", style: { minHeight: '400px' }, children: _jsx("div", { className: "spinner-border text-primary", role: "status", children: _jsx("span", { className: "visually-hidden", children: "Loading..." }) }) }));
    }
    return (_jsxs("div", { children: [_jsxs("div", { className: "d-flex align-items-center justify-content-between mb-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "mb-1", children: "Privacy Findings" }), _jsx("p", { className: "text-muted mb-0", children: "Review and manage detected privacy violations" })] }), _jsx("div", { className: "text-end", children: _jsxs("div", { className: "small text-muted", children: [filteredFindings.length, " of ", findings.length, " findings"] }) })] }), _jsx("div", { className: "card border-0 shadow-sm mb-4", style: { borderRadius: 16 }, children: _jsx("div", { className: "card-body", children: _jsxs("div", { className: "row g-3", children: [_jsxs("div", { className: "col-md-4", children: [_jsx("label", { className: "form-label small", children: "Severity" }), _jsxs("select", { className: "form-select", value: selectedSeverity, onChange: (e) => setSelectedSeverity(e.target.value), children: [_jsx("option", { value: "", children: "All Severities" }), _jsx("option", { value: "critical", children: "Critical" }), _jsx("option", { value: "high", children: "High" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "low", children: "Low" })] })] }), _jsxs("div", { className: "col-md-4", children: [_jsx("label", { className: "form-label small", children: "Source" }), _jsxs("select", { className: "form-select", value: selectedSource, onChange: (e) => setSelectedSource(e.target.value), children: [_jsx("option", { value: "", children: "All Sources" }), _jsx("option", { value: "mongodb_users", children: "MongoDB" }), _jsx("option", { value: "google_drive_hr", children: "Google Drive HR" }), _jsx("option", { value: "google_drive_finance", children: "Google Drive Finance" }), _jsx("option", { value: "slack_workspace", children: "Slack" }), _jsx("option", { value: "s3_uploads", children: "AWS S3" })] })] }), _jsx("div", { className: "col-md-4 d-flex align-items-end", children: _jsx("button", { className: "btn btn-outline-dark", onClick: () => {
                                        setSelectedSeverity('');
                                        setSelectedSource('');
                                    }, children: "Clear Filters" }) })] }) }) }), _jsx("div", { className: "card border-0 shadow-sm", style: { borderRadius: 16 }, children: _jsx("div", { className: "card-body p-0", children: filteredFindings.length === 0 ? (_jsxs("div", { className: "text-center py-5", children: [_jsx("i", { className: "bi bi-shield-check text-success", style: { fontSize: '3rem' } }), _jsx("h5", { className: "mt-3", children: "No Findings" }), _jsx("p", { className: "text-muted", children: "No privacy findings match your current filters." })] })) : (_jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-hover align-middle mb-0", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { children: "Severity" }), _jsx("th", { children: "Category" }), _jsx("th", { children: "Data Type" }), _jsx("th", { children: "Source" }), _jsx("th", { children: "Description" }), _jsx("th", { children: "Records" }), _jsx("th", { children: "Detected" }), _jsx("th", { children: "Status" })] }) }), _jsx("tbody", { children: filteredFindings.map((finding) => (_jsxs("tr", { children: [_jsx("td", { children: getSeverityBadge(finding.severity) }), _jsx("td", { children: _jsxs("div", { className: "d-flex align-items-center gap-2", children: [_jsx("i", { className: `bi bi-${getCategoryIcon(finding.category)}` }), finding.category] }) }), _jsx("td", { children: _jsx("span", { className: "badge bg-light text-dark border", children: finding.dataType }) }), _jsx("td", { children: _jsxs("div", { className: "small", children: [_jsx("div", { className: "fw-medium", children: finding.sourceName }), _jsx("div", { className: "text-muted", children: finding.location })] }) }), _jsx("td", { children: _jsx("div", { className: "small", children: finding.description }) }), _jsx("td", { children: _jsx("span", { className: "badge bg-info text-white", children: finding.recordCount }) }), _jsx("td", { children: _jsx("div", { className: "small text-muted", children: new Date(finding.detectedAt).toLocaleDateString() }) }), _jsx("td", { children: _jsx("span", { className: `badge ${finding.status === 'active' ? 'bg-warning' : 'bg-success'} text-white`, children: finding.status === 'active' ? 'Active' : 'Resolved' }) })] }, finding.id))) })] }) })) }) })] }));
};
export default Findings;
