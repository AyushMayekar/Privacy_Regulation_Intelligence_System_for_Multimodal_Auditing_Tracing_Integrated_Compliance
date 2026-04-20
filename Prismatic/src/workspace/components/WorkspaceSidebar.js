import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import { apiLogout } from '../../api/authApi';
/* ─── Nav items ─────────────────────────────────── */
export const NAV_ITEMS = [
    {
        key: 'chat',
        label: 'AI Workspace',
        icon: (_jsx("svg", { width: "17", height: "17", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }) })),
    },
    {
        key: 'audits',
        label: 'Audit Logs',
        icon: (_jsxs("svg", { width: "17", height: "17", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }), _jsx("polyline", { points: "14 2 14 8 20 8" }), _jsx("line", { x1: "16", y1: "13", x2: "8", y2: "13" }), _jsx("line", { x1: "16", y1: "17", x2: "8", y2: "17" })] })),
    },
    {
        key: 'integrations',
        label: 'Integrations',
        icon: (_jsxs("svg", { width: "17", height: "17", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("rect", { x: "2", y: "7", width: "6", height: "10", rx: "1" }), _jsx("rect", { x: "16", y: "7", width: "6", height: "10", rx: "1" }), _jsx("path", { d: "M8 12h8" })] })),
    },
    {
        key: 'findings',
        label: 'Findings',
        icon: (_jsx("svg", { width: "17", height: "17", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }) })),
    },
    {
        key: 'settings',
        label: 'Settings',
        icon: (_jsxs("svg", { width: "17", height: "17", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("circle", { cx: "12", cy: "12", r: "3" }), _jsx("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" })] })),
    },
];
export default function WorkspaceSidebar({ active, setActive, messageCount = 0, lastScanCount, auditCount }) {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const handleLogout = async () => {
        try {
            await apiLogout();
        }
        catch { /* ignore */ }
        navigate('/login');
    };
    return (_jsxs("aside", { className: `ws-sidebar${collapsed ? ' collapsed' : ''}`, children: [_jsx("div", { className: "ws-sidebar__toggle", children: _jsx("button", { className: "ws-toggle-btn", onClick: () => setCollapsed(c => !c), title: collapsed ? 'Expand sidebar' : 'Collapse sidebar', "aria-label": collapsed ? 'Expand sidebar' : 'Collapse sidebar', children: collapsed ? (_jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("polyline", { points: "9 18 15 12 9 6" }) })) : (_jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("polyline", { points: "15 18 9 12 15 6" }) })) }) }), _jsxs("nav", { className: "ws-sidebar__nav", children: [_jsx("div", { className: "ws-sidebar__section-title", children: "Navigation" }), NAV_ITEMS.map(item => (_jsxs("button", { className: `ws-nav-item${active === item.key ? ' active' : ''}`, onClick: () => setActive(item.key), title: item.label, "aria-label": item.label, children: [item.icon, _jsx("span", { className: "ws-nav-item__label", children: item.label })] }, item.key)))] }), _jsxs("div", { className: "ws-sidebar__stats", children: [_jsx("div", { className: "ws-sidebar__section-title", children: "Quick Stats" }), _jsxs("div", { className: "ws-stat-mini", children: [_jsx("div", { className: "ws-stat-mini__value", children: messageCount }), _jsx("div", { className: "ws-stat-mini__label", children: "Messages" }), _jsx("div", { className: "ws-stat-mini__trend up", children: "\u2191 This session" })] }), lastScanCount !== undefined && (_jsxs("div", { className: "ws-stat-mini", children: [_jsx("div", { className: "ws-stat-mini__value", children: lastScanCount.toLocaleString() }), _jsx("div", { className: "ws-stat-mini__label", children: "Last Scan" }), _jsx("div", { className: "ws-stat-mini__trend", children: "Records found" })] })), auditCount !== undefined && (_jsxs("div", { className: "ws-stat-mini", children: [_jsx("div", { className: "ws-stat-mini__value", children: auditCount }), _jsx("div", { className: "ws-stat-mini__label", children: "Audit Entries" })] }))] }), _jsxs("div", { className: "ws-sidebar__actions", children: [_jsxs("button", { className: "ws-action-btn", onClick: toggleTheme, title: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode', "aria-label": "Toggle theme", children: [theme === 'dark' ? (_jsxs("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("circle", { cx: "12", cy: "12", r: "5" }), _jsx("line", { x1: "12", y1: "1", x2: "12", y2: "3" }), _jsx("line", { x1: "12", y1: "21", x2: "12", y2: "23" }), _jsx("line", { x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }), _jsx("line", { x1: "18.36", y1: "18.36", x2: "19.78", y2: "19.78" }), _jsx("line", { x1: "1", y1: "12", x2: "3", y2: "12" }), _jsx("line", { x1: "21", y1: "12", x2: "23", y2: "12" }), _jsx("line", { x1: "4.22", y1: "19.78", x2: "5.64", y2: "18.36" }), _jsx("line", { x1: "18.36", y1: "5.64", x2: "19.78", y2: "4.22" })] })) : (_jsx("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" }) })), _jsx("span", { className: "ws-action-btn__label", children: theme === 'dark' ? 'Light' : 'Dark' })] }), _jsxs("button", { className: "ws-action-btn danger", onClick: handleLogout, title: "Sign out", "aria-label": "Sign out", children: [_jsxs("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }), _jsx("polyline", { points: "16 17 21 12 16 7" }), _jsx("line", { x1: "21", y1: "12", x2: "9", y2: "12" })] }), _jsx("span", { className: "ws-action-btn__label", children: "Sign out" })] })] })] }));
}
