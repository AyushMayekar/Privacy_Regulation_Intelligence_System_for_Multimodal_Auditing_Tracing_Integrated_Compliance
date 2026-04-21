import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiLogin, apiRegister } from '../api/authApi';
import { useTheme } from '../theme/ThemeContext';
import '../styles/theme.css';
import '../styles/auth.css';
/* ── Icons ───────────────────────────────────────── */
const SunIcon = () => (_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("circle", { cx: "12", cy: "12", r: "5" }), _jsx("line", { x1: "12", y1: "1", x2: "12", y2: "3" }), _jsx("line", { x1: "12", y1: "21", x2: "12", y2: "23" }), _jsx("line", { x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }), _jsx("line", { x1: "18.36", y1: "18.36", x2: "19.78", y2: "19.78" }), _jsx("line", { x1: "1", y1: "12", x2: "3", y2: "12" }), _jsx("line", { x1: "21", y1: "12", x2: "23", y2: "12" }), _jsx("line", { x1: "4.22", y1: "19.78", x2: "5.64", y2: "18.36" }), _jsx("line", { x1: "18.36", y1: "5.64", x2: "19.78", y2: "4.22" })] }));
const MoonIcon = () => (_jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" }) }));
const ArrowLeft = () => (_jsxs("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("line", { x1: "19", y1: "12", x2: "5", y2: "12" }), _jsx("polyline", { points: "12 19 5 12 12 5" })] }));
const GoogleIcon = () => (_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", children: [_jsx("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "#4285F4" }), _jsx("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }), _jsx("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", fill: "#FBBC05" }), _jsx("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "#EA4335" })] }));
const MailIcon = () => (_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" }), _jsx("polyline", { points: "22,6 12,13 2,6" })] }));
const LockIcon = () => (_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }), _jsx("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })] }));
const BuildingIcon = () => (_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }), _jsx("polyline", { points: "9 22 9 12 15 12 15 22" })] }));
const UserIcon = () => (_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }), _jsx("circle", { cx: "12", cy: "7", r: "4" })] }));
const EyeIcon = () => (_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }), _jsx("circle", { cx: "12", cy: "12", r: "3" })] }));
const EyeOffIcon = () => (_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" }), _jsx("line", { x1: "1", y1: "1", x2: "23", y2: "23" })] }));
const AlertCircle = () => (_jsxs("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0, marginTop: 1 }, children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }), _jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })] }));
const CheckCircle = () => (_jsxs("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0, marginTop: 1 }, children: [_jsx("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }), _jsx("polyline", { points: "22 4 12 14.01 9 11.01" })] }));
const ArrowRight = () => (_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" }), _jsx("polyline", { points: "12 5 19 12 12 19" })] }));
/* ── Field component (outside Landing to prevent focus loss on re-render) ── */
function Field({ id, label, type = 'text', name, value, placeholder, autoComplete, icon, onChange, required = true, showPwd, setShowPwd, loading, }) {
    const isPassword = name === 'password';
    return (_jsxs("div", { className: "auth-field", children: [_jsx("label", { className: "auth-label", htmlFor: id, children: label }), _jsxs("div", { className: "auth-input-wrap", children: [_jsx("span", { className: "auth-input-icon", children: icon }), _jsx("input", { id: id, name: name, type: isPassword ? (showPwd ? 'text' : 'password') : type, className: "auth-input", placeholder: placeholder, autoComplete: autoComplete, required: required, value: value, onChange: onChange, disabled: loading, style: isPassword ? { paddingRight: 44 } : undefined }), isPassword && (_jsx("button", { type: "button", className: "auth-eye", onClick: () => setShowPwd(p => !p), "aria-label": showPwd ? 'Hide password' : 'Show password', tabIndex: -1, children: showPwd ? _jsx(EyeOffIcon, {}) : _jsx(EyeIcon, {}) }))] })] }));
}
/* ── Component ───────────────────────────────────── */
export default function Landing() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [mode, setMode] = useState('login');
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [loginForm, setLoginForm] = useState({ admin_email: '', password: '' });
    const [signupForm, setSignupForm] = useState({ org_name: '', admin_name: '', admin_email: '', password: '', consent: false });
    const clearMsg = () => setMessage(null);
    const switchMode = (next) => {
        setMode(next);
        clearMsg();
        setShowPwd(false);
    };
    /* ── Login handler ── */
    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);
        clearMsg();
        try {
            const res = await apiLogin({
                admin_email: loginForm.admin_email.trim().toLowerCase(),
                password: loginForm.password,
            });
            setMessage({ type: 'success', text: res.message ?? 'Logged in! Redirecting…' });
            setTimeout(() => navigate('/dashboard'), 600);
        }
        catch (err) {
            setMessage({ type: 'error', text: err?.message ?? 'Login failed. Check credentials.' });
        }
        finally {
            setLoading(false);
        }
    }
    /* ── Register handler ── */
    async function handleRegister(e) {
        e.preventDefault();
        if (!signupForm.consent) {
            setMessage({ type: 'error', text: 'Please accept the Terms and Privacy Policy to continue.' });
            return;
        }
        setLoading(true);
        clearMsg();
        try {
            const res = await apiRegister({
                org_name: signupForm.org_name.trim(),
                admin_name: signupForm.admin_name.trim(),
                admin_email: signupForm.admin_email.trim().toLowerCase(),
                password: signupForm.password,
                consent: signupForm.consent,
            });
            setMessage({ type: 'success', text: (res.message ?? 'Account created!') + ' Please sign in.' });
            setTimeout(() => {
                setLoginForm({ admin_email: signupForm.admin_email.trim().toLowerCase(), password: '' });
                switchMode('login');
            }, 1200);
        }
        catch (err) {
            setMessage({ type: 'error', text: err?.message ?? 'Registration failed. Please try again.' });
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "auth-root", children: [_jsxs("div", { className: "auth-panel", children: [_jsxs("div", { className: "auth-panel__shapes", "aria-hidden": "true", children: [_jsx("div", { className: "auth-shape auth-shape-1" }), _jsx("div", { className: "auth-shape auth-shape-2" }), _jsx("div", { className: "auth-shape auth-shape-3" }), _jsx("div", { className: "auth-shape auth-shape-4" }), _jsx("div", { className: "auth-shape auth-shape-5" }), _jsx("div", { className: "auth-shape auth-shape-6" }), _jsx("div", { className: "auth-shape auth-shape-7" })] }), _jsxs(Link, { to: "/", className: "auth-panel__logo", children: [_jsx("img", { src: "https://res.cloudinary.com/dpuqctqfl/image/upload/v1776519708/Prismatic_Logo_qzrypl.png", alt: "Prismatic" }), _jsx("span", { className: "auth-panel__logo-name", children: "Prismatic" })] }), _jsxs("div", { className: "auth-panel__body", children: [_jsxs("div", { className: "auth-panel__tag", children: [_jsx("span", { className: "auth-panel__tag-dot" }), "AI-Powered Compliance"] }), _jsxs("h2", { className: "auth-panel__headline", children: ["See Every Risk.", _jsx("br", {}), _jsx("span", { children: "Prove Every" }), _jsx("br", {}), "Decision."] }), _jsx("p", { className: "auth-panel__sub", children: "Prismatic automatically scans, audits, and traces privacy regulations across your entire data ecosystem \u2014 powered by autonomous AI agents." }), _jsxs("div", { className: "auth-panel__stats", children: [_jsxs("div", { children: [_jsx("div", { className: "auth-panel__stat-num", children: "2.4M+" }), _jsx("div", { className: "auth-panel__stat-label", children: "Records Scanned" })] }), _jsx("div", { className: "auth-panel__stat-divider" }), _jsxs("div", { children: [_jsx("div", { className: "auth-panel__stat-num", children: "94.2%" }), _jsx("div", { className: "auth-panel__stat-label", children: "Avg Compliance" })] }), _jsx("div", { className: "auth-panel__stat-divider" }), _jsxs("div", { children: [_jsx("div", { className: "auth-panel__stat-num", children: "12+" }), _jsx("div", { className: "auth-panel__stat-label", children: "Regs Covered" })] })] })] }), _jsxs("div", { className: "auth-panel__footer", children: ["\u00A9 ", new Date().getFullYear(), " Prismatic. All rights reserved."] })] }), _jsxs("div", { className: "auth-form-side", children: [_jsxs(Link, { to: "/", className: "auth-back", children: [_jsx(ArrowLeft, {}), "Back to home"] }), _jsx("button", { id: "auth-theme-toggle", className: "auth-theme-btn", onClick: toggleTheme, "aria-label": "Toggle theme", children: theme === 'dark' ? _jsx(SunIcon, {}) : _jsx(MoonIcon, {}) }), _jsxs("div", { className: "auth-card", children: [_jsxs("div", { className: "auth-tabs", role: "tablist", children: [_jsx("button", { id: "tab-login", role: "tab", "aria-selected": mode === 'login', className: `auth-tab${mode === 'login' ? ' active' : ''}`, onClick: () => switchMode('login'), children: "Sign In" }), _jsx("button", { id: "tab-signup", role: "tab", "aria-selected": mode === 'signup', className: `auth-tab${mode === 'signup' ? ' active' : ''}`, onClick: () => switchMode('signup'), children: "Sign Up" })] }), _jsx("h1", { className: "auth-card__title", children: mode === 'login' ? 'Welcome back' : 'Create your account' }), _jsx("p", { className: "auth-card__sub", children: mode === 'login'
                                    ? 'Sign in to your Prismatic workspace.'
                                    : 'Start your compliance intelligence journey.' }), message && (_jsxs("div", { className: `auth-msg auth-msg--${message.type}`, role: "alert", children: [message.type === 'error' ? _jsx(AlertCircle, {}) : _jsx(CheckCircle, {}), message.text] })), mode === 'login' && (_jsxs("form", { onSubmit: handleLogin, noValidate: true, autoComplete: "on", className: "auth-fields-enter", children: [_jsx(Field, { id: "login-email", label: "Admin Email", type: "email", name: "admin_email", value: loginForm.admin_email, placeholder: "admin@yourorg.com", autoComplete: "email", icon: _jsx(MailIcon, {}), onChange: e => { setLoginForm(p => ({ ...p, admin_email: e.target.value })); clearMsg(); }, showPwd: showPwd, setShowPwd: setShowPwd, loading: loading }), _jsx(Field, { id: "login-password", label: "Password", name: "password", value: loginForm.password, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", autoComplete: "current-password", icon: _jsx(LockIcon, {}), onChange: e => { setLoginForm(p => ({ ...p, password: e.target.value })); clearMsg(); }, showPwd: showPwd, setShowPwd: setShowPwd, loading: loading }), _jsx("button", { id: "auth-submit", type: "submit", className: "auth-submit", disabled: loading, children: loading
                                            ? _jsxs(_Fragment, { children: [_jsx("span", { className: "auth-spinner" }), "Signing in\u2026"] })
                                            : _jsxs(_Fragment, { children: ["Sign In ", _jsx(ArrowRight, {})] }) }), _jsx("div", { className: "auth-divider", children: "or" }), _jsxs("button", { type: "button", className: "auth-google", disabled: true, title: "Google login coming soon", style: { opacity: 0.45, cursor: 'not-allowed' }, children: [_jsx(GoogleIcon, {}), "Continue with Google", _jsx("span", { style: { fontSize: '0.7rem', color: 'var(--c-text-3)', marginLeft: 4 }, children: "(coming soon)" })] }), _jsxs("p", { className: "auth-switch", children: ["Don't have an account?", ' ', _jsx("button", { type: "button", onClick: () => switchMode('signup'), children: "Sign up free" })] })] })), mode === 'signup' && (_jsxs("form", { onSubmit: handleRegister, noValidate: true, autoComplete: "on", className: "auth-fields-enter", children: [_jsxs("div", { className: "auth-field__row", children: [_jsx(Field, { id: "signup-org", label: "Organization Name", name: "org_name", value: signupForm.org_name, placeholder: "Acme Corp", autoComplete: "organization", icon: _jsx(BuildingIcon, {}), onChange: e => { setSignupForm(p => ({ ...p, org_name: e.target.value })); clearMsg(); }, showPwd: showPwd, setShowPwd: setShowPwd, loading: loading }), _jsx(Field, { id: "signup-name", label: "Admin Name", name: "admin_name", value: signupForm.admin_name, placeholder: "Jane Smith", autoComplete: "name", icon: _jsx(UserIcon, {}), onChange: e => { setSignupForm(p => ({ ...p, admin_name: e.target.value })); clearMsg(); }, showPwd: showPwd, setShowPwd: setShowPwd, loading: loading })] }), _jsx(Field, { id: "signup-email", label: "Admin Email", type: "email", name: "admin_email", value: signupForm.admin_email, placeholder: "admin@yourorg.com", autoComplete: "email", icon: _jsx(MailIcon, {}), onChange: e => { setSignupForm(p => ({ ...p, admin_email: e.target.value })); clearMsg(); }, showPwd: showPwd, setShowPwd: setShowPwd, loading: loading }), _jsx(Field, { id: "signup-password", label: "Password", name: "password", value: signupForm.password, placeholder: "Min. 8 characters", autoComplete: "new-password", icon: _jsx(LockIcon, {}), onChange: e => { setSignupForm(p => ({ ...p, password: e.target.value })); clearMsg(); }, showPwd: showPwd, setShowPwd: setShowPwd, loading: loading }), _jsxs("label", { className: "auth-check", children: [_jsx("input", { type: "checkbox", name: "consent", id: "consent", checked: signupForm.consent, onChange: e => { setSignupForm(p => ({ ...p, consent: e.target.checked })); clearMsg(); }, disabled: loading }), _jsxs("span", { className: "auth-check__label", children: ["I agree to the", ' ', _jsx("a", { href: "#", onClick: e => e.preventDefault(), children: "Terms of Service" }), ' ', "and", ' ', _jsx("a", { href: "#", onClick: e => e.preventDefault(), children: "Privacy Policy" })] })] }), _jsx("button", { id: "auth-submit-signup", type: "submit", className: "auth-submit", disabled: loading, children: loading
                                            ? _jsxs(_Fragment, { children: [_jsx("span", { className: "auth-spinner" }), "Creating account\u2026"] })
                                            : _jsxs(_Fragment, { children: ["Create Account ", _jsx(ArrowRight, {})] }) }), _jsxs("p", { className: "auth-switch", children: ["Already have an account?", ' ', _jsx("button", { type: "button", onClick: () => switchMode('login'), children: "Sign in" })] })] }))] }, mode)] })] }));
}
