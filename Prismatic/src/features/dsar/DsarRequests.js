import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Feature: DSAR Requests
// Purpose: Manage DSAR requests (view/process) for dev/demo with modal confirmation.
// Notes: Pure frontend state; replace with API integration later.
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getActiveSession } from '../../services/DummyDatabase.jsx';
import { exportDsarReportPdf } from '../../utils/pdf';
function seed() {
    const now = new Date();
    return Array.from({ length: 12 }).map((_, i) => ({
        id: `dsar_${i}`,
        date: new Date(now.getTime() - i * 86400000).toISOString(),
        type: i % 2 === 0 ? 'Delete' : 'Export',
        status: i % 3 === 0 ? 'Completed' : 'Pending',
    }));
}
export default function DsarRequests() {
    const [rows, setRows] = useState(seed());
    const [selected, setSelected] = useState(null);
    const modalRef = useRef(null);
    const [message, setMessage] = useState(null);
    const bsInstanceRef = useRef(null);
    useEffect(() => {
        if (modalRef.current && !bsInstanceRef.current) {
            // @ts-ignore
            bsInstanceRef.current = new window.bootstrap.Modal(modalRef.current, { backdrop: 'static', keyboard: false });
        }
    }, []);
    function open(row) {
        setSelected(row);
        setMessage(null);
        if (!bsInstanceRef.current && modalRef.current) {
            // @ts-ignore
            bsInstanceRef.current = new window.bootstrap.Modal(modalRef.current, { backdrop: 'static', keyboard: false });
        }
        bsInstanceRef.current?.show();
    }
    function close() {
        bsInstanceRef.current?.hide();
    }
    async function processRequest() {
        if (!selected)
            return;
        // RBAC: only admin/processor can process
        const role = getActiveSession()?.user?.role;
        if (role !== 'admin' && role !== 'processor') {
            setMessage('You do not have permission to process this request.');
            return;
        }
        setRows(prev => prev.map(r => r.id === selected.id ? { ...r, status: 'Processing' } : r));
        setMessage('Processing…');
        // Longer delay to avoid modal rapid hide/show causing flicker
        await new Promise(r => setTimeout(r, 1000));
        const success = Math.random() > 0.1;
        setRows(prev => prev.map(r => r.id === selected.id ? { ...r, status: success ? 'Completed' : 'Failed' } : r));
        setMessage(success ? 'Request completed successfully.' : 'Failed to complete request.');
        // Keep modal stable for a moment to avoid flicker
        setTimeout(() => { setMessage(null); close(); }, 1200);
    }
    function viewReport(row) {
        const who = getActiveSession()?.user?.email || 'unknown';
        exportDsarReportPdf({ id: row.id, type: row.type, date: new Date(row.date).toLocaleString(), status: row.status, processedBy: who, items: Math.floor(Math.random() * 50) });
    }
    const counters = useMemo(() => {
        return {
            pending: rows.filter(r => r.status === 'Pending').length,
            completed: rows.filter(r => r.status === 'Completed').length,
        };
    }, [rows]);
    const modalNode = createPortal(_jsx("div", { className: "modal", tabIndex: -1, ref: modalRef, "aria-hidden": "true", "data-bs-backdrop": "static", "data-bs-keyboard": "false", style: { display: 'none' }, children: _jsx("div", { className: "modal-dialog modal-dialog-centered", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h5", { className: "modal-title", children: "Process DSAR Request" }), _jsx("button", { type: "button", className: "btn-close", "aria-label": "Close", onClick: close })] }), _jsxs("div", { className: "modal-body", children: [_jsx("p", { className: "mb-2", children: "Confirm processing this request?" }), selected && (_jsxs("ul", { className: "small text-muted mb-0", children: [_jsxs("li", { children: ["ID: ", selected.id] }), _jsxs("li", { children: ["Type: ", selected.type] }), _jsxs("li", { children: ["Date: ", new Date(selected.date).toLocaleString()] })] })), message && _jsx("div", { className: "alert alert-info mt-3 mb-0", children: message })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-outline-dark", onClick: close, children: "Cancel" }), _jsx("button", { type: "button", className: "btn btn-dark", onClick: processRequest, children: "Confirm" })] })] }) }) }), document.body);
    return (_jsxs("div", { className: "card border-0 shadow-sm", style: { borderRadius: 16 }, children: [_jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "d-flex align-items-center justify-content-between mb-3", children: [_jsx("h5", { className: "mb-0", children: "DSAR Requests" }), _jsxs("div", { className: "d-flex gap-3 small text-muted", children: [_jsxs("span", { children: ["Pending: ", counters.pending] }), _jsxs("span", { children: ["Completed: ", counters.completed] })] })] }), _jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-hover align-middle", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Request Date" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Status" }), _jsx("th", { className: "text-end", children: "Actions" })] }) }), _jsx("tbody", { children: rows.map(r => (_jsxs("tr", { children: [_jsx("td", { children: new Date(r.date).toLocaleString() }), _jsx("td", { children: r.type }), _jsx("td", { children: r.status === 'Completed' ? (_jsx("span", { className: "badge bg-success-subtle text-success border border-success-subtle", children: "Completed" })) : r.status === 'Processing' ? (_jsx("span", { className: "badge badge-gold", children: "Processing" })) : r.status === 'Failed' ? (_jsx("span", { className: "badge bg-danger-subtle text-danger border border-danger-subtle", children: "Failed" })) : (_jsx("span", { className: "badge bg-secondary-subtle text-dark border border-secondary-subtle", children: "Pending" })) }), _jsx("td", { className: "text-end", children: _jsxs("div", { className: "btn-group", children: [_jsx("button", { className: "btn btn-outline-dark btn-sm", onClick: () => open(r), disabled: getActiveSession()?.user?.role === 'auditor', children: "Process" }), _jsx("button", { className: "btn btn-dark btn-sm", onClick: () => viewReport(r), children: "View Report" })] }) })] }, r.id))) })] }) })] }), modalNode] }));
}
