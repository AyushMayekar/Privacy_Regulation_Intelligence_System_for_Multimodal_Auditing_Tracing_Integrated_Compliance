import { useState } from 'react'
import StatusBadge from './StatusBadge'
import { connectMongo, startGmailOAuth } from '../api/integrationApi'

type Status = 'connected' | 'not_connected' | 'loading'

interface IntegrationCardProps {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  status: Status
  type: 'mongo' | 'gmail' | 'dummy'
  adminEmail?: string
  onStatusChange?: (id: string, status: Status) => void
}

export default function IntegrationCard({
  id, name, description, icon, status, type, adminEmail, onStatusChange,
}: IntegrationCardProps) {
  const [mongoUri, setMongoUri] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [localStatus, setLocalStatus] = useState<Status>(status)

  const setStatus = (s: Status) => {
    setLocalStatus(s)
    onStatusChange?.(id, s)
  }

  /* ── Mongo connect ── */
  async function handleMongoConnect() {
    if (!mongoUri.trim()) {
      setFeedback({ type: 'error', text: 'Please enter a MongoDB URI.' })
      return
    }
    setStatus('loading')
    setFeedback(null)
    try {
      const res = await connectMongo(mongoUri.trim())
      setStatus('connected')
      setFeedback({ type: 'success', text: res.message ?? 'MongoDB connected successfully!' })
      setMongoUri('')
    } catch (err: any) {
      setStatus('not_connected')
      setFeedback({ type: 'error', text: err?.message ?? 'Connection failed. Check your URI.' })
    }
  }

  /* ── Gmail connect ── */
  async function handleGmailConnect() {
    setStatus('loading')
    setFeedback(null)
    try {
      startGmailOAuth()
    } catch (err: any) {
      setStatus('not_connected')
      setFeedback({ type: 'error', text: err?.message ?? 'Failed to start Gmail OAuth.' })
    }
  }

  const isConnected = localStatus === 'connected'
  const isLoading = localStatus === 'loading'

  return (
    <div className={`int-card${isConnected ? ' int-card--connected' : ''}${type === 'dummy' ? ' int-card--dummy' : ''}`}>
      {/* Header */}
      <div className="int-card__header">
        <div className="int-card__icon">{icon}</div>
        <div className="int-card__meta">
          <div className="int-card__name">{name}</div>
          <div className="int-card__desc">{description}</div>
        </div>
        <StatusBadge status={localStatus} />
      </div>

      {/* Action area */}
      {type !== 'dummy' && !isConnected && (
        <div className="int-card__body">
          {type === 'mongo' && (
            <div className="int-card__form">
              <div className="int-input-wrap">
                <input
                  className="int-input"
                  type="text"
                  placeholder="mongodb+srv://user:pass@cluster.mongodb.net/db"
                  value={mongoUri}
                  onChange={e => { setMongoUri(e.target.value); setFeedback(null) }}
                  disabled={isLoading}
                  spellCheck={false}
                />
              </div>
              <button
                className="int-btn int-btn--primary"
                onClick={handleMongoConnect}
                disabled={isLoading}
              >
                {isLoading ? <><span className="int-spinner" />Connecting…</> : 'Connect'}
              </button>
            </div>
          )}

          {type === 'gmail' && (
            <button
              className="int-btn int-btn--gmail"
              onClick={handleGmailConnect}
              disabled={isLoading}
            >
              {isLoading ? (
                <><span className="int-spinner" />Redirecting…</>
              ) : (
                <>
                  <GoogleColorIcon />
                  Connect with {adminEmail ?? 'admin email'}
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Connected state */}
      {type !== 'dummy' && isConnected && (
        <div className="int-card__connected-msg">
          <CheckIcon />
          <span>Integration active</span>
        </div>
      )}

      {/* Dummy coming soon */}
      {type === 'dummy' && (
        <div className="int-card__coming-soon">
          Coming soon
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className={`int-feedback int-feedback--${feedback.type}`}>
          {feedback.type === 'error' ? <AlertIcon /> : <CheckIcon />}
          {feedback.text}
        </div>
      )}
    </div>
  )
}

const GoogleColorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)
