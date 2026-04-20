import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatAction, formatPii, formatPhase } from '../utils/auditTransform';
// A small palette of greens/teals for pie slices
const PALETTE = [
    '#b0e4cc', '#408a71', '#285a48', '#7ecfb0',
    '#5ab090', '#a0d4bc', '#2a7060', '#c8eedd',
];
export default function AuditCharts({ insights }) {
    return (_jsxs("div", { className: "audit-charts", children: [_jsxs("div", { className: "audit-chart-card", children: [_jsx("p", { className: "audit-chart-card__title", children: "PII Type Breakdown" }), _jsx(BarChart, { dist: insights.piiDistribution, formatter: formatPii })] }), _jsxs("div", { className: "audit-chart-card", children: [_jsx("p", { className: "audit-chart-card__title", children: "Actions Taken" }), _jsx(PieChart, { dist: insights.actionDistribution, formatter: formatAction })] }), _jsxs("div", { className: "audit-chart-card", children: [_jsx("p", { className: "audit-chart-card__title", children: "Phase Breakdown" }), _jsx(BarChart, { dist: insights.phaseDistribution, formatter: formatPhase })] }), insights.timelineData.length > 1 && (_jsxs("div", { className: "audit-chart-card audit-chart-card--wide", children: [_jsx("p", { className: "audit-chart-card__title", children: "Activity Over Time" }), _jsx(LineChart, { data: insights.timelineData })] }))] }));
}
/* ── Bar Chart ────────────────────────────────── */
function BarChart({ dist, formatter, }) {
    const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (!entries.length)
        return _jsx("p", { style: { fontSize: '0.8rem', color: 'var(--c-text-3)' }, children: "No data" });
    const max = Math.max(...entries.map(e => e[1]));
    return (_jsx("div", { className: "audit-bar-chart", children: entries.map(([key, count]) => (_jsxs("div", { className: "audit-bar-row", children: [_jsx("span", { className: "audit-bar-label", title: formatter(key), children: formatter(key) }), _jsx("div", { className: "audit-bar-track", children: _jsx("div", { className: "audit-bar-fill", style: { width: `${(count / max) * 100}%` } }) }), _jsx("span", { className: "audit-bar-count", children: count })] }, key))) }));
}
/* ── Pie Chart ────────────────────────────────── */
function PieChart({ dist, formatter, }) {
    const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (!entries.length)
        return _jsx("p", { style: { fontSize: '0.8rem', color: 'var(--c-text-3)' }, children: "No data" });
    const total = entries.reduce((s, e) => s + e[1], 0);
    // Build SVG conic-gradient-style arcs
    let cumulative = 0;
    const slices = entries.map(([key, count], i) => {
        const pct = count / total;
        const startAngle = cumulative * 360;
        const endAngle = (cumulative + pct) * 360;
        cumulative += pct;
        const toRad = (deg) => (deg - 90) * (Math.PI / 180);
        const cx = 60, cy = 60, r = 54;
        const x1 = cx + r * Math.cos(toRad(startAngle));
        const y1 = cy + r * Math.sin(toRad(startAngle));
        const x2 = cx + r * Math.cos(toRad(endAngle));
        const y2 = cy + r * Math.sin(toRad(endAngle));
        const largeArc = pct > 0.5 ? 1 : 0;
        const d = [
            `M ${cx} ${cy}`,
            `L ${x1} ${y1}`,
            `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
            'Z',
        ].join(' ');
        return { key, count, pct, d, color: PALETTE[i % PALETTE.length] };
    });
    return (_jsxs("div", { className: "audit-pie-wrap", children: [_jsxs("svg", { viewBox: "0 0 120 120", className: "audit-pie", children: [slices.map(s => (_jsx("path", { d: s.d, fill: s.color, opacity: 0.9, stroke: "#0f1f1c", strokeWidth: "1" }, s.key))), _jsx("circle", { cx: "60", cy: "60", r: "30", fill: "var(--c-surface-1, #0f1f1c)" }), _jsx("text", { x: "60", y: "56", textAnchor: "middle", fill: "#f5f7f6", fontSize: "14", fontWeight: "700", children: total }), _jsx("text", { x: "60", y: "68", textAnchor: "middle", fill: "#7a9e90", fontSize: "7", children: "total" })] }), _jsx("div", { className: "audit-pie-legend", children: slices.slice(0, 5).map(s => (_jsxs("div", { className: "audit-pie-legend-item", children: [_jsx("span", { className: "audit-pie-dot", style: { background: s.color } }), _jsx("span", { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: formatter(s.key) }), _jsxs("span", { className: "audit-pie-pct", children: [Math.round(s.pct * 100), "%"] })] }, s.key))) })] }));
}
/* ── Line Chart (SVG) ─────────────────────────── */
function LineChart({ data }) {
    const W = 800, H = 120, PAD = { top: 12, right: 16, bottom: 8, left: 28 };
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const maxVal = Math.max(...data.map(d => d.count), 1);
    const points = data.map((d, i) => ({
        x: PAD.left + (i / (data.length - 1 || 1)) * innerW,
        y: PAD.top + innerH - (d.count / maxVal) * innerH,
        ...d,
    }));
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = [
        `M ${points[0].x} ${PAD.top + innerH}`,
        ...points.map(p => `L ${p.x} ${p.y}`),
        `L ${points[points.length - 1].x} ${PAD.top + innerH}`,
        'Z',
    ].join(' ');
    // show at most 6 date labels
    const labelIndices = data.length <= 6
        ? data.map((_, i) => i)
        : [0, Math.floor(data.length / 5), Math.floor(data.length * 2 / 5),
            Math.floor(data.length * 3 / 5), Math.floor(data.length * 4 / 5), data.length - 1];
    const formatDate = (d) => {
        try {
            return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        }
        catch {
            return d;
        }
    };
    return (_jsx("div", { className: "audit-line-chart", children: _jsxs("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "none", style: { height: 110 }, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "audit-area-grad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#408a71", stopOpacity: "0.3" }), _jsx("stop", { offset: "100%", stopColor: "#408a71", stopOpacity: "0" })] }) }), [0.25, 0.5, 0.75, 1].map(f => {
                    const y = PAD.top + innerH * (1 - f);
                    return (_jsxs("g", { children: [_jsx("line", { x1: PAD.left, y1: y, x2: PAD.left + innerW, y2: y, stroke: "#1e3530", strokeWidth: "1", strokeDasharray: "3 4" }), _jsx("text", { x: PAD.left - 4, y: y + 4, textAnchor: "end", fill: "#7a9e90", fontSize: "9", children: Math.round(maxVal * f) })] }, f));
                }), _jsx("path", { d: areaD, fill: "url(#audit-area-grad)" }), _jsx("path", { d: pathD, fill: "none", stroke: "#408a71", strokeWidth: "2", strokeLinejoin: "round", strokeLinecap: "round" }), points.map((p, i) => (_jsx("circle", { cx: p.x, cy: p.y, r: "3", fill: "#b0e4cc", stroke: "#0f1f1c", strokeWidth: "1.5" }, i))), labelIndices.map(i => (_jsx("text", { x: points[i].x, y: H - 1, textAnchor: "middle", fill: "#7a9e90", fontSize: "8", children: formatDate(data[i].date) }, i)))] }) }));
}
