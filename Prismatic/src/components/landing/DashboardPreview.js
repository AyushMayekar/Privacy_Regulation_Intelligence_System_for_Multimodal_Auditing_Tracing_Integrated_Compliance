import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
// SVG area chart path data for compliance score over time
const CHART_POINTS = [
    [0, 115], [47, 100], [94, 110], [141, 84],
    [188, 72], [235, 78], [282, 58], [329, 65],
    [376, 48], [423, 38], [470, 42], [520, 24],
];
function toPath(pts) {
    if (pts.length < 2)
        return '';
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
        const [px, py] = pts[i - 1];
        const [cx, cy] = pts[i];
        const mx = (px + cx) / 2;
        d += ` C ${mx},${py} ${mx},${cy} ${cx},${cy}`;
    }
    return d;
}
const linePath = toPath(CHART_POINTS);
const areaPath = linePath +
    ` L ${CHART_POINTS[CHART_POINTS.length - 1][0]},160 L 0,160 Z`;
const navItems = [
    { icon: '⊞', label: 'Dashboard', active: true },
    { icon: '◎', label: 'Scans' },
    { icon: '⚑', label: 'Violations' },
    { icon: '📋', label: 'Audit Logs' },
    { icon: '⚙', label: 'Policies' },
    { icon: '📊', label: 'Reports' },
];
const metrics = [
    { label: 'Records Scanned', value: '2.41M', trend: '+11.2%', up: true },
    { label: 'Violations Found', value: '47', trend: '-20.9%', up: false },
    { label: 'Compliance Score', value: '94.2%', trend: '+2.1%', up: true },
];
const barData = [
    { label: 'GDPR', pct: 94 },
    { label: 'HIPAA', pct: 87 },
    { label: 'CCPA', pct: 98 },
    { label: 'SOC 2', pct: 73 },
    { label: 'ISO 27701', pct: 81 },
];
const logItems = [
    { action: 'PII exposure detected in payments_db', time: '2m ago', badge: 'warn', badgeLabel: 'Warning' },
    { action: 'Weekly GDPR audit completed', time: '1h ago', badge: 'ok', badgeLabel: 'Passed' },
    { action: 'New data source connected: S3 bucket', time: '3h ago', badge: 'info', badgeLabel: 'Info' },
    { action: 'Consent records updated — 14,200 users', time: '5h ago', badge: 'ok', badgeLabel: 'Passed' },
];
export default function DashboardPreview() {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current)
            return;
        const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting)
            ref.current?.classList.add('visible'); }, { threshold: 0.2 });
        obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    return (_jsx("section", { className: "pris-dbpreview", id: "dashboard-preview", children: _jsxs("div", { className: "pris-dbpreview__inner", children: [_jsxs("div", { className: "pris-dbpreview__header", children: [_jsx("div", { className: "pris-label", children: "Dashboard Preview" }), _jsx("h2", { className: "pris-dbpreview__title", children: "Your compliance command centre" }), _jsx("p", { className: "pris-dbpreview__sub", children: "A live, unified view of your privacy posture \u2014 metrics, charts, and activity logs always at a glance." })] }), _jsxs("div", { className: "pris-db", ref: ref, children: [_jsxs("div", { className: "pris-db__topbar", children: [_jsxs("div", { className: "pris-db__dots", children: [_jsx("div", { className: "pris-db__dot pris-db__dot--r" }), _jsx("div", { className: "pris-db__dot pris-db__dot--y" }), _jsx("div", { className: "pris-db__dot pris-db__dot--g" })] }), _jsx("div", { className: "pris-db__title-bar", children: "Prismatic \u2014 Compliance Dashboard" })] }), _jsxs("div", { className: "pris-db__body", children: [_jsxs("div", { className: "pris-db__sidebar", children: [_jsx("div", { className: "pris-db__sidebar-logo", children: "PRISMATIC" }), navItems.map((item) => (_jsxs("div", { className: `pris-db__nav-item${item.active ? ' active' : ''}`, children: [_jsx("span", { style: { fontSize: '0.9rem' }, children: item.icon }), _jsx("span", { children: item.label })] }, item.label)))] }), _jsxs("div", { className: "pris-db__main", children: [_jsxs("div", { className: "pris-db__greeting", children: ["Hello, ", _jsx("strong", { children: "Admin" }), " \u2014 here's your compliance overview"] }), _jsx("div", { className: "pris-db__metrics", children: metrics.map((m) => (_jsxs("div", { className: "pris-db__metric", children: [_jsx("div", { className: "pris-db__metric-label", children: m.label }), _jsx("div", { className: "pris-db__metric-value", children: m.value }), _jsxs("div", { className: `pris-db__metric-trend pris-db__metric-trend--${m.up ? 'up' : 'down'}`, children: [m.up ? '↑' : '↓', " ", m.trend] })] }, m.label))) }), _jsxs("div", { className: "pris-db__chart-wrap", children: [_jsx("div", { className: "pris-db__chart-title", children: "Compliance Score \u2014 Last 12 Months" }), _jsxs("svg", { className: "pris-db__chart-svg", viewBox: "0 0 520 160", preserveAspectRatio: "none", style: { height: 120 }, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "areaGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#408a71", stopOpacity: "0.35" }), _jsx("stop", { offset: "100%", stopColor: "#408a71", stopOpacity: "0" })] }), _jsxs("linearGradient", { id: "lineGrad", x1: "0", y1: "0", x2: "1", y2: "0", children: [_jsx("stop", { offset: "0%", stopColor: "#408a71" }), _jsx("stop", { offset: "100%", stopColor: "#b0e4cc" })] })] }), [40, 80, 120].map((y) => (_jsx("line", { x1: "0", y1: y, x2: "520", y2: y, stroke: "rgba(176,228,204,0.06)", strokeWidth: "1" }, y))), _jsx("path", { d: areaPath, fill: "url(#areaGrad)" }), _jsx("path", { d: linePath, fill: "none", stroke: "url(#lineGrad)", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" }), CHART_POINTS.map(([x, y], i) => (_jsx("circle", { cx: x, cy: y, r: "3.5", fill: "#b0e4cc" }, i))), ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (_jsx("text", { x: i * 47, y: "156", fontSize: "9", fill: "rgba(176,228,204,0.35)", textAnchor: "middle", children: m }, m)))] })] })] }), _jsxs("div", { className: "pris-db__right", children: [_jsxs("div", { children: [_jsx("div", { className: "pris-db__panel-title", children: "Framework Score" }), _jsx("div", { className: "pris-db__analytics", style: { marginTop: 12 }, children: barData.map(({ label, pct }) => (_jsxs("div", { className: "pris-db__bar-row", children: [_jsx("div", { className: "pris-db__bar-label", children: label }), _jsx("div", { className: "pris-db__bar-track", children: _jsx("div", { className: "pris-db__bar-fill", style: { width: `${pct}%` } }) }), _jsxs("span", { style: { fontSize: '0.7rem', color: 'rgba(176,228,204,0.5)', width: 28, textAlign: 'right' }, children: [pct, "%"] })] }, label))) })] }), _jsxs("div", { children: [_jsx("div", { className: "pris-db__panel-title", children: "Recent Activity" }), _jsx("div", { className: "pris-db__log", style: { marginTop: 12 }, children: logItems.map((item) => (_jsxs("div", { className: "pris-db__log-item", children: [_jsx("div", { className: "pris-db__log-action", children: item.action }), _jsxs("div", { className: "pris-db__log-meta", children: [_jsx("span", { children: item.time }), _jsx("span", { className: `pris-db__log-badge pris-db__log-badge--${item.badge}`, children: item.badgeLabel })] })] }, item.action))) })] })] })] })] })] }) }));
}
