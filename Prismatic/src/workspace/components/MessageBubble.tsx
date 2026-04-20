import type { ChatMessage } from '../types/chat'
import ResponseRenderer from './ResponseRenderer'

function timeLabel(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

interface Props { message: ChatMessage }

export default function MessageBubble({ message }: Props) {
  const { role, content, timestamp, loading, responseType } = message

  if (role === 'user') {
    return (
      <div className="ws-msg user">
        <div className="ws-msg__avatar user">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div className="ws-msg__body">
          <div className="ws-msg__meta">
            <span>{timeLabel(timestamp)}</span>
          </div>
          <div className="ws-user-bubble">{content}</div>
        </div>
      </div>
    )
  }

  // ── Assistant ──────────────────────────
  const typeLabel =
    responseType === 'scan' ? 'Scan Result' :
    responseType === 'transform' ? 'Transform Result' :
    responseType === 'audit' ? 'Audit Report' :
    'Prismatic AI'

  return (
    <div className="ws-msg">
      <div className="ws-msg__avatar ai">P</div>
      <div className="ws-msg__body">
        <div className="ws-msg__meta">
          <span style={{ fontWeight: 600, color: 'var(--c-accent)' }}>{typeLabel}</span>
          <span>·</span>
          <span>{timeLabel(timestamp)}</span>
        </div>

        {loading ? (
          <div className="ws-skeleton">
            <div className="ws-skeleton__dot" />
            <div className="ws-skeleton__dot" />
            <div className="ws-skeleton__dot" />
            <span className="ws-skeleton__text">Agent is thinking…</span>
          </div>
        ) : (
          <ResponseRenderer message={message} />
        )}
      </div>
    </div>
  )
}
