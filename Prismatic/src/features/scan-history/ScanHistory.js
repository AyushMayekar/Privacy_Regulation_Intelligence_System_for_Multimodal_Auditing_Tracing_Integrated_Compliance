import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Feature: Scan History
// Purpose: Display historical scans with search, filters and pagination for dev/demo.
// Notes: Pure frontend state; replace with API integration later.
import { useMemo, useState } from 'react';
const SOURCES = ['Google Drive', 'Slack', 'Salesforce', 'AWS S3'];
function generateData() {
    const out = [];
    for (let i = 0; i < 42; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        out.push({
            id: `scan_${i}`,
            date: d.toISOString(),
            source: SOURCES[i % SOURCES.length],
            findings: Math.floor(Math.random() * 20),
            actions: Math.random() > 0.5 ? 'Auto-remediation' : 'Reviewed',
        });
    }
    return out;
}
export default function ScanHistory() {
    const [query, setQuery] = useState('');
    const [source, setSource] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const data = useMemo(generateData, []);
    const filtered = useMemo(() => {
        return data.filter(row => {
            const matchesQuery = query ? (row.actions.toLowerCase().includes(query.toLowerCase()) || String(row.findings).includes(query)) : true;
            const matchesSource = source ? row.source === source : true;
            const t = new Date(row.date).getTime();
            const fromOk = dateFrom ? t >= new Date(dateFrom).getTime() : true;
            const toOk = dateTo ? t <= new Date(dateTo).getTime() : true;
            return matchesQuery && matchesSource && fromOk && toOk;
        });
    }, [data, query, source, dateFrom, dateTo]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
    function go(p) {
        const next = Math.min(Math.max(1, p), totalPages);
        setPage(next);
    }
    return (_jsx("div", { className: "card border-0 shadow-sm", style: { borderRadius: 16 }, children: _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "d-flex flex-wrap align-items-end gap-2 mb-3", children: [_jsx("div", { className: "me-auto", children: _jsx("h5", { className: "mb-0", children: "Scan History" }) }), _jsxs("div", { className: "", children: [_jsx("label", { className: "form-label small mb-1", children: "Search" }), _jsx("input", { className: "form-control", placeholder: "Findings/Actions", value: query, onChange: e => { setPage(1); setQuery(e.target.value); } })] }), _jsxs("div", { children: [_jsx("label", { className: "form-label small mb-1", children: "Source" }), _jsxs("select", { className: "form-select", value: source, onChange: e => { setPage(1); setSource(e.target.value); }, children: [_jsx("option", { value: "", children: "All" }), SOURCES.map(s => _jsx("option", { value: s, children: s }, s))] })] }), _jsxs("div", { children: [_jsx("label", { className: "form-label small mb-1", children: "From" }), _jsx("input", { type: "date", className: "form-control", value: dateFrom, onChange: e => { setPage(1); setDateFrom(e.target.value); } })] }), _jsxs("div", { children: [_jsx("label", { className: "form-label small mb-1", children: "To" }), _jsx("input", { type: "date", className: "form-control", value: dateTo, onChange: e => { setPage(1); setDateTo(e.target.value); } })] })] }), _jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-hover align-middle", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Date" }), _jsx("th", { children: "Source" }), _jsx("th", { children: "Findings" }), _jsx("th", { children: "Actions Taken" })] }) }), _jsxs("tbody", { children: [pageItems.map(row => (_jsxs("tr", { children: [_jsx("td", { children: new Date(row.date).toLocaleString() }), _jsx("td", { children: row.source }), _jsx("td", { children: row.findings }), _jsx("td", { children: row.actions })] }, row.id))), pageItems.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "text-center text-muted", children: "No results" }) }))] })] }) }), _jsx("nav", { className: "d-flex justify-content-center", children: _jsxs("ul", { className: "pagination mb-0", children: [_jsx("li", { className: `page-item ${page === 1 ? 'disabled' : ''}`, children: _jsx("button", { className: "page-link", onClick: () => go(page - 1), children: "Previous" }) }), Array.from({ length: totalPages }).map((_, i) => (_jsx("li", { className: `page-item ${page === i + 1 ? 'active' : ''}`, children: _jsx("button", { className: "page-link", onClick: () => go(i + 1), children: i + 1 }) }, i))), _jsx("li", { className: `page-item ${page === totalPages ? 'disabled' : ''}`, children: _jsx("button", { className: "page-link", onClick: () => go(page + 1), children: "Next" }) })] }) })] }) }));
}
