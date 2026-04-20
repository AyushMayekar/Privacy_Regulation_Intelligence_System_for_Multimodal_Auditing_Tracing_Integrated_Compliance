import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { connectMongo, getGmailRedirectUrl } from '../api/integrationApi';
export default function IntegrationCard({ id, name, description, icon, status, type, adminEmail, onStatusChange, }) {
    const [mongoUri, setMongoUri] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [localStatus, setLocalStatus] = useState(status);
    const setStatus = (s) => {
        setLocalStatus(s);
        onStatusChange?.(id, s);
    };
    /* ── Mongo connect ── */
    async function handleMongoConnect() {
        if (!mongoUri.trim()) {
            setFeedback({ type: 'error', text: 'Please enter a MongoDB URI.' });
            return;
        }
        setStatus('loading');
        setFeedback(null);
        try {
            const res = await connectMongo(mongoUri.trim());
            setStatus('connected');
            setFeedback({ type: 'success', text: res.message ?? 'MongoDB connected successfully!' });
            setMongoUri('');
        }
        catch (err) {
            setStatus('not_connected');
            setFeedback({ type: 'error', text: err?.message ?? 'Connection failed. Check your URI.' });
        }
    }
    /* ── Gmail connect ── */
    async function handleGmailConnect() {
        setStatus('loading');
        setFeedback(null);
        try {
            const url = await getGmailRedirectUrl();
            window.location.href = url;
        }
        catch (err) {
            setStatus('not_connected');
            setFeedback({ type: 'error', text: err?.message ?? 'Failed to start Gmail OAuth.' });
        }
    }
    const isConnected = localStatus === 'connected';
    const isLoading = localStatus === 'loading';
    return (_jsxs("div", { className: `int-card${isConnected ? ' int-card--connected' : ''}${type === 'dummy' ? ' int-card--dummy' : ''}`, children: [_jsxs("div", { className: "int-card__header", children: [_jsx("div", { className: "int-card__icon", children: icon }), _jsxs("div", { className: "int-card__meta", children: [_jsx("div", { className: "int-card__name", children: name }), _jsx("div", { className: "int-card__desc", children: description })] }), _jsx(StatusBadge, { status: localStatus })] }), type !== 'dummy' && !isConnected && (_jsxs("div", { className: "int-card__body", children: [type === 'mongo' && (_jsxs("div", { className: "int-card__form", children: [_jsx("div", { className: "int-input-wrap", children: _jsx("input", { className: "int-input", type: "text", placeholder: "mongodb+srv://user:pass@cluster.mongodb.net/db", value: mongoUri, onChange: e => { setMongoUri(e.target.value); setFeedback(null); }, disabled: isLoading, spellCheck: false }) }), _jsx("button", { className: "int-btn int-btn--primary", onClick: handleMongoConnect, disabled: isLoading, children: isLoading ? _jsxs(_Fragment, { children: [_jsx("span", { className: "int-spinner" }), "Connecting\u2026"] }) : 'Connect' })] })), type === 'gmail' && (_jsx("button", { className: "int-btn int-btn--gmail", onClick: handleGmailConnect, disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "int-spinner" }), "Redirecting\u2026"] })) : (_jsxs(_Fragment, { children: [_jsx(GoogleColorIcon, {}), "Connect with ", adminEmail ?? 'admin email'] })) }))] })), type !== 'dummy' && isConnected && (_jsxs("div", { className: "int-card__connected-msg", children: [_jsx(CheckIcon, {}), _jsx("span", { children: "Integration active" })] })), type === 'dummy' && (_jsx("div", { className: "int-card__coming-soon", children: "Coming soon" })), feedback && (_jsxs("div", { className: `int-feedback int-feedback--${feedback.type}`, children: [feedback.type === 'error' ? _jsx(AlertIcon, {}) : _jsx(CheckIcon, {}), feedback.text] }))] }));
}
const GoogleColorIcon = () => (_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", children: [_jsx("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "#4285F4" }), _jsx("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }), _jsx("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", fill: "#FBBC05" }), _jsx("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "#EA4335" })] }));
const CheckIcon = () => (_jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("polyline", { points: "20 6 9 17 4 12" }) }));
const AlertIcon = () => (_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 }, children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }), _jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })] }));
