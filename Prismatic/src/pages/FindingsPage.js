import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchFindings } from '../api/findingsApi';
import '../styles/findings.css';
/* ── Palette for charts ─────────────────────────── */
const PALETTE = ['#b0e4cc', '#408a71', '#285a48', '#7ecfb0', '#5ab090', '#a0d4bc', '#2a7060', '#c8eedd'];
/* ── Label helpers ──────────────────────────────── */
const fmt = (s) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const topKey = (dist) => Object.entries(dist).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
/* ── Icons ──────────────────────────────────────── */
const FindingsIcon = () => (_jsxs("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("circle", { cx: "11", cy: "11", r: "8" }), _jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" }), _jsx("line", { x1: "11", y1: "8", x2: "11", y2: "14" }), _jsx("line", { x1: "8", y1: "11", x2: "14", y2: "11" })] }));
const ArrowRightIcon = () => (_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" }), _jsx("polyline", { points: "12 5 19 12 12 19" })] }));
const TotalIcon = () => (_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }), _jsx("polyline", { points: "14 2 14 8 20 8" }), _jsx("line", { x1: "16", y1: "13", x2: "8", y2: "13" }), _jsx("line", { x1: "16", y1: "17", x2: "8", y2: "17" })] }));
const PiiIcon = () => (_jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }) }));
const ConfIcon = () => (_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }), _jsx("polyline", { points: "22 4 12 14.01 9 11.01" })] }));
const MostCommonIcon = () => (_jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("polyline", { points: "22 12 18 12 15 21 9 3 6 12 2 12" }) }));
const WarnIcon = () => (_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }), _jsx("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), _jsx("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })] }));
const FieldIcon = () => (_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("polyline", { points: "16 18 22 12 16 6" }), _jsx("polyline", { points: "8 6 2 12 8 18" })] }));
const LawIcon = () => (_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }), _jsx("path", { d: "M9 12l2 2 4-4" })] }));
/* ── Bar Chart ──────────────────────────────────── */
function BarChart({ dist }) {
    const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 7);
    if (!entries.length)
        return _jsx("p", { style: { fontSize: '0.8rem', color: 'var(--c-text-3)' }, children: "No data" });
    const max = Math.max(...entries.map(e => e[1]));
    return (_jsx("div", { className: "findings-bar-chart", children: entries.map(([key, count]) => (_jsxs("div", { className: "findings-bar-row", children: [_jsx("span", { className: "findings-bar-label", title: fmt(key), children: fmt(key) }), _jsx("div", { className: "findings-bar-track", children: _jsx("div", { className: "findings-bar-fill", style: { width: `${(count / max) * 100}%` } }) }), _jsx("span", { className: "findings-bar-count", children: count })] }, key))) }));
}
/* ── Pie Chart ──────────────────────────────────── */
function PieChart({ dist }) {
    const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (!entries.length)
        return _jsx("p", { style: { fontSize: '0.8rem', color: 'var(--c-text-3)' }, children: "No data" });
    const total = entries.reduce((s, e) => s + e[1], 0);
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
        const d = [`M ${cx} ${cy}`, `L ${x1} ${y1}`, `A ${r} ${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${x2} ${y2}`, 'Z'].join(' ');
        return { key, count, pct, d, color: PALETTE[i % PALETTE.length] };
    });
    return (_jsxs("div", { className: "findings-pie-wrap", children: [_jsxs("svg", { viewBox: "0 0 120 120", style: { width: 120, height: 120, display: 'block', margin: '0 auto' }, children: [slices.map(s => (_jsx("path", { d: s.d, fill: s.color, opacity: 0.9, stroke: "#0f1f1c", strokeWidth: "1" }, s.key))), _jsx("circle", { cx: "60", cy: "60", r: "30", fill: "var(--c-surface-1, #0f1f1c)" }), _jsx("text", { x: "60", y: "56", textAnchor: "middle", fill: "#f5f7f6", fontSize: "14", fontWeight: "700", children: total }), _jsx("text", { x: "60", y: "68", textAnchor: "middle", fill: "#7a9e90", fontSize: "7", children: "findings" })] }), _jsx("div", { className: "findings-pie-legend", children: slices.map(s => (_jsxs("div", { className: "findings-pie-legend-item", children: [_jsx("span", { className: "findings-pie-dot", style: { background: s.color } }), _jsx("span", { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: fmt(s.key) }), _jsxs("span", { className: "findings-pie-pct", children: [Math.round(s.pct * 100), "%"] })] }, s.key))) })] }));
}
/* ── Page ───────────────────────────────────────── */
export default function FindingsPage() {
    const navigate = useNavigate();
    // Read session_id — stored by AI Workspace after scan
    const sessionId = localStorage.getItem('prismatic_session_id') ??
        sessionStorage.getItem('prismatic_session_id') ??
        '';
    const [data, setData] = useState(null);
    const [isEmpty, setIsEmpty] = useState(false);
    const [pageStatus, setPageStatus] = useState('loading');
    const [errorMsg, setErrorMsg] = useState('');
    async function loadFindings() {
        if (!sessionId) {
            setIsEmpty(true);
            setPageStatus('ready');
            return;
        }
        setPageStatus('loading');
        setErrorMsg('');
        try {
            const res = await fetchFindings(sessionId);
            if (res.status === 'empty') {
                setIsEmpty(true);
            }
            else {
                setData(res.data ?? null);
                setIsEmpty(false);
            }
            setPageStatus('ready');
        }
        catch (err) {
            setErrorMsg(err?.message ?? 'Failed to load findings.');
            setPageStatus('error');
        }
    }
    useEffect(() => { loadFindings(); }, []);
    /* ── Skeleton ── */
    if (pageStatus === 'loading') {
        return (_jsxs("div", { className: "findings-page", children: [_jsx("div", { className: "findings-header", children: _jsxs("div", { children: [_jsx("h1", { className: "findings-header__title", children: "Findings" }), _jsx("p", { className: "findings-header__sub", children: "Loading scan insights\u2026" })] }) }), _jsx("div", { className: "findings-stats", children: [1, 2, 3, 4].map(i => _jsx("div", { className: "findings-skeleton", style: { height: 100 } }, i)) }), _jsx("div", { className: "findings-charts", children: [1, 2, 3].map(i => _jsx("div", { className: "findings-skeleton", style: { height: 200 } }, i)) }), _jsx("div", { className: "findings-insights", children: [1, 2, 3].map(i => _jsx("div", { className: "findings-skeleton", style: { height: 80 } }, i)) })] }));
    }
    /* ── Error ── */
    if (pageStatus === 'error') {
        return (_jsxs("div", { className: "findings-page", children: [_jsx("div", { className: "findings-header", children: _jsx("div", { children: _jsx("h1", { className: "findings-header__title", children: "Findings" }) }) }), _jsx("div", { style: { background: 'var(--c-surface-1, #0f1f1c)', border: '1px solid var(--c-border, #1e3530)', borderRadius: 14 }, children: _jsxs("div", { className: "findings-error", children: [_jsx("p", { className: "findings-error__title", children: "Failed to load findings" }), _jsx("p", { className: "findings-error__sub", children: errorMsg }), _jsx("button", { className: "findings-retry-btn", onClick: loadFindings, children: "Retry" })] }) })] }));
    }
    /* ── Empty State ── */
    if (isEmpty || !data) {
        return (_jsxs("div", { className: "findings-page", children: [_jsx("div", { className: "findings-header", children: _jsxs("div", { children: [_jsx("h1", { className: "findings-header__title", children: "Findings" }), _jsx("p", { className: "findings-header__sub", children: "Insights from your latest scan session" })] }) }), _jsxs("div", { className: "findings-empty", children: [_jsx("div", { className: "findings-empty__icon-wrap", children: _jsx(FindingsIcon, {}) }), _jsx("p", { className: "findings-empty__title", children: "No findings yet" }), _jsx("p", { className: "findings-empty__sub", children: "Run a scan using the AI agent to detect PII, map regulations, and view compliance insights here." }), _jsxs("button", { className: "findings-empty__cta", onClick: () => navigate('/dashboard/ai-workspace'), children: ["Go to AI Workspace ", _jsx(ArrowRightIcon, {})] })] })] }));
    }
    /* ── Derived insights ── */
    const mostCommonPii = topKey(data.pii_distribution);
    const topField = topKey(data.field_distribution);
    const topLaw = topKey(data.law_distribution);
    const uniquePiiTypes = Object.keys(data.pii_distribution).length;
    const confidenceLevel = data.avg_confidence >= 80 ? 'High' : data.avg_confidence >= 50 ? 'Moderate' : 'Low';
    return (_jsxs("div", { className: "findings-page", children: [_jsxs("div", { className: "findings-header", children: [_jsxs("div", { className: "findings-header__left", children: [_jsx("h1", { className: "findings-header__title", children: "Findings" }), _jsx("p", { className: "findings-header__sub", children: "Insights from your latest scan session" })] }), sessionId && (_jsxs("div", { className: "findings-session-badge", children: [_jsx("span", { className: "findings-session-badge__dot" }), sessionId.slice(0, 24), "\u2026"] }))] }), _jsx("p", { className: "findings-section-label", children: "Overview" }), _jsxs("div", { className: "findings-stats", children: [_jsxs("div", { className: "findings-stat-card", children: [_jsx("div", { className: "findings-stat-card__icon", children: _jsx(TotalIcon, {}) }), _jsx("div", { className: "findings-stat-card__label", children: "Total Findings" }), _jsx("div", { className: "findings-stat-card__value", children: data.total_findings.toLocaleString() }), _jsx("div", { className: "findings-stat-card__sub", children: "detected across all sources" })] }), _jsxs("div", { className: "findings-stat-card", children: [_jsx("div", { className: "findings-stat-card__icon", children: _jsx(PiiIcon, {}) }), _jsx("div", { className: "findings-stat-card__label", children: "Unique PII Types" }), _jsx("div", { className: "findings-stat-card__value", children: uniquePiiTypes }), _jsx("div", { className: "findings-stat-card__sub", children: "distinct data categories" })] }), _jsxs("div", { className: "findings-stat-card", children: [_jsx("div", { className: "findings-stat-card__icon", children: _jsx(ConfIcon, {}) }), _jsx("div", { className: "findings-stat-card__label", children: "Avg Confidence" }), _jsxs("div", { className: "findings-stat-card__value", children: [data.avg_confidence, "%"] }), _jsxs("div", { className: "findings-stat-card__sub", children: [confidenceLevel.toLowerCase(), " confidence detections"] })] }), _jsxs("div", { className: "findings-stat-card", children: [_jsx("div", { className: "findings-stat-card__icon", children: _jsx(MostCommonIcon, {}) }), _jsx("div", { className: "findings-stat-card__label", children: "Most Common PII" }), _jsx("div", { className: `findings-stat-card__value ${mostCommonPii.length > 10 ? 'findings-stat-card__value--sm' : ''}`, children: fmt(mostCommonPii) }), _jsx("div", { className: "findings-stat-card__sub", children: "highest frequency type" })] })] }), _jsx("p", { className: "findings-section-label", children: "Distributions" }), _jsxs("div", { className: "findings-charts", children: [_jsxs("div", { className: "findings-chart-card", children: [_jsx("p", { className: "findings-chart-card__title", children: "PII Type Breakdown" }), _jsx(BarChart, { dist: data.pii_distribution })] }), _jsxs("div", { className: "findings-chart-card", children: [_jsx("p", { className: "findings-chart-card__title", children: "Regulatory Exposure" }), _jsx(PieChart, { dist: data.law_distribution })] }), _jsxs("div", { className: "findings-chart-card", children: [_jsx("p", { className: "findings-chart-card__title", children: "Top Risk Fields" }), _jsx(BarChart, { dist: data.field_distribution })] })] }), _jsx("p", { className: "findings-section-label", children: "Key Insights" }), _jsxs("div", { className: "findings-insights", children: [_jsxs("div", { className: "findings-insight-card", children: [_jsx("div", { className: "findings-insight-card__icon findings-insight-card__icon--warn", children: _jsx(WarnIcon, {}) }), _jsxs("div", { className: "findings-insight-card__body", children: [_jsx("div", { className: "findings-insight-card__label", children: "Most Sensitive Data" }), _jsxs("div", { className: "findings-insight-card__value", children: [fmt(mostCommonPii), " detected most frequently \u2014 prioritise protection of this type."] })] })] }), _jsxs("div", { className: "findings-insight-card", children: [_jsx("div", { className: "findings-insight-card__icon findings-insight-card__icon--blue", children: _jsx(FieldIcon, {}) }), _jsxs("div", { className: "findings-insight-card__body", children: [_jsx("div", { className: "findings-insight-card__label", children: "Top Risk Field" }), _jsxs("div", { className: "findings-insight-card__value", children: [_jsx("code", { style: { fontSize: '0.82rem', color: '#90caff' }, children: topField }), " has the highest concentration of sensitive data."] })] })] }), _jsxs("div", { className: "findings-insight-card", children: [_jsx("div", { className: "findings-insight-card__icon findings-insight-card__icon--green", children: _jsx(LawIcon, {}) }), _jsxs("div", { className: "findings-insight-card__body", children: [_jsx("div", { className: "findings-insight-card__label", children: "Primary Regulation" }), _jsxs("div", { className: "findings-insight-card__value", children: [topLaw.toUpperCase(), " governs the majority of detected findings \u2014 review obligations immediately."] })] })] })] })] }));
}
