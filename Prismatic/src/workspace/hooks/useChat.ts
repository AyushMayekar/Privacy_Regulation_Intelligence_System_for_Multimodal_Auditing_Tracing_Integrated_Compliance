import { useState, useCallback, useRef } from 'react'
import { apiChat } from '../../api/chatApi'
import type { ChatMessage, ResponseType, ScanData, TransformData, AuditData } from '../types/chat'

// Simple UUID without dependency
const genId = () => crypto.randomUUID()

// Persist sessionId per admin in localStorage
function getSessionId(): string {
  const key = 'prismatic_session_id'
  const sid = localStorage.getItem(key)
  if (sid) return sid

  const newSid = crypto.randomUUID()
  localStorage.setItem(key, newSid)
  return newSid
}

export function useChat(adminEmail: string) {
  const sessionId = useRef<string>(getSessionId())
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: genId(),
      role: 'assistant',
      content: `Hello! I'm your Prismatic Compliance Assistant.\n\nYou can ask me to:\n• **scan mongodb** — discover PII across your database\n• **transform data** — apply privacy transformations\n• **get audit logs** — retrieve compliance audit history\n• Ask anything about your compliance posture`,
      responseType: 'info',
      timestamp: new Date(),
    },
  ])
  const [loading, setLoading] = useState(false)

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return

    // 1. Append user bubble immediately
    const userMsg: ChatMessage = {
      id: genId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    // 2. Append loading skeleton for assistant
    const loadingId = genId()
    const loadingMsg: ChatMessage = {
      id: loadingId,
      role: 'assistant',
      content: '',
      loading: true,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg, loadingMsg])
    setLoading(true)

    try {
      const res = await apiChat(text.trim(), sessionId.current)

      // Update session id in case server assigned a new one
      if (res.session_id) {
        sessionId.current = res.session_id
        localStorage.setItem('prismatic_session_id', res.session_id)
      }

      const assistantMsg: ChatMessage = {
        id: loadingId,
        role: 'assistant',
        content: res.summary,
        responseType: res.type as ResponseType,
        data: res.data as ScanData | TransformData | AuditData,
        timestamp: new Date(),
        loading: false,
      }

      setMessages(prev =>
        prev.map(m => (m.id === loadingId ? assistantMsg : m))
      )
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: loadingId,
        role: 'assistant',
        content: err?.message ?? 'Something went wrong. Please try again.',
        responseType: 'info',
        timestamp: new Date(),
        loading: false,
      }
      setMessages(prev =>
        prev.map(m => (m.id === loadingId ? errMsg : m))
      )
    } finally {
      setLoading(false)
    }
  }, [adminEmail, loading])

  const clearChat = useCallback(() => {
    // Reset session
    const newSid = genId()
    sessionId.current = newSid
    localStorage.setItem('prismatic_session_id', newSid)
    setMessages([
      {
        id: genId(),
        role: 'assistant',
        content: 'Session cleared. How can I help you today?',
        responseType: 'info',
        timestamp: new Date(),
      },
    ])
  }, [adminEmail])

  return { messages, loading, sendMessage, clearChat, sessionId: sessionId.current }
}
