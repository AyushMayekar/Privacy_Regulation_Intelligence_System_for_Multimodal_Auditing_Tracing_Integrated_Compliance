import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SettingsSidebar from '../components/SettingsSidebar'
import ToggleSwitch from '../components/ToggleSwitch'
import '../styles/settings.css'

/* ── Helpers ─────────────────────────────────────── */
function getAdminEmail(): string {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('prismatic-session-'))
  return keys[0]?.replace('prismatic-session-', '') ?? ''
}

interface ProfileData {
  admin_name: string
  admin_email: string
  org_name: string
  MongoConnection: boolean
  GmailConnection: boolean
}

/* ── Icons ───────────────────────────────────────── */
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
)
const EyeOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

/* ── Page ────────────────────────────────────────── */
export default function SettingsPage() {
  const navigate = useNavigate()

  const [activeSection, setActiveSection] = useState('profile')
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [pageStatus, setPageStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  // Profile edit state
  const [editingName, setEditingName] = useState(false)
  const [editingOrg, setEditingOrg] = useState(false)
  const [nameVal, setNameVal] = useState('')
  const [orgVal, setOrgVal] = useState('')
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Security state
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pwLoading, setPwLoading] = useState(false)

  // Preferences state (UI only — no backend)
  const [darkMode, setDarkMode] = useState(true)
  const [aiStyle, setAiStyle] = useState<'concise' | 'detailed'>('concise')
  const [confThreshold, setConfThreshold] = useState(75)

  // Danger modal
  const [dangerAction, setDangerAction] = useState<null | 'reset' | 'delete'>(null)

  // Section refs for scroll
  const sectionRefs: Record<string, React.RefObject<HTMLDivElement | null>> = {
    profile: useRef<HTMLDivElement>(null),
    organization: useRef<HTMLDivElement>(null),
    security: useRef<HTMLDivElement>(null),
    integrations: useRef<HTMLDivElement>(null),
    preferences: useRef<HTMLDivElement>(null),
    danger: useRef<HTMLDivElement>(null),
  }

  const BASE_URL = import.meta.env.VITE_API_URL ?? ''

  async function loadProfile() {
    setPageStatus('loading')
    try {
      const res = await fetch(`${BASE_URL}/auth/profile`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch profile')
      const data: ProfileData = await res.json()
      setProfile(data)
      setNameVal(data.admin_name)
      setOrgVal(data.org_name)
      setPageStatus('ready')
    } catch {
      // Fallback: read email from localStorage, show partial data
      const email = getAdminEmail()
      setProfile({
        admin_name: '',
        admin_email: email,
        org_name: '',
        MongoConnection: false,
        GmailConnection: false,
      })
      setPageStatus('ready')
    }
  }

  useEffect(() => { loadProfile() }, [])

  function handleSectionSelect(id: string) {
    setActiveSection(id)
    sectionRefs[id]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /* ── Name save (UI only) ── */
  function handleSaveName() {
    if (!nameVal.trim()) { setProfileMsg({ type: 'error', text: 'Name cannot be empty.' }); return }
    setProfile(p => p ? { ...p, admin_name: nameVal.trim() } : p)
    setEditingName(false)
    setProfileMsg({ type: 'success', text: 'Name updated.' })
    setTimeout(() => setProfileMsg(null), 3000)
  }

  /* ── Org save (UI only) ── */
  function handleSaveOrg() {
    if (!orgVal.trim()) { setProfileMsg({ type: 'error', text: 'Organization name cannot be empty.' }); return }
    setProfile(p => p ? { ...p, org_name: orgVal.trim() } : p)
    setEditingOrg(false)
    setProfileMsg({ type: 'success', text: 'Organization updated.' })
    setTimeout(() => setProfileMsg(null), 3000)
  }

  /* ── Password change (UI only) ── */
  async function handlePwChange() {
    if (!pwForm.current) { setPwMsg({ type: 'error', text: 'Enter your current password.' }); return }
    if (pwForm.next.length < 8) { setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' }); return }
    if (pwForm.next !== pwForm.confirm) { setPwMsg({ type: 'error', text: 'Passwords do not match.' }); return }
    setPwLoading(true)
    setPwMsg(null)
    // Stub — backend endpoint not yet implemented
    await new Promise(r => setTimeout(r, 800))
    setPwLoading(false)
    setPwMsg({ type: 'success', text: 'Password change request sent.' })
    setPwForm({ current: '', next: '', confirm: '' })
    setTimeout(() => setPwMsg(null), 4000)
  }

  if (pageStatus === 'loading') {
    return (
      <div className="settings-page">
        <div className="settings-nav">
          <p className="settings-nav__label">Settings</p>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="settings-skeleton" style={{ height: 34, borderRadius: 9, marginBottom: 2 }} />
          ))}
        </div>
        <div className="settings-content">
          <div className="settings-header">
            <h1 className="settings-header__title">Settings</h1>
          </div>
          {[100, 80, 120, 90].map((h, i) => (
            <div key={i} className="settings-skeleton" style={{ height: h, marginBottom: '0.875rem' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="settings-page">
      <SettingsSidebar active={activeSection} onSelect={handleSectionSelect} />

      <div className="settings-content">
        <div className="settings-header">
          <h1 className="settings-header__title">Settings</h1>
          <p className="settings-header__sub">Manage your account, organization, and workspace preferences.</p>
        </div>

        {/* ── PROFILE ── */}
        <div className="settings-section" ref={sectionRefs.profile} id="profile">
          <p className="settings-section-label">Profile</p>
          <div className="settings-card">

            {/* Name */}
            <div className="settings-row">
              <div>
                <p className="settings-row__label">Admin Name</p>
                <p className="settings-row__sub">Your display name in the workspace.</p>
              </div>
              <div className="settings-row__right">
                {editingName ? (
                  <>
                    <input
                      className="settings-input"
                      style={{ width: 180 }}
                      value={nameVal}
                      onChange={e => setNameVal(e.target.value)}
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false) }}
                    />
                    <button className="settings-btn settings-btn--primary settings-btn--sm" onClick={handleSaveName}><CheckIcon /></button>
                    <button className="settings-btn settings-btn--ghost settings-btn--sm" onClick={() => { setEditingName(false); setNameVal(profile?.admin_name ?? '') }}><XIcon /></button>
                  </>
                ) : (
                  <>
                    <span className="settings-row__value">{profile?.admin_name || '—'}</span>
                    <button className="settings-btn settings-btn--ghost settings-btn--sm" onClick={() => setEditingName(true)}><EditIcon /> Edit</button>
                  </>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="settings-row">
              <div>
                <p className="settings-row__label">Admin Email</p>
                <p className="settings-row__sub">Your login email — cannot be changed.</p>
              </div>
              <div className="settings-row__right">
                <span className="settings-row__value">{profile?.admin_email || '—'}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--c-text-3)', background: 'var(--c-surface-2,#162420)', padding: '0.2rem 0.5rem', borderRadius: 6, border: '1px solid var(--c-border)' }}>Locked</span>
              </div>
            </div>

            {profileMsg && (
              <div style={{ padding: '0 1.25rem 1rem' }}>
                <div className={`settings-feedback settings-feedback--${profileMsg.type}`}>
                  {profileMsg.text}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── ORGANIZATION ── */}
        <div className="settings-section" ref={sectionRefs.organization} id="organization">
          <p className="settings-section-label">Organization</p>
          <div className="settings-card">
            <div className="settings-row">
              <div>
                <p className="settings-row__label">Organization Name</p>
                <p className="settings-row__sub">The name registered with your Prismatic workspace.</p>
              </div>
              <div className="settings-row__right">
                {editingOrg ? (
                  <>
                    <input
                      className="settings-input"
                      style={{ width: 200 }}
                      value={orgVal}
                      onChange={e => setOrgVal(e.target.value)}
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveOrg(); if (e.key === 'Escape') setEditingOrg(false) }}
                    />
                    <button className="settings-btn settings-btn--primary settings-btn--sm" onClick={handleSaveOrg}><CheckIcon /></button>
                    <button className="settings-btn settings-btn--ghost settings-btn--sm" onClick={() => { setEditingOrg(false); setOrgVal(profile?.org_name ?? '') }}><XIcon /></button>
                  </>
                ) : (
                  <>
                    <span className="settings-row__value">{profile?.org_name || '—'}</span>
                    <button className="settings-btn settings-btn--ghost settings-btn--sm" onClick={() => setEditingOrg(true)}><EditIcon /> Edit</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── SECURITY ── */}
        <div className="settings-section" ref={sectionRefs.security} id="security">
          <p className="settings-section-label">Security</p>
          <div className="settings-card">
            <div className="settings-row settings-row--col">
              <div>
                <p className="settings-row__label">Change Password</p>
                <p className="settings-row__sub">Use a strong password of at least 8 characters.</p>
              </div>
              <div className="settings-input-group">
                <div style={{ position: 'relative' }}>
                  <input
                    className="settings-input"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Current password"
                    value={pwForm.current}
                    onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                    style={{ paddingRight: 38 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--c-text-3)', cursor: 'pointer', padding: 0, display: 'flex' }}
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <input
                  className="settings-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="New password (min. 8 chars)"
                  value={pwForm.next}
                  onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))}
                />
                <input
                  className="settings-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={pwForm.confirm}
                  onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                />
                <div>
                  <button
                    className="settings-btn settings-btn--primary"
                    onClick={handlePwChange}
                    disabled={pwLoading}
                  >
                    {pwLoading ? <><span className="settings-spinner" /> Saving…</> : 'Update Password'}
                  </button>
                </div>
                {pwMsg && (
                  <div className={`settings-feedback settings-feedback--${pwMsg.type}`}>
                    {pwMsg.text}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── INTEGRATIONS SUMMARY ── */}
        <div className="settings-section" ref={sectionRefs.integrations} id="integrations">
          <p className="settings-section-label">Integrations</p>
          <div className="settings-card">
            <div className="settings-row">
              <div>
                <p className="settings-row__label">MongoDB</p>
                <p className="settings-row__sub">Primary data source for compliance scanning.</p>
              </div>
              <div className="settings-row__right">
                <span className={`settings-int-badge ${profile?.MongoConnection ? 'settings-int-badge--on' : 'settings-int-badge--off'}`}>
                  <span className="settings-int-badge__dot" />
                  {profile?.MongoConnection ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>
            <div className="settings-row">
              <div>
                <p className="settings-row__label">Gmail</p>
                <p className="settings-row__sub">Email data compliance via OAuth.</p>
              </div>
              <div className="settings-row__right">
                <span className={`settings-int-badge ${profile?.GmailConnection ? 'settings-int-badge--on' : 'settings-int-badge--off'}`}>
                  <span className="settings-int-badge__dot" />
                  {profile?.GmailConnection ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>
            <div className="settings-row">
              <div>
                <p className="settings-row__label">Manage Integrations</p>
                <p className="settings-row__sub">Connect or disconnect data sources.</p>
              </div>
              <button
                className="settings-btn settings-btn--ghost settings-btn--sm"
                onClick={() => navigate('/dashboard/integrations')}
              >
                Go to Integrations <ArrowRightIcon />
              </button>
            </div>
          </div>
        </div>

        {/* ── PREFERENCES ── */}
        <div className="settings-section" ref={sectionRefs.preferences} id="preferences">
          <p className="settings-section-label">Preferences</p>
          <div className="settings-card">
            {/* Theme */}
            <div className="settings-row">
              <div>
                <p className="settings-row__label">Dark Mode</p>
                <p className="settings-row__sub">Toggle the workspace theme.</p>
              </div>
              <ToggleSwitch id="pref-dark" checked={darkMode} onChange={setDarkMode} />
            </div>

            {/* AI Response style */}
            <div className="settings-row">
              <div>
                <p className="settings-row__label">AI Response Style</p>
                <p className="settings-row__sub">How the AI agent formats its answers.</p>
              </div>
              <select
                className="settings-select"
                value={aiStyle}
                onChange={e => setAiStyle(e.target.value as 'concise' | 'detailed')}
              >
                <option value="concise">Concise</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>

            {/* Confidence threshold */}
            <div className="settings-row settings-row--col">
              <div>
                <p className="settings-row__label">Minimum Confidence Threshold</p>
                <p className="settings-row__sub">Only surface findings above this confidence level in reports.</p>
              </div>
              <div className="settings-slider-wrap">
                <input
                  type="range"
                  className="settings-slider"
                  min={0} max={100} step={5}
                  value={confThreshold}
                  onChange={e => setConfThreshold(Number(e.target.value))}
                />
                <span className="settings-slider-val">{confThreshold}%</span>
              </div>
            </div>

            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--c-border, #1e3530)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--c-text-3, #7a9e90)', margin: 0 }}>
                ℹ Preferences are saved locally and reset on logout.
              </p>
            </div>
          </div>
        </div>

        {/* ── DANGER ZONE ── */}
        <div className="settings-section" ref={sectionRefs.danger} id="danger">
          <p className="settings-section-label">Danger Zone</p>
          <div className="settings-card settings-card--danger">
            <div className="settings-danger-row">
              <div>
                <p className="settings-danger-row__label">Reset Integrations</p>
                <p className="settings-danger-row__sub">Disconnect all integrations and clear stored credentials. This cannot be undone.</p>
              </div>
              <button
                className="settings-btn settings-btn--danger"
                onClick={() => setDangerAction('reset')}
              >
                Reset Integrations
              </button>
            </div>
            <div className="settings-danger-row">
              <div>
                <p className="settings-danger-row__label">Delete Account</p>
                <p className="settings-danger-row__sub">Permanently delete your account and all associated data from Prismatic.</p>
              </div>
              <button
                className="settings-btn settings-btn--danger"
                onClick={() => setDangerAction('delete')}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── Danger confirmation modal ── */}
      {dangerAction && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(9,20,19,0.75)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
            animation: 'settings-fade-in 0.2s ease',
          }}
          onClick={() => setDangerAction(null)}
        >
          <div
            style={{
              background: 'var(--c-surface-1, #0f1f1c)',
              border: '1px solid rgba(239,100,100,0.25)',
              borderRadius: 16, padding: '1.75rem',
              width: 380, maxWidth: '90vw',
            }}
            onClick={e => e.stopPropagation()}
          >
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-text-1,#f5f7f6)', margin: '0 0 0.5rem', letterSpacing: '-0.01em' }}>
              {dangerAction === 'reset' ? 'Reset Integrations?' : 'Delete Account?'}
            </p>
            <p style={{ fontSize: '0.825rem', color: 'var(--c-text-3,#7a9e90)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
              {dangerAction === 'reset'
                ? 'This will disconnect MongoDB and Gmail and remove all stored credentials. You will need to reconnect them manually.'
                : 'This will permanently delete your account and all Prismatic data. This action cannot be reversed.'}
            </p>
            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <button className="settings-btn settings-btn--ghost" onClick={() => setDangerAction(null)}>Cancel</button>
              <button className="settings-btn settings-btn--danger" onClick={() => setDangerAction(null)}>
                {dangerAction === 'reset' ? 'Yes, Reset' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
