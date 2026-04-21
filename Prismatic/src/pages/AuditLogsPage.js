import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from 'react';
import { fetchAuditLogs } from '../api/auditApi';
import { transformLogs, formatAction, formatPii, formatPhase, formatTs } from '../utils/auditTransform';
import AuditCharts from '../components/AuditCharts';
import '../styles/auditLogs.css';
/* ── Icons ─────────────────────────────────────── */
const LogsIcon = () => (_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }), _jsx("polyline", { points: "14 2 14 8 20 8" }), _jsx("line", { x1: "16", y1: "13", x2: "8", y2: "13" }), _jsx("line", { x1: "16", y1: "17", x2: "8", y2: "17" }), _jsx("polyline", { points: "10 9 9 9 8 9" })] }));
const RefreshIcon = () => (_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("polyline", { points: "23 4 23 10 17 10" }), _jsx("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" })] }));
const TotalIcon = () => (_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("rect", { x: "2", y: "3", width: "20", height: "14", rx: "2" }), _jsx("line", { x1: "8", y1: "21", x2: "16", y2: "21" }), _jsx("line", { x1: "12", y1: "17", x2: "12", y2: "21" })] }));
const PiiIcon = () => (_jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }) }));
const ActionIcon = () => (_jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("polyline", { points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2" }) }));
const ConfIcon = () => (_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }), _jsx("polyline", { points: "22 4 12 14.01 9 11.01" })] }));
/* ── Helpers ────────────────────────────────────── */
function getUniquePhases(logs) {
    return Array.from(new Set(logs.map(l => l.phase))).sort();
}
/* ── Page ───────────────────────────────────────── */
export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [pageStatus, setPageStatus] = useState('loading');
    const [errorMsg, setErrorMsg] = useState('');
    // Filters
    const [phaseFilter, setPhaseFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    async function loadLogs() {
        setPageStatus('loading');
        setErrorMsg('');
        const query = { limit: 200 };
        if (phaseFilter)
            query.phase = phaseFilter;
        if (dateFrom)
            query.date_from = dateFrom;
        if (dateTo)
            query.date_to = dateTo;
        try {
            const data = await fetchAuditLogs(query);
            setLogs(data);
            setPageStatus('ready');
        }
        catch (err) {
            setErrorMsg(err?.message ?? 'Failed to load audit logs.');
            setPageStatus('error');
        }
    }
    useEffect(() => { loadLogs(); }, []);
    const insights = useMemo(() => transformLogs(logs), [logs]);
    const phases = useMemo(() => getUniquePhases(logs), [logs]);
    // Client-side filter for table only (API already filters but we support quick client filter too)
    const filteredLogs = useMemo(() => {
        return logs.filter(l => {
            if (phaseFilter && l.phase !== phaseFilter)
                return false;
            return true;
        });
    }, [logs, phaseFilter]);
    /* ── Skeleton ── */
    if (pageStatus === 'loading') {
        return (_jsxs("div", { className: "audit-page", children: [_jsx("div", { className: "audit-header", children: _jsxs("div", { children: [_jsx("h1", { className: "audit-header__title", children: "Audit Logs" }), _jsx("p", { className: "audit-header__sub", children: "Loading compliance intelligence\u2026" })] }) }), _jsx("div", { className: "audit-stats", children: [1, 2, 3, 4].map(i => _jsx("div", { className: "audit-skeleton", style: { height: 100 } }, i)) }), _jsx("div", { className: "audit-charts", children: [1, 2, 3].map(i => _jsx("div", { className: "audit-skeleton", style: { height: 200 } }, i)) }), _jsx("div", { className: "audit-skeleton", style: { height: 300 } })] }));
    }
    /* ── Error ── */
    if (pageStatus === 'error') {
        return (_jsxs("div", { className: "audit-page", children: [_jsx("div", { className: "audit-header", children: _jsx("div", { children: _jsx("h1", { className: "audit-header__title", children: "Audit Logs" }) }) }), _jsx("div", { className: "audit-table-card", children: _jsxs("div", { className: "audit-error", children: [_jsx("p", { className: "audit-error__title", children: "Failed to load audit logs" }), _jsx("p", { className: "audit-error__sub", children: errorMsg }), _jsx("button", { className: "audit-retry-btn", onClick: loadLogs, children: "Retry" })] }) })] }));
    }
    return (_jsxs("div", { className: "audit-page", children: [_jsxs("div", { className: "audit-header", children: [_jsxs("div", { className: "audit-header__left", children: [_jsx("h1", { className: "audit-header__title", children: "Audit Logs" }), _jsxs("p", { className: "audit-header__sub", children: ["Compliance intelligence across ", insights.totalLogs.toLocaleString(), " recorded actions"] })] }), _jsxs("div", { className: "audit-filters", children: [_jsxs("select", { className: "audit-select", value: phaseFilter, onChange: e => setPhaseFilter(e.target.value), children: [_jsx("option", { value: "", children: "All Phases" }), phases.map(p => (_jsx("option", { value: p, children: formatPhase(p) }, p)))] }), _jsx("input", { type: "date", className: "audit-date-input", value: dateFrom, onChange: e => setDateFrom(e.target.value), title: "From date" }), _jsx("input", { type: "date", className: "audit-date-input", value: dateTo, onChange: e => setDateTo(e.target.value), title: "To date" }), _jsxs("button", { className: "audit-refresh-btn", onClick: loadLogs, children: [_jsx(RefreshIcon, {}), "Refresh"] })] })] }), _jsx("p", { className: "audit-section-label", children: "Insights" }), _jsxs("div", { className: "audit-stats", children: [_jsxs("div", { className: "audit-stat-card", children: [_jsx("div", { className: "audit-stat-card__icon", children: _jsx(TotalIcon, {}) }), _jsx("div", { className: "audit-stat-card__label", children: "Total Logs" }), _jsx("div", { className: "audit-stat-card__value", children: insights.totalLogs.toLocaleString() }), _jsx("div", { className: "audit-stat-card__sub", children: "compliance records" })] }), _jsxs("div", { className: "audit-stat-card", children: [_jsx("div", { className: "audit-stat-card__icon", children: _jsx(PiiIcon, {}) }), _jsx("div", { className: "audit-stat-card__label", children: "Unique PII Types" }), _jsx("div", { className: "audit-stat-card__value", children: insights.uniquePiiTypes }), _jsx("div", { className: "audit-stat-card__sub", children: "data categories tracked" })] }), _jsxs("div", { className: "audit-stat-card", children: [_jsx("div", { className: "audit-stat-card__icon", children: _jsx(ActionIcon, {}) }), _jsx("div", { className: "audit-stat-card__label", children: "Top Action" }), _jsx("div", { className: `audit-stat-card__value ${insights.mostFrequentAction.length > 10 ? 'audit-stat-card__value--sm' : ''}`, children: formatAction(insights.mostFrequentAction) }), _jsx("div", { className: "audit-stat-card__sub", children: "most applied protection" })] }), _jsxs("div", { className: "audit-stat-card", children: [_jsx("div", { className: "audit-stat-card__icon", children: _jsx(ConfIcon, {}) }), _jsx("div", { className: "audit-stat-card__label", children: "Avg Confidence" }), _jsxs("div", { className: "audit-stat-card__value", children: [insights.avgConfidence, "%"] }), _jsx("div", { className: "audit-stat-card__sub", children: "detection accuracy" })] })] }), insights.totalLogs > 0 && (_jsxs(_Fragment, { children: [_jsx("p", { className: "audit-section-label", children: "Analytics" }), _jsx(AuditCharts, { insights: insights })] })), _jsx("p", { className: "audit-section-label", children: "Detailed Log View" }), _jsxs("div", { className: "audit-table-card", children: [_jsxs("div", { className: "audit-table-header", children: [_jsx("p", { className: "audit-table-title", children: "All Records" }), _jsxs("span", { className: "audit-table-count", children: [filteredLogs.length, " entries"] })] }), filteredLogs.length === 0 ? (_jsxs("div", { className: "audit-empty", children: [_jsx("div", { className: "audit-empty__icon", children: _jsx(LogsIcon, {}) }), _jsx("p", { className: "audit-empty__title", children: "No audit logs found" }), _jsx("p", { className: "audit-empty__sub", children: phaseFilter ? 'Try clearing the phase filter.' : 'Run a compliance scan to generate logs.' })] })) : (_jsx("div", { className: "audit-table-wrap", children: _jsxs("table", { className: "audit-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Timestamp" }), _jsx("th", { children: "PII Type" }), _jsx("th", { children: "Action" }), _jsx("th", { children: "Phase" }), _jsx("th", { children: "Confidence" }), _jsx("th", { children: "Laws" })] }) }), _jsx("tbody", { children: filteredLogs.map((log, i) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("span", { className: "audit-ts", children: formatTs(log.ts) }) }), _jsx("td", { children: _jsx("span", { className: "audit-chip audit-chip--pii", children: formatPii(log.pii) }) }), _jsx("td", { children: _jsx("span", { className: "audit-chip audit-chip--action", children: formatAction(log.act) }) }), _jsx("td", { children: _jsx("span", { className: "audit-chip audit-chip--phase", children: formatPhase(log.phase) }) }), _jsx("td", { children: _jsxs("div", { className: "audit-conf-wrap", children: [_jsx("div", { className: "audit-conf-bar", children: _jsx("div", { className: "audit-conf-fill", style: { width: `${(log.conf ?? 0) * 100}%` } }) }), _jsxs("span", { className: "audit-conf-val", children: [Math.round((log.conf ?? 0) * 100), "%"] })] }) }), _jsx("td", { children: (log.laws ?? []).map(law => (_jsx("span", { className: "audit-chip audit-chip--law", children: law.toUpperCase() }, law))) })] }, i))) })] }) }))] })] }));
}
