import { useRef, useState, useCallback } from 'react'

const SUGGESTIONS = [
  '🔍 Scan MongoDB',
  '🔁 Transform data',
  '📋 Get audit logs',
  '❓ What can you do?',
]

interface Props {
  onSend: (text: string) => void
  disabled: boolean
}

export default function InputBar({ onSend, disabled }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const autoGrow = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }

  const submit = useCallback(() => {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, disabled, onSend])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleSuggestion = (s: string) => {
    // Strip emoji prefix
    const clean = s.replace(/^[\p{Emoji}\s]+/u, '').trim()
    onSend(clean)
  }

  return (
    <div className="ws-input-area">
      {/* Quick suggestions (only when not actively chatting) */}
      <div className="ws-suggestions">
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            className="ws-suggestion"
            onClick={() => handleSuggestion(s)}
            disabled={disabled}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="ws-input-row">
        <textarea
          ref={textareaRef}
          id="ws-chat-input"
          className="ws-input"
          rows={1}
          value={value}
          onChange={e => { setValue(e.target.value); autoGrow() }}
          onKeyDown={handleKey}
          placeholder="Type a command or ask a compliance question…"
          disabled={disabled}
        />
        <button
          id="ws-send-btn"
          className="ws-send-btn"
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send"
        >
          {disabled ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
              <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </button>
      </div>
      <p className="ws-input-hint">Enter to send · Shift+Enter for new line</p>
    </div>
  )
}
