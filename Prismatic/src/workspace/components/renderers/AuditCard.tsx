import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { AuditData, AuditEntry } from '../../types/chat'

const COLORS = ['#408a71', '#b0e4cc', '#285a48', '#6ee7b7', '#f59e0b', '#818cf8']

function ConfPill({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const cls = pct >= 80 ? 'high' : pct >= 60 ? 'med' : 'low'
  return <span className={`ws-audit-conf ${cls}`}>{pct}%</span>
}

function PhaseTag({ phase }: { phase: string }) {
  const color = phase === 'PHASE_1_BASELINE' ? '#60a5fa' : '#f59e0b'
  return (
    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: 99, border: `1px solid ${color}`, color, background: `${color}18` }}>
      {phase === 'PHASE_1_BASELINE' ? 'Baseline' : 'DSAR'}
    </span>
  )
}

// Format iso timestamp
function fmt(ts: string) {
  if (!ts) return '—'
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ts
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

interface Props { data: AuditData; summary: string }

export default function AuditCard({ data, summary }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const empty = !data || !data.total
  if (empty) return (
    <div className="ws-card">
      <div className="ws-card__header">
        <div className="ws-card__icon audit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div>
          <div className="ws-card__title">Audit Logs</div>
          <div className="ws-card__subtitle">No audit logs found</div>
        </div>
      </div>
      <div className="ws-card__body"><p className="ws-summary">{summary}</p></div>
    </div>
  )

  // Unique PII types for filter
  const piiTypes = ['all', ...Array.from(new Set(data.entries.map(e => e.pii).filter(Boolean)))]

  const filtered: AuditEntry[] = activeFilter === 'all'
    ? data.entries
    : data.entries.filter(e => e.pii === activeFilter)

  return (
    <div className="ws-card">
      <div className="ws-card__header">
        <div className="ws-card__icon audit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div>
          <div className="ws-card__title">Audit Logs Retrieved</div>
          <div className="ws-card__subtitle">{data.total} total entries</div>
        </div>
      </div>

      <div className="ws-card__body">
        {/* Stats */}
        <div className="ws-stats-row">
          <div className="ws-stat-chip">
            <div className="ws-stat-chip__value">{data.total}</div>
            <div className="ws-stat-chip__label">Total Logs</div>
          </div>
          <div className="ws-stat-chip">
            <div className="ws-stat-chip__value">{data.pii_counts.length}</div>
            <div className="ws-stat-chip__label">PII Types</div>
          </div>
          <div className="ws-stat-chip">
            <div className="ws-stat-chip__value">{data.action_counts.length}</div>
            <div className="ws-stat-chip__label">Actions</div>
          </div>
          <div className="ws-stat-chip">
            <div className="ws-stat-chip__value">{Math.round((data.average_confidence ?? 0) * 100)}%</div>
            <div className="ws-stat-chip__label">Avg Conf</div>
          </div>
        </div>

        {/* Action breakdown bar */}
        {data.action_counts && data.action_counts.length > 0 && (
          <div className="ws-chart-area">
            <p className="ws-chart-title">Actions Breakdown</p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={data.action_counts} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" tick={{ fill: 'var(--c-text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fill: 'var(--c-text-2)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 8, fontSize: '0.8rem' }}
                  cursor={{ fill: 'var(--c-accent-dim)' }}
                  formatter={(val: any) => [`${val} entries`]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={700}>
                  {data.action_counts.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Summary */}
        <p className="ws-summary" style={{ marginBottom: 12 }}>{summary}</p>

        {/* Filter buttons */}
        {piiTypes.length > 1 && (
          <div className="ws-audit-filter">
            {piiTypes.slice(0, 8).map(t => (
              <button
                key={t}
                className={`ws-audit-filter__btn${activeFilter === t ? ' active' : ''}`}
                onClick={() => setActiveFilter(t)}
              >
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>
        )}

        {/* Table */}
        {filtered.length > 0 && (
          <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--c-border)' }}>
            <table className="ws-audit-table">
              <thead>
                <tr>
                  <th>PII Type</th>
                  <th>Action</th>
                  <th>Phase</th>
                  <th>Laws</th>
                  <th>Confidence</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 20).map((entry, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--c-text)' }}>{entry.pii || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{entry.action || '—'}</td>
                    <td>{entry.phase ? <PhaseTag phase={entry.phase} /> : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {entry.laws?.map(l => (
                          <span key={l} style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: 4, background: 'var(--c-accent-dim)', color: 'var(--c-accent)', fontWeight: 700 }}>{l}</span>
                        )) || '—'}
                      </div>
                    </td>
                    <td><ConfPill value={entry.confidence} /></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--c-text-3)', whiteSpace: 'nowrap' }}>{fmt(entry.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 20 && (
              <div style={{ padding: '8px 12px', fontSize: '0.78rem', color: 'var(--c-text-3)', textAlign: 'center', borderTop: '1px solid var(--c-border)' }}>
                Showing 20 of {filtered.length} entries
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
