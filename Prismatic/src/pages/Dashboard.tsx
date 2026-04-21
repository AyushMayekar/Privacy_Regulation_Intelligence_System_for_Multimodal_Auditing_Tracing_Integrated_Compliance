/**
 * Dashboard.tsx — Prismatic Core Workspace
 *
 * Post-login compliance command center.
 * Mobile: bottom tab bar
 * Tablet (768-1024px): auto-collapsed icon sidebar
 * Desktop (>1024px): full collapsible sidebar
 */

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'
import { useChat } from '../workspace/hooks/useChat'
import WorkspaceSidebar, { NAV_ITEMS } from '../workspace/components/WorkspaceSidebar'
import ChatArea from '../workspace/components/ChatArea'
import InputBar from '../workspace/components/InputBar'
import type { ScanData, AuditData } from '../workspace/types/chat'
import '../styles/theme.css'
import '../styles/workspace.css'
import IntegrationsPage from './IntegrationsPage'
import FindingsPage from './FindingsPage'
import AuditLogsPage from './AuditLogsPage'
import SettingsPage from './SettingsPage'

/* ─── Placeholder for non-chat sections ──────────── */
function PlaceholderPage({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16, color: 'var(--c-text-3)', padding: 40,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'var(--c-accent-dim)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: 'var(--c-accent)',
      }}>
        {icon}
      </div>
      <h2 style={{ fontWeight: 700, fontSize: '1.3rem', color: 'var(--c-text)', margin: 0 }}>{title}</h2>
      <p style={{ margin: 0, fontSize: '0.9rem', textAlign: 'center' }}>
        This section will be available in the next release.
      </p>
    </div>
  )
}

/* ─── Admin email from localStorage ──────────────── */
function getAdminEmail(): string {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('prismatic-session-'))
  if (keys.length) return keys[0].replace('prismatic-session-', '')
  return 'admin'
}

/* ─── Topbar ─────────────────────────────────────── */
function TopBar({ adminEmail, onClear }: { adminEmail: string; onClear: () => void }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <header className="ws-topbar">
      <div className="ws-topbar__left">
        <Link to="/" className="ws-topbar__logo">
          <img
            src="https://res.cloudinary.com/dpuqctqfl/image/upload/v1776519708/Prismatic_Logo_qzrypl.png"
            alt="Prismatic"
          />
          <span className="ws-topbar__logo-name">Prismatic</span>
        </Link>
        <div style={{ padding: '0 16px', fontSize: '0.82rem', color: 'var(--c-text-3)' }}>
          Compliance Workspace
        </div>
      </div>

      <div className="ws-topbar__right">
        {/* Theme toggle — visible on desktop topbar */}
        <button
          className="ws-icon-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          id="ws-theme-topbar-btn"
        >
          {theme === 'dark' ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Clear session */}
        <button
          className="ws-icon-btn"
          onClick={onClear}
          title="Clear chat session"
          id="ws-clear-btn"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>

        {/* User avatar */}
        <div className="ws-avatar" title={adminEmail}>
          {adminEmail.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  )
}

/* ─── Mobile Bottom Nav ──────────────────────────── */
function BottomNav({ active, setActive }: { active: string; setActive: (k: string) => void }) {
  // Show only the first 4 nav items on mobile to avoid crowding
  const mobileItems = NAV_ITEMS.slice(0, 4)
  return (
    <nav className="ws-bottom-nav">
      {mobileItems.map(item => (
        <button
          key={item.key}
          className={`ws-bottom-nav-item${active === item.key ? ' active' : ''}`}
          onClick={() => setActive(item.key)}
          aria-label={item.label}
        >
          {item.icon}
          <span style={{ fontSize: '0.6rem', marginTop: 2 }}>{item.label.split(' ')[0]}</span>
        </button>
      ))}
    </nav>
  )
}

/* ─── Section content ────────────────────────────── */
function SvgDoc() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
function SvgPlugin() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="6" height="10" rx="1" /><rect x="16" y="7" width="6" height="10" rx="1" />
      <path d="M8 12h8" />
    </svg>
  )
}
function SvgShield() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function SvgSettings() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

/* ─── Main Dashboard ─────────────────────────────── */
export default function Dashboard() {
  const [active, setActive] = useState('chat')
  const adminEmail = useMemo(getAdminEmail, [])
  const { messages, loading, sendMessage, clearChat } = useChat(adminEmail)

  // Derive sidebar stats from messages
  const messageCount = messages.filter(m => m.role === 'user').length
  const lastScanMsg = [...messages].reverse().find(m => m.responseType === 'scan')
  const lastScanCount = lastScanMsg?.data ? (lastScanMsg.data as ScanData).total_records : undefined
  const lastAuditMsg = [...messages].reverse().find(m => m.responseType === 'audit')
  const auditCount = lastAuditMsg?.data ? (lastAuditMsg.data as AuditData).total : undefined

  return (
    <div className="ws-root">
      <TopBar adminEmail={adminEmail} onClear={clearChat} />

      <div className="ws-body">
        {/* Sidebar — hidden on mobile via CSS */}
        <WorkspaceSidebar
          active={active}
          setActive={setActive}
          messageCount={messageCount}
          lastScanCount={lastScanCount}
          auditCount={auditCount}
        />

        {/* Main content */}
        <main className="ws-main">
          {active === 'chat' && (
            <>
              <ChatArea messages={messages} loading={loading} />
              <InputBar onSend={sendMessage} disabled={loading} />
            </>
          )}
          {active === 'audits' && <AuditLogsPage />}
          {active === 'integrations' && <IntegrationsPage />}
          {active === 'findings' && <FindingsPage />}
          {active === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Bottom nav — visible on mobile only via CSS */}
      <BottomNav active={active} setActive={setActive} />
    </div>
  )
}
