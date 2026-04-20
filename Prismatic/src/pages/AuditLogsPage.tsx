import { useEffect, useState, useMemo } from 'react'
import { fetchAuditLogs, type AuditLog, type AuditQuery } from '../api/auditApi'
import { transformLogs, formatAction, formatPii, formatPhase, formatTs } from '../utils/auditTransform'
import AuditCharts from '../components/AuditCharts'
import '../styles/auditLogs.css'

/* ── Icons ─────────────────────────────────────── */
const LogsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
)

const TotalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)
const PiiIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
const ActionIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)
const ConfIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

/* ── Helpers ────────────────────────────────────── */
function getUniquePhases(logs: AuditLog[]): string[] {
  return Array.from(new Set(logs.map(l => l.phase))).sort()
}

/* ── Page ───────────────────────────────────────── */
export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [pageStatus, setPageStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  // Filters
  const [phaseFilter, setPhaseFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  async function loadLogs() {
    setPageStatus('loading')
    setErrorMsg('')
    const query: AuditQuery = { limit: 200 }
    if (phaseFilter) query.phase = phaseFilter
    if (dateFrom) query.date_from = dateFrom
    if (dateTo) query.date_to = dateTo
    try {
      const data = await fetchAuditLogs(query)
      setLogs(data)
      setPageStatus('ready')
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to load audit logs.')
      setPageStatus('error')
    }
  }

  useEffect(() => { loadLogs() }, [])

  const insights = useMemo(() => transformLogs(logs), [logs])
  const phases = useMemo(() => getUniquePhases(logs), [logs])

  // Client-side filter for table only (API already filters but we support quick client filter too)
  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      if (phaseFilter && l.phase !== phaseFilter) return false
      return true
    })
  }, [logs, phaseFilter])

  /* ── Skeleton ── */
  if (pageStatus === 'loading') {
    return (
      <div className="audit-page">
        <div className="audit-header">
          <div>
            <h1 className="audit-header__title">Audit Logs</h1>
            <p className="audit-header__sub">Loading compliance intelligence…</p>
          </div>
        </div>
        <div className="audit-stats">
          {[1, 2, 3, 4].map(i => <div key={i} className="audit-skeleton" style={{ height: 100 }} />)}
        </div>
        <div className="audit-charts">
          {[1, 2, 3].map(i => <div key={i} className="audit-skeleton" style={{ height: 200 }} />)}
        </div>
        <div className="audit-skeleton" style={{ height: 300 }} />
      </div>
    )
  }

  /* ── Error ── */
  if (pageStatus === 'error') {
    return (
      <div className="audit-page">
        <div className="audit-header">
          <div>
            <h1 className="audit-header__title">Audit Logs</h1>
          </div>
        </div>
        <div className="audit-table-card">
          <div className="audit-error">
            <p className="audit-error__title">Failed to load audit logs</p>
            <p className="audit-error__sub">{errorMsg}</p>
            <button className="audit-retry-btn" onClick={loadLogs}>Retry</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="audit-page">

      {/* ── Header ── */}
      <div className="audit-header">
        <div className="audit-header__left">
          <h1 className="audit-header__title">Audit Logs</h1>
          <p className="audit-header__sub">
            Compliance intelligence across {insights.totalLogs.toLocaleString()} recorded actions
          </p>
        </div>
        <div className="audit-filters">
          <select
            className="audit-select"
            value={phaseFilter}
            onChange={e => setPhaseFilter(e.target.value)}
          >
            <option value="">All Phases</option>
            {phases.map(p => (
              <option key={p} value={p}>{formatPhase(p)}</option>
            ))}
          </select>
          <input
            type="date"
            className="audit-date-input"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            title="From date"
          />
          <input
            type="date"
            className="audit-date-input"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            title="To date"
          />
          <button className="audit-refresh-btn" onClick={loadLogs}>
            <RefreshIcon />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <p className="audit-section-label">Insights</p>
      <div className="audit-stats">
        <div className="audit-stat-card">
          <div className="audit-stat-card__icon"><TotalIcon /></div>
          <div className="audit-stat-card__label">Total Logs</div>
          <div className="audit-stat-card__value">{insights.totalLogs.toLocaleString()}</div>
          <div className="audit-stat-card__sub">compliance records</div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-card__icon"><PiiIcon /></div>
          <div className="audit-stat-card__label">Unique PII Types</div>
          <div className="audit-stat-card__value">{insights.uniquePiiTypes}</div>
          <div className="audit-stat-card__sub">data categories tracked</div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-card__icon"><ActionIcon /></div>
          <div className="audit-stat-card__label">Top Action</div>
          <div className={`audit-stat-card__value ${insights.mostFrequentAction.length > 10 ? 'audit-stat-card__value--sm' : ''}`}>
            {formatAction(insights.mostFrequentAction)}
          </div>
          <div className="audit-stat-card__sub">most applied protection</div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-card__icon"><ConfIcon /></div>
          <div className="audit-stat-card__label">Avg Confidence</div>
          <div className="audit-stat-card__value">{insights.avgConfidence}%</div>
          <div className="audit-stat-card__sub">detection accuracy</div>
        </div>
      </div>

      {/* ── Charts ── */}
      {insights.totalLogs > 0 && (
        <>
          <p className="audit-section-label">Analytics</p>
          <AuditCharts insights={insights} />
        </>
      )}

      {/* ── Table ── */}
      <p className="audit-section-label">Detailed Log View</p>
      <div className="audit-table-card">
        <div className="audit-table-header">
          <p className="audit-table-title">All Records</p>
          <span className="audit-table-count">{filteredLogs.length} entries</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="audit-empty">
            <div className="audit-empty__icon"><LogsIcon /></div>
            <p className="audit-empty__title">No audit logs found</p>
            <p className="audit-empty__sub">
              {phaseFilter ? 'Try clearing the phase filter.' : 'Run a compliance scan to generate logs.'}
            </p>
          </div>
        ) : (
          <div className="audit-table-wrap">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>PII Type</th>
                  <th>Action</th>
                  <th>Phase</th>
                  <th>Confidence</th>
                  <th>Laws</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, i) => (
                  <tr key={i}>
                    <td><span className="audit-ts">{formatTs(log.ts)}</span></td>
                    <td><span className="audit-chip audit-chip--pii">{formatPii(log.pii)}</span></td>
                    <td><span className="audit-chip audit-chip--action">{formatAction(log.act)}</span></td>
                    <td><span className="audit-chip audit-chip--phase">{formatPhase(log.phase)}</span></td>
                    <td>
                      <div className="audit-conf-wrap">
                        <div className="audit-conf-bar">
                          <div
                            className="audit-conf-fill"
                            style={{ width: `${(log.conf ?? 0) * 100}%` }}
                          />
                        </div>
                        <span className="audit-conf-val">{Math.round((log.conf ?? 0) * 100)}%</span>
                      </div>
                    </td>
                    <td>
                      {(log.laws ?? []).map(law => (
                        <span key={law} className="audit-chip audit-chip--law">
                          {law.toUpperCase()}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
