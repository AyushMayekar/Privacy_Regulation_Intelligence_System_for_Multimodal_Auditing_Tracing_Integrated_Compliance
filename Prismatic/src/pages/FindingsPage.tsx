import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchFindings, type FindingsData } from '../api/findingsApi'
import '../styles/findings.css'

/* ── Palette for charts ─────────────────────────── */
const PALETTE = ['#b0e4cc', '#408a71', '#285a48', '#7ecfb0', '#5ab090', '#a0d4bc', '#2a7060', '#c8eedd']

/* ── Label helpers ──────────────────────────────── */
const fmt = (s: string) =>
  s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const topKey = (dist: Record<string, number>) =>
  Object.entries(dist).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

/* ── Icons ──────────────────────────────────────── */
const FindingsIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)
const TotalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)
const PiiIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
const ConfIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)
const MostCommonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)
const WarnIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)
const FieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
)
const LawIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

/* ── Bar Chart ──────────────────────────────────── */
function BarChart({ dist }: { dist: Record<string, number> }) {
  const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 7)
  if (!entries.length) return <p style={{ fontSize: '0.8rem', color: 'var(--c-text-3)' }}>No data</p>
  const max = Math.max(...entries.map(e => e[1]))
  return (
    <div className="findings-bar-chart">
      {entries.map(([key, count]) => (
        <div className="findings-bar-row" key={key}>
          <span className="findings-bar-label" title={fmt(key)}>{fmt(key)}</span>
          <div className="findings-bar-track">
            <div className="findings-bar-fill" style={{ width: `${(count / max) * 100}%` }} />
          </div>
          <span className="findings-bar-count">{count}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Pie Chart ──────────────────────────────────── */
function PieChart({ dist }: { dist: Record<string, number> }) {
  const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 6)
  if (!entries.length) return <p style={{ fontSize: '0.8rem', color: 'var(--c-text-3)' }}>No data</p>
  const total = entries.reduce((s, e) => s + e[1], 0)

  let cumulative = 0
  const slices = entries.map(([key, count], i) => {
    const pct = count / total
    const startAngle = cumulative * 360
    const endAngle = (cumulative + pct) * 360
    cumulative += pct
    const toRad = (deg: number) => (deg - 90) * (Math.PI / 180)
    const cx = 60, cy = 60, r = 54
    const x1 = cx + r * Math.cos(toRad(startAngle))
    const y1 = cy + r * Math.sin(toRad(startAngle))
    const x2 = cx + r * Math.cos(toRad(endAngle))
    const y2 = cy + r * Math.sin(toRad(endAngle))
    const d = [`M ${cx} ${cy}`, `L ${x1} ${y1}`, `A ${r} ${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${x2} ${y2}`, 'Z'].join(' ')
    return { key, count, pct, d, color: PALETTE[i % PALETTE.length] }
  })

  return (
    <div className="findings-pie-wrap">
      <svg viewBox="0 0 120 120" style={{ width: 120, height: 120, display: 'block', margin: '0 auto' }}>
        {slices.map(s => (
          <path key={s.key} d={s.d} fill={s.color} opacity={0.9} stroke="#0f1f1c" strokeWidth="1" />
        ))}
        <circle cx="60" cy="60" r="30" fill="var(--c-surface-1, #0f1f1c)" />
        <text x="60" y="56" textAnchor="middle" fill="#f5f7f6" fontSize="14" fontWeight="700">{total}</text>
        <text x="60" y="68" textAnchor="middle" fill="#7a9e90" fontSize="7">findings</text>
      </svg>
      <div className="findings-pie-legend">
        {slices.map(s => (
          <div className="findings-pie-legend-item" key={s.key}>
            <span className="findings-pie-dot" style={{ background: s.color }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fmt(s.key)}</span>
            <span className="findings-pie-pct">{Math.round(s.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Page ───────────────────────────────────────── */
export default function FindingsPage() {
  const navigate = useNavigate()

  // Read session_id — stored by AI Workspace after scan
  const sessionId =
    localStorage.getItem('prismatic_session_id') ??
    sessionStorage.getItem('prismatic_session_id') ??
    ''

  const [data, setData] = useState<FindingsData | null>(null)
  const [isEmpty, setIsEmpty] = useState(false)
  const [pageStatus, setPageStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  async function loadFindings() {
    if (!sessionId) {
      setIsEmpty(true)
      setPageStatus('ready')
      return
    }
    setPageStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetchFindings(sessionId)
      if (res.status === 'empty') {
        setIsEmpty(true)
      } else {
        setData(res.data ?? null)
        setIsEmpty(false)
      }
      setPageStatus('ready')
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to load findings.')
      setPageStatus('error')
    }
  }

  useEffect(() => { loadFindings() }, [])

  /* ── Skeleton ── */
  if (pageStatus === 'loading') {
    return (
      <div className="findings-page">
        <div className="findings-header">
          <div>
            <h1 className="findings-header__title">Findings</h1>
            <p className="findings-header__sub">Loading scan insights…</p>
          </div>
        </div>
        <div className="findings-stats">
          {[1, 2, 3, 4].map(i => <div key={i} className="findings-skeleton" style={{ height: 100 }} />)}
        </div>
        <div className="findings-charts">
          {[1, 2, 3].map(i => <div key={i} className="findings-skeleton" style={{ height: 200 }} />)}
        </div>
        <div className="findings-insights">
          {[1, 2, 3].map(i => <div key={i} className="findings-skeleton" style={{ height: 80 }} />)}
        </div>
      </div>
    )
  }

  /* ── Error ── */
  if (pageStatus === 'error') {
    return (
      <div className="findings-page">
        <div className="findings-header">
          <div>
            <h1 className="findings-header__title">Findings</h1>
          </div>
        </div>
        <div style={{ background: 'var(--c-surface-1, #0f1f1c)', border: '1px solid var(--c-border, #1e3530)', borderRadius: 14 }}>
          <div className="findings-error">
            <p className="findings-error__title">Failed to load findings</p>
            <p className="findings-error__sub">{errorMsg}</p>
            <button className="findings-retry-btn" onClick={loadFindings}>Retry</button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Empty State ── */
  if (isEmpty || !data) {
    return (
      <div className="findings-page">
        <div className="findings-header">
          <div>
            <h1 className="findings-header__title">Findings</h1>
            <p className="findings-header__sub">Insights from your latest scan session</p>
          </div>
        </div>
        <div className="findings-empty">
          <div className="findings-empty__icon-wrap">
            <FindingsIcon />
          </div>
          <p className="findings-empty__title">No findings yet</p>
          <p className="findings-empty__sub">
            Run a scan using the AI agent to detect PII, map regulations, and view compliance insights here.
          </p>
          <button className="findings-empty__cta" onClick={() => navigate('/dashboard/ai-workspace')}>
            Go to AI Workspace <ArrowRightIcon />
          </button>
        </div>
      </div>
    )
  }

  /* ── Derived insights ── */
  const mostCommonPii = topKey(data.pii_distribution)
  const topField = topKey(data.field_distribution)
  const topLaw = topKey(data.law_distribution)
  const uniquePiiTypes = Object.keys(data.pii_distribution).length
  const confidenceLevel = data.avg_confidence >= 80 ? 'High' : data.avg_confidence >= 50 ? 'Moderate' : 'Low'

  return (
    <div className="findings-page">

      {/* ── Header ── */}
      <div className="findings-header">
        <div className="findings-header__left">
          <h1 className="findings-header__title">Findings</h1>
          <p className="findings-header__sub">Insights from your latest scan session</p>
        </div>
        {sessionId && (
          <div className="findings-session-badge">
            <span className="findings-session-badge__dot" />
            {sessionId.slice(0, 24)}…
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <p className="findings-section-label">Overview</p>
      <div className="findings-stats">
        <div className="findings-stat-card">
          <div className="findings-stat-card__icon"><TotalIcon /></div>
          <div className="findings-stat-card__label">Total Findings</div>
          <div className="findings-stat-card__value">{data.total_findings.toLocaleString()}</div>
          <div className="findings-stat-card__sub">detected across all sources</div>
        </div>

        <div className="findings-stat-card">
          <div className="findings-stat-card__icon"><PiiIcon /></div>
          <div className="findings-stat-card__label">Unique PII Types</div>
          <div className="findings-stat-card__value">{uniquePiiTypes}</div>
          <div className="findings-stat-card__sub">distinct data categories</div>
        </div>

        <div className="findings-stat-card">
          <div className="findings-stat-card__icon"><ConfIcon /></div>
          <div className="findings-stat-card__label">Avg Confidence</div>
          <div className="findings-stat-card__value">{data.avg_confidence}%</div>
          <div className="findings-stat-card__sub">{confidenceLevel.toLowerCase()} confidence detections</div>
        </div>

        <div className="findings-stat-card">
          <div className="findings-stat-card__icon"><MostCommonIcon /></div>
          <div className="findings-stat-card__label">Most Common PII</div>
          <div className={`findings-stat-card__value ${mostCommonPii.length > 10 ? 'findings-stat-card__value--sm' : ''}`}>
            {fmt(mostCommonPii)}
          </div>
          <div className="findings-stat-card__sub">highest frequency type</div>
        </div>
      </div>

      {/* ── Charts ── */}
      <p className="findings-section-label">Distributions</p>
      <div className="findings-charts">
        <div className="findings-chart-card">
          <p className="findings-chart-card__title">PII Type Breakdown</p>
          <BarChart dist={data.pii_distribution} />
        </div>

        <div className="findings-chart-card">
          <p className="findings-chart-card__title">Regulatory Exposure</p>
          <PieChart dist={data.law_distribution} />
        </div>

        <div className="findings-chart-card">
          <p className="findings-chart-card__title">Top Risk Fields</p>
          <BarChart dist={data.field_distribution} />
        </div>
      </div>

      {/* ── Insight Cards ── */}
      <p className="findings-section-label">Key Insights</p>
      <div className="findings-insights">
        <div className="findings-insight-card">
          <div className="findings-insight-card__icon findings-insight-card__icon--warn">
            <WarnIcon />
          </div>
          <div className="findings-insight-card__body">
            <div className="findings-insight-card__label">Most Sensitive Data</div>
            <div className="findings-insight-card__value">
              {fmt(mostCommonPii)} detected most frequently — prioritise protection of this type.
            </div>
          </div>
        </div>

        <div className="findings-insight-card">
          <div className="findings-insight-card__icon findings-insight-card__icon--blue">
            <FieldIcon />
          </div>
          <div className="findings-insight-card__body">
            <div className="findings-insight-card__label">Top Risk Field</div>
            <div className="findings-insight-card__value">
              <code style={{ fontSize: '0.82rem', color: '#90caff' }}>{topField}</code> has the highest concentration of sensitive data.
            </div>
          </div>
        </div>

        <div className="findings-insight-card">
          <div className="findings-insight-card__icon findings-insight-card__icon--green">
            <LawIcon />
          </div>
          <div className="findings-insight-card__body">
            <div className="findings-insight-card__label">Primary Regulation</div>
            <div className="findings-insight-card__value">
              {topLaw.toUpperCase()} governs the majority of detected findings — review obligations immediately.
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
