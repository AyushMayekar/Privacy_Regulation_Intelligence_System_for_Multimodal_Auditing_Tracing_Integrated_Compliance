import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ResponseRenderer from './ResponseRenderer';
function timeLabel(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
export default function MessageBubble({ message }) {
    const { role, content, timestamp, loading, responseType } = message;
    if (role === 'user') {
        return (_jsxs("div", { className: "ws-msg user", children: [_jsx("div", { className: "ws-msg__avatar user", children: _jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }), _jsx("circle", { cx: "12", cy: "7", r: "4" })] }) }), _jsxs("div", { className: "ws-msg__body", children: [_jsx("div", { className: "ws-msg__meta", children: _jsx("span", { children: timeLabel(timestamp) }) }), _jsx("div", { className: "ws-user-bubble", children: content })] })] }));
    }
    // ── Assistant ──────────────────────────
    const typeLabel = responseType === 'scan' ? 'Scan Result' :
        responseType === 'transform' ? 'Transform Result' :
            responseType === 'audit' ? 'Audit Report' :
                'Prismatic AI';
    return (_jsxs("div", { className: "ws-msg", children: [_jsx("div", { className: "ws-msg__avatar ai", children: "P" }), _jsxs("div", { className: "ws-msg__body", children: [_jsxs("div", { className: "ws-msg__meta", children: [_jsx("span", { style: { fontWeight: 600, color: 'var(--c-accent)' }, children: typeLabel }), _jsx("span", { children: "\u00B7" }), _jsx("span", { children: timeLabel(timestamp) })] }), loading ? (_jsxs("div", { className: "ws-skeleton", children: [_jsx("div", { className: "ws-skeleton__dot" }), _jsx("div", { className: "ws-skeleton__dot" }), _jsx("div", { className: "ws-skeleton__dot" }), _jsx("span", { className: "ws-skeleton__text", children: "Agent is thinking\u2026" })] })) : (_jsx(ResponseRenderer, { message: message }))] })] }));
}
