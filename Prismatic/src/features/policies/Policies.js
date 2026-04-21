import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Feature: Policies (Regex Rules)
// Purpose: Define custom scan rules (regex/patterns) and test them against sample text.
import { useState } from 'react';
export default function Policies() {
    const [rules, setRules] = useState([
        { id: 'r1', name: 'Email Detector', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[A-Za-z]{2,}', enabled: true },
        { id: 'r2', name: 'Indian PAN (simple)', pattern: '[A-Z]{5}[0-9]{4}[A-Z]{1}', enabled: true },
    ]);
    const [sample, setSample] = useState('Contact me at user@example.com. PAN: ABCDE1234F');
    const [message, setMessage] = useState(null);
    function addRule() {
        setRules(prev => prev.concat({ id: `r_${Date.now()}`, name: 'New Rule', pattern: '', enabled: true }));
    }
    function removeRule(id) {
        setRules(prev => prev.filter(r => r.id !== id));
    }
    function testRules() {
        const enabled = rules.filter(r => r.enabled && r.pattern);
        const results = enabled.map(r => {
            try {
                const re = new RegExp(r.pattern, 'g');
                const matches = sample.match(re) || [];
                return `${r.name}: ${matches.length} matches`;
            }
            catch (e) {
                return `${r.name}: invalid regex`;
            }
        });
        setMessage(results.join('\n'));
    }
    return (_jsx("div", { className: "card border-0 shadow-sm", style: { borderRadius: 16 }, children: _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "d-flex align-items-center justify-content-between mb-3", children: [_jsx("h5", { className: "mb-0", children: "Policies (Regex Rules)" }), _jsx("button", { className: "btn btn-dark", onClick: addRule, children: "Add Rule" })] }), _jsxs("div", { className: "row g-3", children: [_jsx("div", { className: "col-12 col-lg-6", children: _jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table align-middle", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Pattern" }), _jsx("th", { children: "Enabled" }), _jsx("th", { className: "text-end", children: "Action" })] }) }), _jsx("tbody", { children: rules.map(r => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("input", { className: "form-control form-control-sm", value: r.name, onChange: e => setRules(prev => prev.map(x => x.id === r.id ? { ...x, name: e.target.value } : x)) }) }), _jsx("td", { children: _jsx("input", { className: "form-control form-control-sm", value: r.pattern, onChange: e => setRules(prev => prev.map(x => x.id === r.id ? { ...x, pattern: e.target.value } : x)) }) }), _jsx("td", { children: _jsx("div", { className: "form-check form-switch", children: _jsx("input", { className: "form-check-input", type: "checkbox", checked: r.enabled, onChange: e => setRules(prev => prev.map(x => x.id === r.id ? { ...x, enabled: e.target.checked } : x)) }) }) }), _jsx("td", { className: "text-end", children: _jsx("button", { className: "btn btn-outline-dark btn-sm", onClick: () => removeRule(r.id), children: "Remove" }) })] }, r.id))) })] }) }) }), _jsxs("div", { className: "col-12 col-lg-6", children: [_jsx("label", { className: "form-label", children: "Sample Text" }), _jsx("textarea", { className: "form-control", rows: 8, value: sample, onChange: e => setSample(e.target.value) }), _jsx("div", { className: "d-flex justify-content-end mt-2", children: _jsx("button", { className: "btn btn-dark", onClick: testRules, children: "Test" }) }), message && (_jsx("pre", { className: "mt-3 p-3 bg-accent-soft border-accent", style: { border: '1px solid', borderRadius: 8, whiteSpace: 'pre-wrap' }, children: message }))] })] })] }) }));
}
