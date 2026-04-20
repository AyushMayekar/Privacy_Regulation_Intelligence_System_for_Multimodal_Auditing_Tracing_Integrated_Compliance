import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Dashboard.tsx — Prismatic Core Workspace
 *
 * Post-login compliance command center.
 * Mobile: bottom tab bar
 * Tablet (768-1024px): auto-collapsed icon sidebar
 * Desktop (>1024px): full collapsible sidebar
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';
import { useChat } from '../workspace/hooks/useChat';
import WorkspaceSidebar, { NAV_ITEMS } from '../workspace/components/WorkspaceSidebar';
import ChatArea from '../workspace/components/ChatArea';
import InputBar from '../workspace/components/InputBar';
import '../styles/theme.css';
import '../styles/workspace.css';
import IntegrationsPage from './IntegrationsPage';
import FindingsPage from './FindingsPage';
import AuditLogsPage from './AuditLogsPage';
/* ─── Placeholder for non-chat sections ──────────── */
function PlaceholderPage({ title, icon }) {
    return (_jsxs("div", { style: {
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 16, color: 'var(--c-text-3)', padding: 40,
        }, children: [_jsx("div", { style: {
                    width: 56, height: 56, borderRadius: 16,
                    background: 'var(--c-accent-dim)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: 'var(--c-accent)',
                }, children: icon }), _jsx("h2", { style: { fontWeight: 700, fontSize: '1.3rem', color: 'var(--c-text)', margin: 0 }, children: title }), _jsx("p", { style: { margin: 0, fontSize: '0.9rem', textAlign: 'center' }, children: "This section will be available in the next release." })] }));
}
/* ─── Admin email from localStorage ──────────────── */
function getAdminEmail() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('prismatic-session-'));
    if (keys.length)
        return keys[0].replace('prismatic-session-', '');
    return 'admin';
}
/* ─── Topbar ─────────────────────────────────────── */
function TopBar({ adminEmail, onClear }) {
    const { theme, toggleTheme } = useTheme();
    return (_jsxs("header", { className: "ws-topbar", children: [_jsxs("div", { className: "ws-topbar__left", children: [_jsxs(Link, { to: "/", className: "ws-topbar__logo", children: [_jsx("img", { src: "https://res.cloudinary.com/dpuqctqfl/image/upload/v1776519708/Prismatic_Logo_qzrypl.png", alt: "Prismatic" }), _jsx("span", { className: "ws-topbar__logo-name", children: "Prismatic" })] }), _jsx("div", { style: { padding: '0 16px', fontSize: '0.82rem', color: 'var(--c-text-3)' }, children: "Compliance Workspace" })] }), _jsxs("div", { className: "ws-topbar__right", children: [_jsx("button", { className: "ws-icon-btn", onClick: toggleTheme, title: theme === 'dark' ? 'Light mode' : 'Dark mode', id: "ws-theme-topbar-btn", children: theme === 'dark' ? (_jsxs("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("circle", { cx: "12", cy: "12", r: "5" }), _jsx("line", { x1: "12", y1: "1", x2: "12", y2: "3" }), _jsx("line", { x1: "12", y1: "21", x2: "12", y2: "23" }), _jsx("line", { x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }), _jsx("line", { x1: "18.36", y1: "18.36", x2: "19.78", y2: "19.78" }), _jsx("line", { x1: "1", y1: "12", x2: "3", y2: "12" }), _jsx("line", { x1: "21", y1: "12", x2: "23", y2: "12" }), _jsx("line", { x1: "4.22", y1: "19.78", x2: "5.64", y2: "18.36" }), _jsx("line", { x1: "18.36", y1: "5.64", x2: "19.78", y2: "4.22" })] })) : (_jsx("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" }) })) }), _jsx("button", { className: "ws-icon-btn", onClick: onClear, title: "Clear chat session", id: "ws-clear-btn", children: _jsxs("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("polyline", { points: "3 6 5 6 21 6" }), _jsx("path", { d: "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" })] }) }), _jsx("div", { className: "ws-avatar", title: adminEmail, children: adminEmail.slice(0, 2).toUpperCase() })] })] }));
}
/* ─── Mobile Bottom Nav ──────────────────────────── */
function BottomNav({ active, setActive }) {
    // Show only the first 4 nav items on mobile to avoid crowding
    const mobileItems = NAV_ITEMS.slice(0, 4);
    return (_jsx("nav", { className: "ws-bottom-nav", children: mobileItems.map(item => (_jsxs("button", { className: `ws-bottom-nav-item${active === item.key ? ' active' : ''}`, onClick: () => setActive(item.key), "aria-label": item.label, children: [item.icon, _jsx("span", { style: { fontSize: '0.6rem', marginTop: 2 }, children: item.label.split(' ')[0] })] }, item.key))) }));
}
/* ─── Section content ────────────────────────────── */
function SvgDoc() {
    return (_jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }), _jsx("polyline", { points: "14 2 14 8 20 8" })] }));
}
function SvgPlugin() {
    return (_jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("rect", { x: "2", y: "7", width: "6", height: "10", rx: "1" }), _jsx("rect", { x: "16", y: "7", width: "6", height: "10", rx: "1" }), _jsx("path", { d: "M8 12h8" })] }));
}
function SvgShield() {
    return (_jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }) }));
}
function SvgSettings() {
    return (_jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("circle", { cx: "12", cy: "12", r: "3" }), _jsx("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" })] }));
}
/* ─── Main Dashboard ─────────────────────────────── */
export default function Dashboard() {
    const [active, setActive] = useState('chat');
    const adminEmail = useMemo(getAdminEmail, []);
    const { messages, loading, sendMessage, clearChat } = useChat(adminEmail);
    // Derive sidebar stats from messages
    const messageCount = messages.filter(m => m.role === 'user').length;
    const lastScanMsg = [...messages].reverse().find(m => m.responseType === 'scan');
    const lastScanCount = lastScanMsg?.data ? lastScanMsg.data.total_records : undefined;
    const lastAuditMsg = [...messages].reverse().find(m => m.responseType === 'audit');
    const auditCount = lastAuditMsg?.data ? lastAuditMsg.data.total : undefined;
    return (_jsxs("div", { className: "ws-root", children: [_jsx(TopBar, { adminEmail: adminEmail, onClear: clearChat }), _jsxs("div", { className: "ws-body", children: [_jsx(WorkspaceSidebar, { active: active, setActive: setActive, messageCount: messageCount, lastScanCount: lastScanCount, auditCount: auditCount }), _jsxs("main", { className: "ws-main", children: [active === 'chat' && (_jsxs(_Fragment, { children: [_jsx(ChatArea, { messages: messages, loading: loading }), _jsx(InputBar, { onSend: sendMessage, disabled: loading })] })), active === 'audits' && _jsx(AuditLogsPage, {}), active === 'integrations' && _jsx(IntegrationsPage, {}), active === 'findings' && _jsx(FindingsPage, {}), active === 'settings' && _jsx(PlaceholderPage, { title: "Settings", icon: _jsx(SvgSettings, {}) })] })] }), _jsx(BottomNav, { active: active, setActive: setActive })] }));
}
