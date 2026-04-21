import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsSidebar from '../components/SettingsSidebar';
import ToggleSwitch from '../components/ToggleSwitch';
import '../styles/settings.css';
/* ── Helpers ─────────────────────────────────────── */
function getAdminEmail() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('prismatic-session-'));
    return keys[0]?.replace('prismatic-session-', '') ?? '';
}
/* ── Icons ───────────────────────────────────────── */
const EditIcon = () => (_jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }), _jsx("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })] }));
const CheckIcon = () => (_jsx("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("polyline", { points: "20 6 9 17 4 12" }) }));
const XIcon = () => (_jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), _jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })] }));
const ArrowRightIcon = () => (_jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" }), _jsx("polyline", { points: "12 5 19 12 12 19" })] }));
const EyeIcon = () => (_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }), _jsx("circle", { cx: "12", cy: "12", r: "3" })] }));
const EyeOffIcon = () => (_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" }), _jsx("line", { x1: "1", y1: "1", x2: "23", y2: "23" })] }));
/* ── Page ────────────────────────────────────────── */
export default function SettingsPage() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [pageStatus, setPageStatus] = useState('loading');
    // Profile edit state
    const [editingName, setEditingName] = useState(false);
    const [editingOrg, setEditingOrg] = useState(false);
    const [nameVal, setNameVal] = useState('');
    const [orgVal, setOrgVal] = useState('');
    const [profileMsg, setProfileMsg] = useState(null);
    // Security state
    const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
    const [showPw, setShowPw] = useState(false);
    const [pwMsg, setPwMsg] = useState(null);
    const [pwLoading, setPwLoading] = useState(false);
    // Preferences state (UI only — no backend)
    const [darkMode, setDarkMode] = useState(true);
    const [aiStyle, setAiStyle] = useState('concise');
    const [confThreshold, setConfThreshold] = useState(75);
    // Danger modal
    const [dangerAction, setDangerAction] = useState(null);
    // Section refs for scroll
    const sectionRefs = {
        profile: useRef(null),
        organization: useRef(null),
        security: useRef(null),
        integrations: useRef(null),
        preferences: useRef(null),
        danger: useRef(null),
    };
    const BASE_URL = import.meta.env.VITE_API_URL ?? '';
    async function loadProfile() {
        setPageStatus('loading');
        try {
            const res = await fetch(`${BASE_URL}/auth/profile`, { credentials: 'include' });
            if (!res.ok)
                throw new Error('Failed to fetch profile');
            const data = await res.json();
            setProfile(data);
            setNameVal(data.admin_name);
            setOrgVal(data.org_name);
            setPageStatus('ready');
        }
        catch {
            // Fallback: read email from localStorage, show partial data
            const email = getAdminEmail();
            setProfile({
                admin_name: '',
                admin_email: email,
                org_name: '',
                MongoConnection: false,
                GmailConnection: false,
            });
            setPageStatus('ready');
        }
    }
    useEffect(() => { loadProfile(); }, []);
    function handleSectionSelect(id) {
        setActiveSection(id);
        sectionRefs[id]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    /* ── Name save (UI only) ── */
    function handleSaveName() {
        if (!nameVal.trim()) {
            setProfileMsg({ type: 'error', text: 'Name cannot be empty.' });
            return;
        }
        setProfile(p => p ? { ...p, admin_name: nameVal.trim() } : p);
        setEditingName(false);
        setProfileMsg({ type: 'success', text: 'Name updated.' });
        setTimeout(() => setProfileMsg(null), 3000);
    }
    /* ── Org save (UI only) ── */
    function handleSaveOrg() {
        if (!orgVal.trim()) {
            setProfileMsg({ type: 'error', text: 'Organization name cannot be empty.' });
            return;
        }
        setProfile(p => p ? { ...p, org_name: orgVal.trim() } : p);
        setEditingOrg(false);
        setProfileMsg({ type: 'success', text: 'Organization updated.' });
        setTimeout(() => setProfileMsg(null), 3000);
    }
    /* ── Password change (UI only) ── */
    async function handlePwChange() {
        if (!pwForm.current) {
            setPwMsg({ type: 'error', text: 'Enter your current password.' });
            return;
        }
        if (pwForm.next.length < 8) {
            setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
            return;
        }
        if (pwForm.next !== pwForm.confirm) {
            setPwMsg({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        setPwLoading(true);
        setPwMsg(null);
        // Stub — backend endpoint not yet implemented
        await new Promise(r => setTimeout(r, 800));
        setPwLoading(false);
        setPwMsg({ type: 'success', text: 'Password change request sent.' });
        setPwForm({ current: '', next: '', confirm: '' });
        setTimeout(() => setPwMsg(null), 4000);
    }
    if (pageStatus === 'loading') {
        return (_jsxs("div", { className: "settings-page", children: [_jsxs("div", { className: "settings-nav", children: [_jsx("p", { className: "settings-nav__label", children: "Settings" }), [1, 2, 3, 4, 5].map(i => (_jsx("div", { className: "settings-skeleton", style: { height: 34, borderRadius: 9, marginBottom: 2 } }, i)))] }), _jsxs("div", { className: "settings-content", children: [_jsx("div", { className: "settings-header", children: _jsx("h1", { className: "settings-header__title", children: "Settings" }) }), [100, 80, 120, 90].map((h, i) => (_jsx("div", { className: "settings-skeleton", style: { height: h, marginBottom: '0.875rem' } }, i)))] })] }));
    }
    return (_jsxs("div", { className: "settings-page", children: [_jsx(SettingsSidebar, { active: activeSection, onSelect: handleSectionSelect }), _jsxs("div", { className: "settings-content", children: [_jsxs("div", { className: "settings-header", children: [_jsx("h1", { className: "settings-header__title", children: "Settings" }), _jsx("p", { className: "settings-header__sub", children: "Manage your account, organization, and workspace preferences." })] }), _jsxs("div", { className: "settings-section", ref: sectionRefs.profile, id: "profile", children: [_jsx("p", { className: "settings-section-label", children: "Profile" }), _jsxs("div", { className: "settings-card", children: [_jsxs("div", { className: "settings-row", children: [_jsxs("div", { children: [_jsx("p", { className: "settings-row__label", children: "Admin Name" }), _jsx("p", { className: "settings-row__sub", children: "Your display name in the workspace." })] }), _jsx("div", { className: "settings-row__right", children: editingName ? (_jsxs(_Fragment, { children: [_jsx("input", { className: "settings-input", style: { width: 180 }, value: nameVal, onChange: e => setNameVal(e.target.value), autoFocus: true, onKeyDown: e => { if (e.key === 'Enter')
                                                                handleSaveName(); if (e.key === 'Escape')
                                                                setEditingName(false); } }), _jsx("button", { className: "settings-btn settings-btn--primary settings-btn--sm", onClick: handleSaveName, children: _jsx(CheckIcon, {}) }), _jsx("button", { className: "settings-btn settings-btn--ghost settings-btn--sm", onClick: () => { setEditingName(false); setNameVal(profile?.admin_name ?? ''); }, children: _jsx(XIcon, {}) })] })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: "settings-row__value", children: profile?.admin_name || '—' }), _jsxs("button", { className: "settings-btn settings-btn--ghost settings-btn--sm", onClick: () => setEditingName(true), children: [_jsx(EditIcon, {}), " Edit"] })] })) })] }), _jsxs("div", { className: "settings-row", children: [_jsxs("div", { children: [_jsx("p", { className: "settings-row__label", children: "Admin Email" }), _jsx("p", { className: "settings-row__sub", children: "Your login email \u2014 cannot be changed." })] }), _jsxs("div", { className: "settings-row__right", children: [_jsx("span", { className: "settings-row__value", children: profile?.admin_email || '—' }), _jsx("span", { style: { fontSize: '0.7rem', color: 'var(--c-text-3)', background: 'var(--c-surface-2,#162420)', padding: '0.2rem 0.5rem', borderRadius: 6, border: '1px solid var(--c-border)' }, children: "Locked" })] })] }), profileMsg && (_jsx("div", { style: { padding: '0 1.25rem 1rem' }, children: _jsx("div", { className: `settings-feedback settings-feedback--${profileMsg.type}`, children: profileMsg.text }) }))] })] }), _jsxs("div", { className: "settings-section", ref: sectionRefs.organization, id: "organization", children: [_jsx("p", { className: "settings-section-label", children: "Organization" }), _jsx("div", { className: "settings-card", children: _jsxs("div", { className: "settings-row", children: [_jsxs("div", { children: [_jsx("p", { className: "settings-row__label", children: "Organization Name" }), _jsx("p", { className: "settings-row__sub", children: "The name registered with your Prismatic workspace." })] }), _jsx("div", { className: "settings-row__right", children: editingOrg ? (_jsxs(_Fragment, { children: [_jsx("input", { className: "settings-input", style: { width: 200 }, value: orgVal, onChange: e => setOrgVal(e.target.value), autoFocus: true, onKeyDown: e => { if (e.key === 'Enter')
                                                            handleSaveOrg(); if (e.key === 'Escape')
                                                            setEditingOrg(false); } }), _jsx("button", { className: "settings-btn settings-btn--primary settings-btn--sm", onClick: handleSaveOrg, children: _jsx(CheckIcon, {}) }), _jsx("button", { className: "settings-btn settings-btn--ghost settings-btn--sm", onClick: () => { setEditingOrg(false); setOrgVal(profile?.org_name ?? ''); }, children: _jsx(XIcon, {}) })] })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: "settings-row__value", children: profile?.org_name || '—' }), _jsxs("button", { className: "settings-btn settings-btn--ghost settings-btn--sm", onClick: () => setEditingOrg(true), children: [_jsx(EditIcon, {}), " Edit"] })] })) })] }) })] }), _jsxs("div", { className: "settings-section", ref: sectionRefs.security, id: "security", children: [_jsx("p", { className: "settings-section-label", children: "Security" }), _jsx("div", { className: "settings-card", children: _jsxs("div", { className: "settings-row settings-row--col", children: [_jsxs("div", { children: [_jsx("p", { className: "settings-row__label", children: "Change Password" }), _jsx("p", { className: "settings-row__sub", children: "Use a strong password of at least 8 characters." })] }), _jsxs("div", { className: "settings-input-group", children: [_jsxs("div", { style: { position: 'relative' }, children: [_jsx("input", { className: "settings-input", type: showPw ? 'text' : 'password', placeholder: "Current password", value: pwForm.current, onChange: e => setPwForm(p => ({ ...p, current: e.target.value })), style: { paddingRight: 38 } }), _jsx("button", { type: "button", onClick: () => setShowPw(v => !v), style: { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--c-text-3)', cursor: 'pointer', padding: 0, display: 'flex' }, tabIndex: -1, children: showPw ? _jsx(EyeOffIcon, {}) : _jsx(EyeIcon, {}) })] }), _jsx("input", { className: "settings-input", type: showPw ? 'text' : 'password', placeholder: "New password (min. 8 chars)", value: pwForm.next, onChange: e => setPwForm(p => ({ ...p, next: e.target.value })) }), _jsx("input", { className: "settings-input", type: showPw ? 'text' : 'password', placeholder: "Confirm new password", value: pwForm.confirm, onChange: e => setPwForm(p => ({ ...p, confirm: e.target.value })) }), _jsx("div", { children: _jsx("button", { className: "settings-btn settings-btn--primary", onClick: handlePwChange, disabled: pwLoading, children: pwLoading ? _jsxs(_Fragment, { children: [_jsx("span", { className: "settings-spinner" }), " Saving\u2026"] }) : 'Update Password' }) }), pwMsg && (_jsx("div", { className: `settings-feedback settings-feedback--${pwMsg.type}`, children: pwMsg.text }))] })] }) })] }), _jsxs("div", { className: "settings-section", ref: sectionRefs.integrations, id: "integrations", children: [_jsx("p", { className: "settings-section-label", children: "Integrations" }), _jsxs("div", { className: "settings-card", children: [_jsxs("div", { className: "settings-row", children: [_jsxs("div", { children: [_jsx("p", { className: "settings-row__label", children: "MongoDB" }), _jsx("p", { className: "settings-row__sub", children: "Primary data source for compliance scanning." })] }), _jsx("div", { className: "settings-row__right", children: _jsxs("span", { className: `settings-int-badge ${profile?.MongoConnection ? 'settings-int-badge--on' : 'settings-int-badge--off'}`, children: [_jsx("span", { className: "settings-int-badge__dot" }), profile?.MongoConnection ? 'Connected' : 'Not Connected'] }) })] }), _jsxs("div", { className: "settings-row", children: [_jsxs("div", { children: [_jsx("p", { className: "settings-row__label", children: "Gmail" }), _jsx("p", { className: "settings-row__sub", children: "Email data compliance via OAuth." })] }), _jsx("div", { className: "settings-row__right", children: _jsxs("span", { className: `settings-int-badge ${profile?.GmailConnection ? 'settings-int-badge--on' : 'settings-int-badge--off'}`, children: [_jsx("span", { className: "settings-int-badge__dot" }), profile?.GmailConnection ? 'Connected' : 'Not Connected'] }) })] }), _jsxs("div", { className: "settings-row", children: [_jsxs("div", { children: [_jsx("p", { className: "settings-row__label", children: "Manage Integrations" }), _jsx("p", { className: "settings-row__sub", children: "Connect or disconnect data sources." })] }), _jsxs("button", { className: "settings-btn settings-btn--ghost settings-btn--sm", onClick: () => navigate('/dashboard/integrations'), children: ["Go to Integrations ", _jsx(ArrowRightIcon, {})] })] })] })] }), _jsxs("div", { className: "settings-section", ref: sectionRefs.preferences, id: "preferences", children: [_jsx("p", { className: "settings-section-label", children: "Preferences" }), _jsxs("div", { className: "settings-card", children: [_jsxs("div", { className: "settings-row", children: [_jsxs("div", { children: [_jsx("p", { className: "settings-row__label", children: "Dark Mode" }), _jsx("p", { className: "settings-row__sub", children: "Toggle the workspace theme." })] }), _jsx(ToggleSwitch, { id: "pref-dark", checked: darkMode, onChange: setDarkMode })] }), _jsxs("div", { className: "settings-row", children: [_jsxs("div", { children: [_jsx("p", { className: "settings-row__label", children: "AI Response Style" }), _jsx("p", { className: "settings-row__sub", children: "How the AI agent formats its answers." })] }), _jsxs("select", { className: "settings-select", value: aiStyle, onChange: e => setAiStyle(e.target.value), children: [_jsx("option", { value: "concise", children: "Concise" }), _jsx("option", { value: "detailed", children: "Detailed" })] })] }), _jsxs("div", { className: "settings-row settings-row--col", children: [_jsxs("div", { children: [_jsx("p", { className: "settings-row__label", children: "Minimum Confidence Threshold" }), _jsx("p", { className: "settings-row__sub", children: "Only surface findings above this confidence level in reports." })] }), _jsxs("div", { className: "settings-slider-wrap", children: [_jsx("input", { type: "range", className: "settings-slider", min: 0, max: 100, step: 5, value: confThreshold, onChange: e => setConfThreshold(Number(e.target.value)) }), _jsxs("span", { className: "settings-slider-val", children: [confThreshold, "%"] })] })] }), _jsx("div", { style: { padding: '0.75rem 1.25rem', borderTop: '1px solid var(--c-border, #1e3530)' }, children: _jsx("p", { style: { fontSize: '0.75rem', color: 'var(--c-text-3, #7a9e90)', margin: 0 }, children: "\u2139 Preferences are saved locally and reset on logout." }) })] })] }), _jsxs("div", { className: "settings-section", ref: sectionRefs.danger, id: "danger", children: [_jsx("p", { className: "settings-section-label", children: "Danger Zone" }), _jsxs("div", { className: "settings-card settings-card--danger", children: [_jsxs("div", { className: "settings-danger-row", children: [_jsxs("div", { children: [_jsx("p", { className: "settings-danger-row__label", children: "Reset Integrations" }), _jsx("p", { className: "settings-danger-row__sub", children: "Disconnect all integrations and clear stored credentials. This cannot be undone." })] }), _jsx("button", { className: "settings-btn settings-btn--danger", onClick: () => setDangerAction('reset'), children: "Reset Integrations" })] }), _jsxs("div", { className: "settings-danger-row", children: [_jsxs("div", { children: [_jsx("p", { className: "settings-danger-row__label", children: "Delete Account" }), _jsx("p", { className: "settings-danger-row__sub", children: "Permanently delete your account and all associated data from Prismatic." })] }), _jsx("button", { className: "settings-btn settings-btn--danger", onClick: () => setDangerAction('delete'), children: "Delete Account" })] })] })] })] }), dangerAction && (_jsx("div", { style: {
                    position: 'fixed', inset: 0, background: 'rgba(9,20,19,0.75)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
                    animation: 'settings-fade-in 0.2s ease',
                }, onClick: () => setDangerAction(null), children: _jsxs("div", { style: {
                        background: 'var(--c-surface-1, #0f1f1c)',
                        border: '1px solid rgba(239,100,100,0.25)',
                        borderRadius: 16, padding: '1.75rem',
                        width: 380, maxWidth: '90vw',
                    }, onClick: e => e.stopPropagation(), children: [_jsx("p", { style: { fontSize: '1rem', fontWeight: 700, color: 'var(--c-text-1,#f5f7f6)', margin: '0 0 0.5rem', letterSpacing: '-0.01em' }, children: dangerAction === 'reset' ? 'Reset Integrations?' : 'Delete Account?' }), _jsx("p", { style: { fontSize: '0.825rem', color: 'var(--c-text-3,#7a9e90)', margin: '0 0 1.5rem', lineHeight: 1.5 }, children: dangerAction === 'reset'
                                ? 'This will disconnect MongoDB and Gmail and remove all stored credentials. You will need to reconnect them manually.'
                                : 'This will permanently delete your account and all Prismatic data. This action cannot be reversed.' }), _jsxs("div", { style: { display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }, children: [_jsx("button", { className: "settings-btn settings-btn--ghost", onClick: () => setDangerAction(null), children: "Cancel" }), _jsx("button", { className: "settings-btn settings-btn--danger", onClick: () => setDangerAction(null), children: dangerAction === 'reset' ? 'Yes, Reset' : 'Yes, Delete' })] })] }) }))] }));
}
