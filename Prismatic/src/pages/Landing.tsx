import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiLogin, apiRegister } from '../api/authApi'
import { useTheme } from '../theme/ThemeContext'
import '../styles/theme.css'
import '../styles/auth.css'

/* ── Icons ───────────────────────────────────────── */
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)
const ArrowLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
)
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)
const AlertCircle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)
const CheckCircle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

/* ─── Field types ────────────────────────────────── */
interface LoginForm { admin_email: string; password: string }
interface SignupForm { org_name: string; admin_name: string; admin_email: string; password: string; consent: boolean }

/* ── Field component (outside Landing to prevent focus loss on re-render) ── */
function Field({
  id, label, type = 'text', name, value, placeholder, autoComplete, icon,
  onChange, required = true, showPwd, setShowPwd, loading,
}: {
  id: string
  label: string
  type?: string
  name: string
  value: string
  placeholder: string
  autoComplete?: string
  icon: React.ReactNode
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  showPwd: boolean
  setShowPwd: (fn: (p: boolean) => boolean) => void
  loading: boolean
}) {
  const isPassword = name === 'password'
  return (
    <div className="auth-field">
      <label className="auth-label" htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        <span className="auth-input-icon">{icon}</span>
        <input
          id={id}
          name={name}
          type={isPassword ? (showPwd ? 'text' : 'password') : type}
          className="auth-input"
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          disabled={loading}
          style={isPassword ? { paddingRight: 44 } : undefined}
        />
        {isPassword && (
          <button
            type="button"
            className="auth-eye"
            onClick={() => setShowPwd(p => !p)}
            aria-label={showPwd ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPwd ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Component ───────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const [loginForm, setLoginForm] = useState<LoginForm>({ admin_email: '', password: '' })
  const [signupForm, setSignupForm] = useState<SignupForm>({ org_name: '', admin_name: '', admin_email: '', password: '', consent: false })

  const clearMsg = () => setMessage(null)

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next)
    clearMsg()
    setShowPwd(false)
  }

  /* ── Login handler ── */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    clearMsg()
    try {
      const res = await apiLogin({
        admin_email: loginForm.admin_email.trim().toLowerCase(),
        password: loginForm.password,
      })
      setMessage({ type: 'success', text: res.message ?? 'Logged in! Redirecting…' })
      setTimeout(() => navigate('/dashboard'), 600)
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message ?? 'Login failed. Check credentials.' })
    } finally {
      setLoading(false)
    }
  }

  /* ── Register handler ── */
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!signupForm.consent) {
      setMessage({ type: 'error', text: 'Please accept the Terms and Privacy Policy to continue.' })
      return
    }
    setLoading(true)
    clearMsg()
    try {
      const res = await apiRegister({
        org_name: signupForm.org_name.trim(),
        admin_name: signupForm.admin_name.trim(),
        admin_email: signupForm.admin_email.trim().toLowerCase(),
        password: signupForm.password,
        consent: signupForm.consent,
      })
      setMessage({ type: 'success', text: (res.message ?? 'Account created!') + ' Please sign in.' })
      setTimeout(() => {
        setLoginForm({ admin_email: signupForm.admin_email.trim().toLowerCase(), password: '' })
        switchMode('login')
      }, 1200)
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message ?? 'Registration failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-root">
      {/* ── Left: brand panel ── */}
      <div className="auth-panel">
        <div className="auth-panel__shapes" aria-hidden="true">
          <div className="auth-shape auth-shape-1" />
          <div className="auth-shape auth-shape-2" />
          <div className="auth-shape auth-shape-3" />
          <div className="auth-shape auth-shape-4" />
          <div className="auth-shape auth-shape-5" />
          <div className="auth-shape auth-shape-6" />
          <div className="auth-shape auth-shape-7" />
        </div>

        <Link to="/" className="auth-panel__logo">
          <img src="https://res.cloudinary.com/dpuqctqfl/image/upload/v1776519708/Prismatic_Logo_qzrypl.png" alt="Prismatic" />
          <span className="auth-panel__logo-name">Prismatic</span>
        </Link>

        <div className="auth-panel__body">
          <div className="auth-panel__tag">
            <span className="auth-panel__tag-dot" />
            AI-Powered Compliance
          </div>
          <h2 className="auth-panel__headline">
            See Every Risk.<br />
            <span>Prove Every</span><br />
            Decision.
          </h2>
          <p className="auth-panel__sub">
            Prismatic automatically scans, audits, and traces privacy regulations
            across your entire data ecosystem — powered by autonomous AI agents.
          </p>
          <div className="auth-panel__stats">
            <div>
              <div className="auth-panel__stat-num">2.4M+</div>
              <div className="auth-panel__stat-label">Records Scanned</div>
            </div>
            <div className="auth-panel__stat-divider" />
            <div>
              <div className="auth-panel__stat-num">94.2%</div>
              <div className="auth-panel__stat-label">Avg Compliance</div>
            </div>
            <div className="auth-panel__stat-divider" />
            <div>
              <div className="auth-panel__stat-num">12+</div>
              <div className="auth-panel__stat-label">Regs Covered</div>
            </div>
          </div>
        </div>

        <div className="auth-panel__footer">
          © {new Date().getFullYear()} Prismatic. All rights reserved.
        </div>
      </div>

      {/* ── Right: form side ── */}
      <div className="auth-form-side">
        <Link to="/" className="auth-back"><ArrowLeft />Back to home</Link>

        <button id="auth-theme-toggle" className="auth-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        <div className="auth-card" key={mode}>
          <div className="auth-tabs" role="tablist">
            <button id="tab-login" role="tab" aria-selected={mode === 'login'}
              className={`auth-tab${mode === 'login' ? ' active' : ''}`} onClick={() => switchMode('login')}>
              Sign In
            </button>
            <button id="tab-signup" role="tab" aria-selected={mode === 'signup'}
              className={`auth-tab${mode === 'signup' ? ' active' : ''}`} onClick={() => switchMode('signup')}>
              Sign Up
            </button>
          </div>

          <h1 className="auth-card__title">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="auth-card__sub">
            {mode === 'login'
              ? 'Sign in to your Prismatic workspace.'
              : 'Start your compliance intelligence journey.'}
          </p>

          {/* Alert */}
          {message && (
            <div className={`auth-msg auth-msg--${message.type}`} role="alert">
              {message.type === 'error' ? <AlertCircle /> : <CheckCircle />}
              {message.text}
            </div>
          )}

          {/* ════════ LOGIN FORM ════════ */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} noValidate autoComplete="on" className="auth-fields-enter">
              <Field
                id="login-email" label="Admin Email" type="email" name="admin_email"
                value={loginForm.admin_email} placeholder="admin@yourorg.com"
                autoComplete="email" icon={<MailIcon />}
                onChange={e => { setLoginForm(p => ({ ...p, admin_email: e.target.value })); clearMsg() }}
                showPwd={showPwd} setShowPwd={setShowPwd} loading={loading}
              />
              <Field
                id="login-password" label="Password" name="password"
                value={loginForm.password} placeholder="••••••••"
                autoComplete="current-password" icon={<LockIcon />}
                onChange={e => { setLoginForm(p => ({ ...p, password: e.target.value })); clearMsg() }}
                showPwd={showPwd} setShowPwd={setShowPwd} loading={loading}
              />

              <button id="auth-submit" type="submit" className="auth-submit" disabled={loading}>
                {loading
                  ? <><span className="auth-spinner" />Signing in…</>
                  : <>Sign In <ArrowRight /></>}
              </button>

              <div className="auth-divider">or</div>

              <button
                type="button"
                className="auth-google"
                disabled
                title="Google login coming soon"
                style={{ opacity: 0.45, cursor: 'not-allowed' }}
              >
                <GoogleIcon />
                Continue with Google
                <span style={{ fontSize: '0.7rem', color: 'var(--c-text-3)', marginLeft: 4 }}>(coming soon)</span>
              </button>

              <p className="auth-switch">
                Don't have an account?{' '}
                <button type="button" onClick={() => switchMode('signup')}>Sign up free</button>
              </p>
            </form>
          )}

          {/* ════════ SIGNUP FORM ════════ */}
          {mode === 'signup' && (
            <form onSubmit={handleRegister} noValidate autoComplete="on" className="auth-fields-enter">
              <div className="auth-field__row">
                <Field
                  id="signup-org" label="Organization Name" name="org_name"
                  value={signupForm.org_name} placeholder="Acme Corp"
                  autoComplete="organization" icon={<BuildingIcon />}
                  onChange={e => { setSignupForm(p => ({ ...p, org_name: e.target.value })); clearMsg() }}
                  showPwd={showPwd} setShowPwd={setShowPwd} loading={loading}
                />
                <Field
                  id="signup-name" label="Admin Name" name="admin_name"
                  value={signupForm.admin_name} placeholder="Jane Smith"
                  autoComplete="name" icon={<UserIcon />}
                  onChange={e => { setSignupForm(p => ({ ...p, admin_name: e.target.value })); clearMsg() }}
                  showPwd={showPwd} setShowPwd={setShowPwd} loading={loading}
                />
              </div>

              <Field
                id="signup-email" label="Admin Email" type="email" name="admin_email"
                value={signupForm.admin_email} placeholder="admin@yourorg.com"
                autoComplete="email" icon={<MailIcon />}
                onChange={e => { setSignupForm(p => ({ ...p, admin_email: e.target.value })); clearMsg() }}
                showPwd={showPwd} setShowPwd={setShowPwd} loading={loading}
              />
              <Field
                id="signup-password" label="Password" name="password"
                value={signupForm.password} placeholder="Min. 8 characters"
                autoComplete="new-password" icon={<LockIcon />}
                onChange={e => { setSignupForm(p => ({ ...p, password: e.target.value })); clearMsg() }}
                showPwd={showPwd} setShowPwd={setShowPwd} loading={loading}
              />

              <label className="auth-check">
                <input
                  type="checkbox"
                  name="consent"
                  id="consent"
                  checked={signupForm.consent}
                  onChange={e => { setSignupForm(p => ({ ...p, consent: e.target.checked })); clearMsg() }}
                  disabled={loading}
                />
                <span className="auth-check__label">
                  I agree to the{' '}
                  <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>
                </span>
              </label>

              <button id="auth-submit-signup" type="submit" className="auth-submit" disabled={loading}>
                {loading
                  ? <><span className="auth-spinner" />Creating account…</>
                  : <>Create Account <ArrowRight /></>}
              </button>

              <p className="auth-switch">
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')}>Sign in</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}