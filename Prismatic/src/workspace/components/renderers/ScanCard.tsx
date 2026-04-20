import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ScanData } from '../../types/chat'

const COLORS = ['#408a71', '#b0e4cc', '#285a48', '#6ee7b7', '#34d399', '#10b981', '#60a5fa', '#818cf8']

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--c-border-2)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 1s ease' }} />
      </div>
      <span style={{ fontWeight: 700, fontSize: '0.82rem', color, minWidth: 34 }}>{pct}%</span>
    </div>
  )
}

interface Props { data: ScanData; summary: string }

export default function ScanCard({ data, summary }: Props) {
  const empty = !data || !data.total_records
  if (empty) return (
    <div className="ws-card">
      <div className="ws-card__header">
        <div className="ws-card__icon scan">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <div>
          <div className="ws-card__title">Scan Completed</div>
          <div className="ws-card__subtitle">No sensitive data found</div>
        </div>
      </div>
      <div className="ws-card__body"><p className="ws-summary">{summary}</p></div>
    </div>
  )

  return (
    <div className="ws-card">
      <div className="ws-card__header">
        <div className="ws-card__icon scan">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <div>
          <div className="ws-card__title">Scan Completed</div>
          <div className="ws-card__subtitle">{data.total_records.toLocaleString()} sensitive records detected</div>
        </div>
      </div>

      <div className="ws-card__body">
        {/* Stats row */}
        <div className="ws-stats-row">
          <div className="ws-stat-chip">
            <div className="ws-stat-chip__value">{data.total_records.toLocaleString()}</div>
            <div className="ws-stat-chip__label">Records</div>
          </div>
          <div className="ws-stat-chip">
            <div className="ws-stat-chip__value">{data.pii_types?.length ?? 0}</div>
            <div className="ws-stat-chip__label">PII Types</div>
          </div>
          <div className="ws-stat-chip">
            <div className="ws-stat-chip__value">{data.laws?.length ?? 0}</div>
            <div className="ws-stat-chip__label">Regulations</div>
          </div>
          <div className="ws-stat-chip" style={{ flex: 1, minWidth: 160 }}>
            <div className="ws-stat-chip__label" style={{ marginBottom: 6 }}>Avg Confidence</div>
            <ConfidenceBar value={data.average_confidence} />
          </div>
        </div>

        {/* PII Distribution chart */}
        {data.pii_types && data.pii_types.length > 0 && (
          <div className="ws-chart-area">
            <p className="ws-chart-title">PII Type Distribution</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.pii_types}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {data.pii_types.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 8, fontSize: '0.8rem' }}
                  formatter={(val: any, name: any) => [`${val} records`, String(name)]}
                />
                <Legend
                  formatter={(value) => <span style={{ fontSize: '0.78rem', color: 'var(--c-text-2)' }}>{value}</span>}
                  wrapperStyle={{ paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Summary text */}
        <p className="ws-summary" style={{ marginBottom: 12 }}>{summary}</p>

        {/* Regulation tags */}
        {data.laws && data.laws.length > 0 && (
          <div className="ws-tags">
            {data.laws.map(law => (
              <span key={law} className="ws-tag">{law}</span>
            ))}
          </div>
        )}

        {/* Top fields */}
        {data.top_fields && data.top_fields.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <p className="ws-chart-title">Top Affected Fields</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.top_fields.map((field, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ color: 'var(--c-text-2)', fontFamily: 'monospace' }}>{field}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
