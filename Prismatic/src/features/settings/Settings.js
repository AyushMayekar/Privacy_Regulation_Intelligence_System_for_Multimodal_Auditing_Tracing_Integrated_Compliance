import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Feature: Settings
// Purpose: Organization settings form (org info, admins, notifications, RBAC) for dev/demo.
// Notes: Pure frontend state to be replaced with real API later.
import { useState } from 'react';
export default function Settings() {
    const [orgName, setOrgName] = useState('Prismatic Inc.');
    const [admins, setAdmins] = useState([
        { id: 'a1', email: 'admin@prismatic.io', role: 'Admin' },
        { id: 'a2', email: 'auditor@prismatic.io', role: 'Auditor' },
    ]);
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState('Admin');
    const [prefEmail, setPrefEmail] = useState(true);
    const [prefPush, setPrefPush] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    function addAdmin(e) {
        e.preventDefault();
        if (!newEmail)
            return;
        setAdmins(prev => prev.concat({ id: `a_${Date.now()}`, email: newEmail, role: newRole }));
        setNewEmail('');
        setNewRole('Admin');
    }
    function removeAdmin(id) {
        setAdmins(prev => prev.filter(a => a.id !== id));
    }
    async function saveChanges(e) {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        await new Promise(r => setTimeout(r, 700));
        setSaving(false);
        setMessage('Settings saved successfully.');
        setTimeout(() => setMessage(null), 1200);
    }
    return (_jsx("div", { className: "card border-0 shadow-sm", style: { borderRadius: 16 }, children: _jsxs("div", { className: "card-body", children: [_jsx("h5", { className: "mb-3", children: "Organization Settings" }), _jsxs("form", { onSubmit: saveChanges, className: "row g-3", children: [_jsx("div", { className: "col-12 col-lg-6", children: _jsx("div", { className: "card border-0", style: { borderRadius: 12 }, children: _jsxs("div", { className: "card-body", children: [_jsx("h6", { children: "Organization Info" }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label", children: "Organization Name" }), _jsx("input", { className: "form-control", value: orgName, onChange: e => setOrgName(e.target.value), required: true })] })] }) }) }), _jsx("div", { className: "col-12 col-lg-6", children: _jsx("div", { className: "card border-0", style: { borderRadius: 12 }, children: _jsxs("div", { className: "card-body", children: [_jsx("h6", { children: "Notification Preferences" }), _jsxs("div", { className: "form-check form-switch mb-2", children: [_jsx("input", { className: "form-check-input", type: "checkbox", id: "emailNotif", checked: prefEmail, onChange: e => setPrefEmail(e.target.checked) }), _jsx("label", { className: "form-check-label", htmlFor: "emailNotif", children: "Email notifications" })] }), _jsxs("div", { className: "form-check form-switch", children: [_jsx("input", { className: "form-check-input", type: "checkbox", id: "pushNotif", checked: prefPush, onChange: e => setPrefPush(e.target.checked) }), _jsx("label", { className: "form-check-label", htmlFor: "pushNotif", children: "Push notifications" })] })] }) }) }), _jsx("div", { className: "col-12", children: _jsx("div", { className: "card border-0", style: { borderRadius: 12 }, children: _jsxs("div", { className: "card-body", children: [_jsx("h6", { children: "Admins & Auditors" }), _jsxs("form", { className: "row g-2", onSubmit: addAdmin, children: [_jsx("div", { className: "col-12 col-md-6", children: _jsx("input", { className: "form-control", type: "email", placeholder: "email@example.com", value: newEmail, onChange: e => setNewEmail(e.target.value) }) }), _jsx("div", { className: "col-6 col-md-3", children: _jsxs("select", { className: "form-select", value: newRole, onChange: e => setNewRole(e.target.value), children: [_jsx("option", { children: "Admin" }), _jsx("option", { children: "Auditor" })] }) }), _jsx("div", { className: "col-6 col-md-3 d-grid", children: _jsx("button", { className: "btn btn-dark", type: "submit", children: "Add" }) })] }), _jsx("div", { className: "table-responsive mt-3", children: _jsxs("table", { className: "table align-middle", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Email" }), _jsx("th", { children: "Role" }), _jsx("th", { className: "text-end", children: "Action" })] }) }), _jsx("tbody", { children: admins.map(a => (_jsxs("tr", { children: [_jsx("td", { children: a.email }), _jsx("td", { children: _jsxs("select", { className: "form-select form-select-sm", value: a.role, onChange: e => setAdmins(prev => prev.map(x => x.id === a.id ? { ...x, role: e.target.value } : x)), children: [_jsx("option", { children: "Admin" }), _jsx("option", { children: "Auditor" })] }) }), _jsx("td", { className: "text-end", children: _jsx("button", { className: "btn btn-outline-dark btn-sm", onClick: () => removeAdmin(a.id), children: "Remove" }) })] }, a.id))) })] }) })] }) }) }), _jsxs("div", { className: "col-12", children: [_jsx("div", { className: "d-flex justify-content-end", children: _jsx("button", { className: "btn btn-dark px-4", type: "submit", disabled: saving, children: saving ? 'Saving…' : 'Save Changes' }) }), message && _jsx("div", { className: "alert alert-success mt-3 mb-0", children: message })] })] })] }) }));
}
