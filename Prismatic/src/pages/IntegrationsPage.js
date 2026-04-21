import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import IntegrationCard from '../components/IntegrationCard';
import { getIntegrationStatus } from '../api/integrationApi';
import '../styles/integrations.css';
const INTEGRATIONS = [
    {
        id: 'mongo',
        name: 'MongoDB',
        description: 'Connect your MongoDB Atlas cluster to scan and audit collections.',
        type: 'mongo',
        icon: _jsx(MongoIcon, {}),
    },
    {
        id: 'gmail',
        name: 'Gmail',
        description: 'Authorize Gmail access to audit email data for compliance.',
        type: 'gmail',
        icon: _jsx(GmailIcon, {}),
    },
    {
        id: 'postgres',
        name: 'PostgreSQL',
        description: 'Relational database compliance scanning.',
        type: 'dummy',
        icon: _jsx(PostgresIcon, {}),
    },
    {
        id: 'mysql',
        name: 'MySQL',
        description: 'MySQL and MariaDB data audit support.',
        type: 'dummy',
        icon: _jsx(MySQLIcon, {}),
    },
    {
        id: 'slack',
        name: 'Slack',
        description: 'Scan workspace messages for sensitive data exposure.',
        type: 'dummy',
        icon: _jsx(SlackIcon, {}),
    },
    {
        id: 'aws',
        name: 'AWS S3',
        description: 'Audit S3 buckets for data residency and access policies.',
        type: 'dummy',
        icon: _jsx(AWSIcon, {}),
    },
    {
        id: 'stripe',
        name: 'Stripe',
        description: 'PCI-DSS compliance checks on payment data.',
        type: 'dummy',
        icon: _jsx(StripeIcon, {}),
    },
];
/* ── Page ─────────────────────────────────────────── */
export default function IntegrationsPage() {
    const [statuses, setStatuses] = useState({});
    const [pageStatus, setPageStatus] = useState('loading');
    // Try to get admin email from localStorage/sessionStorage if stored there
    const adminEmail = localStorage.getItem('admin_email') ??
        sessionStorage.getItem('admin_email') ??
        undefined;
    async function loadStatuses() {
        setPageStatus('loading');
        try {
            const data = await getIntegrationStatus();
            setStatuses({
                mongo: data.mongo ? 'connected' : 'not_connected',
                gmail: data.gmail ? 'connected' : 'not_connected',
            });
            setPageStatus('ready');
        }
        catch {
            setPageStatus('error');
        }
    }
    useEffect(() => { loadStatuses(); }, []);
    function handleStatusChange(id, status) {
        setStatuses(prev => ({ ...prev, [id]: status }));
    }
    const getStatus = (id) => statuses[id] ?? (id === 'mongo' || id === 'gmail' ? 'not_connected' : 'not_connected');
    const realIntegrations = INTEGRATIONS.filter(i => i.type !== 'dummy');
    const dummyIntegrations = INTEGRATIONS.filter(i => i.type === 'dummy');
    /* ── Loading skeleton ── */
    if (pageStatus === 'loading') {
        return (_jsxs("div", { className: "int-page", children: [_jsx("div", { className: "int-header", children: _jsxs("div", { className: "int-header__left", children: [_jsx("div", { className: "int-header__icon", children: _jsx(PluginIcon, {}) }), _jsxs("div", { children: [_jsx("h1", { className: "int-header__title", children: "Integrations" }), _jsx("p", { className: "int-header__sub", children: "Connect your data sources to enable compliance scanning." })] })] }) }), _jsx("p", { className: "int-section-label", children: "Active Connectors" }), _jsx("div", { className: "int-grid", children: [1, 2].map(i => _jsx("div", { className: "int-skeleton" }, i)) }), _jsx("p", { className: "int-section-label", children: "Coming Soon" }), _jsx("div", { className: "int-grid", children: [1, 2, 3, 4, 5].map(i => _jsx("div", { className: "int-skeleton" }, i)) })] }));
    }
    /* ── Error state ── */
    if (pageStatus === 'error') {
        return (_jsxs("div", { className: "int-page", children: [_jsx("div", { className: "int-header", children: _jsx("h1", { className: "int-header__title", children: "Integrations" }) }), _jsxs("div", { className: "int-load-error", children: [_jsx(ErrorIcon, {}), _jsx("div", { className: "int-load-error__title", children: "Failed to load integration status" }), _jsx("div", { className: "int-load-error__sub", children: "Check your connection and try again." }), _jsx("button", { className: "int-retry-btn", onClick: loadStatuses, children: "Retry" })] })] }));
    }
    return (_jsxs("div", { className: "int-page", children: [_jsxs("div", { className: "int-header", children: [_jsx("h1", { className: "int-header__title", children: "Integrations" }), _jsx("p", { className: "int-header__sub", children: "Connect your data sources to enable compliance scanning." })] }), _jsx("p", { className: "int-section-label", children: "Active Connectors" }), _jsx("div", { className: "int-grid", children: realIntegrations.map(integration => (_jsx(IntegrationCard, { ...integration, status: getStatus(integration.id), adminEmail: adminEmail, onStatusChange: handleStatusChange }, integration.id))) }), _jsx("p", { className: "int-section-label", children: "Coming Soon" }), _jsx("div", { className: "int-grid", children: dummyIntegrations.map(integration => (_jsx(IntegrationCard, { ...integration, status: "not_connected", onStatusChange: handleStatusChange }, integration.id))) })] }));
}
/* ── Icons ──────────────────────────────────────── */
function MongoIcon() {
    return (_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: [_jsx("path", { d: "M12 2C12 2 7 8.5 7 13.5C7 16.538 9.239 19 12 19C14.761 19 17 16.538 17 13.5C17 8.5 12 2 12 2Z", fill: "#00ED64" }), _jsx("path", { d: "M12 19V22", stroke: "#00ED64", strokeWidth: "1.5", strokeLinecap: "round" }), _jsx("path", { d: "M10 15.5C10 15.5 8 14.5 8 12.5", stroke: "#00A24A", strokeWidth: "1", strokeLinecap: "round" })] }));
}
function GmailIcon() {
    return (_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", children: [_jsx("path", { d: "M6 18V8.4L4 7V19a1 1 0 001 1h1z", fill: "#4285F4" }), _jsx("path", { d: "M18 18V8.4l2-1.4V19a1 1 0 01-1 1h-1z", fill: "#34A853" }), _jsx("path", { d: "M6 8.4L12 13l6-4.6V6l-6 4.6L6 6v2.4z", fill: "#EA4335" }), _jsx("path", { d: "M4 7l2 1.4L12 13l6-4.6L20 7l-8 5.8L4 7z", fill: "#FBBC05" })] }));
}
function PostgresIcon() {
    return (_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: [_jsx("ellipse", { cx: "12", cy: "6", rx: "8", ry: "3", stroke: "#336791", strokeWidth: "1.5" }), _jsx("path", { d: "M4 6v5c0 1.657 3.582 3 8 3s8-1.343 8-3V6", stroke: "#336791", strokeWidth: "1.5" }), _jsx("path", { d: "M4 11v5c0 1.657 3.582 3 8 3s8-1.343 8-3v-5", stroke: "#336791", strokeWidth: "1.5" })] }));
}
function MySQLIcon() {
    return (_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: [_jsx("path", { d: "M12 3C8 3 4 4.8 4 7.5V16.5C4 19.2 8 21 12 21C16 21 20 19.2 20 16.5V7.5C20 4.8 16 3 12 3Z", stroke: "#00618A", strokeWidth: "1.5" }), _jsx("path", { d: "M4 12C4 14.7 8 16.5 12 16.5C16 16.5 20 14.7 20 12", stroke: "#00618A", strokeWidth: "1.5" }), _jsx("path", { d: "M4 7.5C4 10.2 8 12 12 12C16 12 20 10.2 20 7.5", stroke: "#F29111", strokeWidth: "1.5" })] }));
}
function SlackIcon() {
    return (_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: [_jsx("path", { d: "M9.5 4.5C9.5 3.4 8.6 2.5 7.5 2.5S5.5 3.4 5.5 4.5v4c0 1.1.9 2 2 2s2-.9 2-2v-4z", fill: "#E01E5A" }), _jsx("path", { d: "M14.5 4.5C14.5 3.4 13.6 2.5 12.5 2.5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2s2-.9 2-2v-4z", fill: "#36C5F0" }), _jsx("path", { d: "M19.5 9.5c1.1 0 2-.9 2-2s-.9-2-2-2h-4c-1.1 0-2 .9-2 2s.9 2 2 2h4z", fill: "#2EB67D" }), _jsx("path", { d: "M19.5 14.5c1.1 0 2-.9 2-2s-.9-2-2-2h-4c-1.1 0-2 .9-2 2s.9 2 2 2h4z", fill: "#ECB22E" }), _jsx("path", { d: "M14.5 19.5c0 1.1.9 2 2 2s2-.9 2-2v-4c0-1.1-.9-2-2-2s-2 .9-2 2v4z", fill: "#E01E5A" }), _jsx("path", { d: "M9.5 19.5c0 1.1.9 2 2 2s2-.9 2-2v-4c0-1.1-.9-2-2-2s-2 .9-2 2v4z", fill: "#36C5F0" }), _jsx("path", { d: "M4.5 14.5c-1.1 0-2 .9-2 2s.9 2 2 2h4c1.1 0 2-.9 2-2s-.9-2-2-2h-4z", fill: "#2EB67D" }), _jsx("path", { d: "M4.5 9.5c-1.1 0-2 .9-2 2s.9 2 2 2h4c1.1 0 2-.9 2-2s-.9-2-2-2h-4z", fill: "#ECB22E" })] }));
}
function AWSIcon() {
    return (_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: [_jsx("path", { d: "M7 15.5C4.5 14.5 3 12.8 3 11C3 8.5 6.5 6.5 12 6.5C17.5 6.5 21 8.5 21 11C21 12.8 19.5 14.5 17 15.5", stroke: "#FF9900", strokeWidth: "1.5", strokeLinecap: "round" }), _jsx("path", { d: "M8 18L6 20M16 18L18 20", stroke: "#FF9900", strokeWidth: "1.5", strokeLinecap: "round" }), _jsx("rect", { x: "7", y: "10", width: "10", height: "8", rx: "1", stroke: "#FF9900", strokeWidth: "1.5" })] }));
}
function StripeIcon() {
    return (_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", children: [_jsx("rect", { x: "2", y: "5", width: "20", height: "14", rx: "2", stroke: "#635BFF", strokeWidth: "1.5" }), _jsx("path", { d: "M10.5 11.5C10.5 10.7 11.2 10.3 12.2 10.5C13.1 10.7 13.8 11.4 14 12.2", stroke: "#635BFF", strokeWidth: "1.5", strokeLinecap: "round" }), _jsx("path", { d: "M13.5 12.5C13.5 13.3 12.8 13.7 11.8 13.5C10.9 13.3 10.2 12.6 10 11.8", stroke: "#635BFF", strokeWidth: "1.5", strokeLinecap: "round" }), _jsx("path", { d: "M2 9H22", stroke: "#635BFF", strokeWidth: "1.5" })] }));
}
function ErrorIcon() {
    return (_jsxs("svg", { width: "40", height: "40", viewBox: "0 0 24 24", fill: "none", stroke: "#7a9e90", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }), _jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })] }));
}
function PluginIcon() {
    return (_jsxs("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", children: [_jsx("path", { d: "M12 2v6M12 16v6M4 12h6M14 12h6", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }), _jsx("circle", { cx: "12", cy: "12", r: "3", stroke: "currentColor", strokeWidth: "2" })] }));
}
