import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Feature: Logs / Audit Trail
// Purpose: Show audit trail with filters and export (CSV/PDF placeholders) for dev/demo.
// Notes: Replace in-memory data + exports with real API/doc generation later.
import { useMemo, useState } from 'react';
import { exportLogsPdf } from '../../utils/pdf';
const ACTIONS = ['Scan Started', 'Scan Completed', 'Integration Connected', 'DSAR Request Completed'];
const SYSTEMS = ['Web', 'Worker', 'API'];
function seed() {
    const now = new Date();
    return Array.from({ length: 55 }).map((_, i) => ({
        id: `log_${i}`,
        date: new Date(now.getTime() - i * 36e5).toISOString(),
        action: ACTIONS[i % ACTIONS.length],
        system: SYSTEMS[i % SYSTEMS.length],
        user: i % 4 === 0 ? 'admin@prismatic.io' : 'tester@prismatic.io',
        result: i % 7 === 0 ? 'Warning' : i % 11 === 0 ? 'Error' : 'Success',
    }));
}
function download(text, filename, type) {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
export default function Logs() {
    const [action, setAction] = useState('');
    const [system, setSystem] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const data = useMemo(seed, []);
    const filtered = useMemo(() => {
        return data.filter(row => {
            const a = action ? row.action === action : true;
            const s = system ? row.system === system : true;
            const t = new Date(row.date).getTime();
            const f = dateFrom ? t >= new Date(dateFrom).getTime() : true;
            const to = dateTo ? t <= new Date(dateTo).getTime() : true;
            return a && s && f && to;
        });
    }, [data, action, system, dateFrom, dateTo]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
    function exportCSV() {
        const header = ['Date', 'Action', 'System', 'User', 'Result'];
        const lines = [header.join(',')].concat(filtered.map(r => [new Date(r.date).toLocaleString(), r.action, r.system, r.user, r.result].join(',')));
        download(lines.join('\n'), 'logs.csv', 'text/csv');
    }
    function exportPDF() {
        const rows = filtered.map(r => [new Date(r.date).toLocaleString(), r.action, r.system, r.user, r.result]);
        exportLogsPdf(rows);
    }
    return (_jsx("div", { className: "card border-0 shadow-sm", style: { borderRadius: 16 }, children: _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "d-flex flex-wrap align-items-end gap-2 mb-3", children: [_jsx("h5", { className: "mb-0 me-auto", children: "Audit Trail" }), _jsxs("div", { children: [_jsx("label", { className: "form-label small mb-1", children: "Action" }), _jsxs("select", { className: "form-select", value: action, onChange: e => { setPage(1); setAction(e.target.value); }, children: [_jsx("option", { value: "", children: "All" }), ACTIONS.map(a => _jsx("option", { value: a, children: a }, a))] })] }), _jsxs("div", { children: [_jsx("label", { className: "form-label small mb-1", children: "System" }), _jsxs("select", { className: "form-select", value: system, onChange: e => { setPage(1); setSystem(e.target.value); }, children: [_jsx("option", { value: "", children: "All" }), SYSTEMS.map(s => _jsx("option", { value: s, children: s }, s))] })] }), _jsxs("div", { children: [_jsx("label", { className: "form-label small mb-1", children: "From" }), _jsx("input", { type: "date", className: "form-control", value: dateFrom, onChange: e => { setPage(1); setDateFrom(e.target.value); } })] }), _jsxs("div", { children: [_jsx("label", { className: "form-label small mb-1", children: "To" }), _jsx("input", { type: "date", className: "form-control", value: dateTo, onChange: e => { setPage(1); setDateTo(e.target.value); } })] })] }), _jsxs("div", { className: "d-flex gap-2 mb-3", children: [_jsxs("button", { className: "btn btn-outline-dark", onClick: exportCSV, children: [_jsx("i", { className: "bi bi-filetype-csv me-1" }), " Export CSV"] }), _jsxs("button", { className: "btn btn-dark", onClick: exportPDF, children: [_jsx("i", { className: "bi bi-filetype-pdf me-1" }), " Export PDF"] })] }), _jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-hover align-middle", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Date" }), _jsx("th", { children: "Action" }), _jsx("th", { children: "System" }), _jsx("th", { children: "User" }), _jsx("th", { children: "Result" })] }) }), _jsx("tbody", { children: pageItems.map(row => (_jsxs("tr", { children: [_jsx("td", { children: new Date(row.date).toLocaleString() }), _jsx("td", { children: row.action }), _jsx("td", { children: row.system }), _jsx("td", { children: row.user }), _jsx("td", { children: row.result === 'Success' ? (_jsx("span", { className: "badge bg-success-subtle text-success border border-success-subtle", children: "\u2705 Success" })) : row.result === 'Warning' ? (_jsx("span", { className: "badge badge-gold", children: "\u26A0\uFE0F Warning" })) : (_jsx("span", { className: "badge bg-danger-subtle text-danger border border-danger-subtle", children: "Error" })) })] }, row.id))) })] }) }), _jsx("nav", { className: "d-flex justify-content-center", children: _jsxs("ul", { className: "pagination mb-0", children: [_jsx("li", { className: `page-item ${page === 1 ? 'disabled' : ''}`, children: _jsx("button", { className: "page-link", onClick: () => setPage(Math.max(1, page - 1)), children: "Previous" }) }), Array.from({ length: totalPages }).map((_, i) => (_jsx("li", { className: `page-item ${page === i + 1 ? 'active' : ''}`, children: _jsx("button", { className: "page-link", onClick: () => setPage(i + 1), children: i + 1 }) }, i))), _jsx("li", { className: `page-item ${page === totalPages ? 'disabled' : ''}`, children: _jsx("button", { className: "page-link", onClick: () => setPage(Math.min(totalPages, page + 1)), children: "Next" }) })] }) })] }) }));
}
