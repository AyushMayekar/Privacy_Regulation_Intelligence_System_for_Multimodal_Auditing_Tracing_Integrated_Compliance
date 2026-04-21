import type { ChatMessage, ScanData, TransformData, AuditData } from '../types/chat'
import ScanCard from './renderers/ScanCard'
import TransformCard from './renderers/TransformCard'
import AuditCard from './renderers/AuditCard'

/** Central dispatcher — picks the right card based on backend response type */
export default function ResponseRenderer({ message }: { message: ChatMessage }) {
  const { responseType, data, content } = message

  if (responseType === 'scan') {
    return <ScanCard data={data as ScanData} summary={content} />
  }
  if (responseType === 'transform') {
    return <TransformCard data={data as TransformData} summary={content} />
  }
  if (responseType === 'audit') {
    return <AuditCard data={data as AuditData} summary={content} />
  }

  // Default: plain info bubble with lightweight markdown rendering
  return (
    <div className="ws-info-bubble">
      {content.split('\n').map((line: string, i: number) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g)
        return (
          <div key={i} style={i > 0 && line.trim() === '' ? { marginTop: 8 } : undefined}>
            {parts.map((p: string, j: number) =>
              p.startsWith('**') && p.endsWith('**')
                ? <strong key={j} style={{ color: 'var(--c-text)', fontWeight: 700 }}>{p.slice(2, -2)}</strong>
                : <span key={j}>{p}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
