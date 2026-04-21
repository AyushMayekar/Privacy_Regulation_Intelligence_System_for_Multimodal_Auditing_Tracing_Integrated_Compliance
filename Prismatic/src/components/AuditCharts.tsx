import type { AuditInsights } from '../utils/auditTransform'
import { formatAction, formatPii, formatPhase } from '../utils/auditTransform'

interface Props {
  insights: AuditInsights
}

// A small palette of greens/teals for pie slices
const PALETTE = [
  '#b0e4cc', '#408a71', '#285a48', '#7ecfb0',
  '#5ab090', '#a0d4bc', '#2a7060', '#c8eedd',
]

export default function AuditCharts({ insights }: Props) {
  return (
    <div className="audit-charts">
      {/* Bar: PII Distribution */}
      <div className="audit-chart-card">
        <p className="audit-chart-card__title">PII Type Breakdown</p>
        <BarChart dist={insights.piiDistribution} formatter={formatPii} />
      </div>

      {/* Pie: Action Distribution */}
      <div className="audit-chart-card">
        <p className="audit-chart-card__title">Actions Taken</p>
        <PieChart dist={insights.actionDistribution} formatter={formatAction} />
      </div>

      {/* Bar: Phase Distribution */}
      <div className="audit-chart-card">
        <p className="audit-chart-card__title">Phase Breakdown</p>
        <BarChart dist={insights.phaseDistribution} formatter={formatPhase} />
      </div>

      {/* Line chart: Timeline — spans full width */}
      {insights.timelineData.length > 1 && (
        <div className="audit-chart-card audit-chart-card--wide">
          <p className="audit-chart-card__title">Activity Over Time</p>
          <LineChart data={insights.timelineData} />
        </div>
      )}
    </div>
  )
}

/* ── Bar Chart ────────────────────────────────── */
function BarChart({
  dist, formatter,
}: {
  dist: Record<string, number>
  formatter: (k: string) => string
}) {
  const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 6)
  if (!entries.length) return <p style={{ fontSize: '0.8rem', color: 'var(--c-text-3)' }}>No data</p>
  const max = Math.max(...entries.map(e => e[1]))

  return (
    <div className="audit-bar-chart">
      {entries.map(([key, count]) => (
        <div className="audit-bar-row" key={key}>
          <span className="audit-bar-label" title={formatter(key)}>{formatter(key)}</span>
          <div className="audit-bar-track">
            <div
              className="audit-bar-fill"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="audit-bar-count">{count}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Pie Chart ────────────────────────────────── */
function PieChart({
  dist, formatter,
}: {
  dist: Record<string, number>
  formatter: (k: string) => string
}) {
  const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 6)
  if (!entries.length) return <p style={{ fontSize: '0.8rem', color: 'var(--c-text-3)' }}>No data</p>
  const total = entries.reduce((s, e) => s + e[1], 0)

  // Build SVG conic-gradient-style arcs
  let cumulative = 0
  const slices = entries.map(([key, count], i) => {
    const pct = count / total
    const startAngle = cumulative * 360
    const endAngle   = (cumulative + pct) * 360
    cumulative += pct

    const toRad = (deg: number) => (deg - 90) * (Math.PI / 180)
    const cx = 60, cy = 60, r = 54
    const x1 = cx + r * Math.cos(toRad(startAngle))
    const y1 = cy + r * Math.sin(toRad(startAngle))
    const x2 = cx + r * Math.cos(toRad(endAngle))
    const y2 = cy + r * Math.sin(toRad(endAngle))
    const largeArc = pct > 0.5 ? 1 : 0

    const d = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ')

    return { key, count, pct, d, color: PALETTE[i % PALETTE.length] }
  })

  return (
    <div className="audit-pie-wrap">
      <svg viewBox="0 0 120 120" className="audit-pie">
        {slices.map(s => (
          <path key={s.key} d={s.d} fill={s.color} opacity={0.9} stroke="#0f1f1c" strokeWidth="1" />
        ))}
        {/* donut hole */}
        <circle cx="60" cy="60" r="30" fill="var(--c-surface-1, #0f1f1c)" />
        <text x="60" y="56" textAnchor="middle" fill="#f5f7f6" fontSize="14" fontWeight="700">{total}</text>
        <text x="60" y="68" textAnchor="middle" fill="#7a9e90" fontSize="7">total</text>
      </svg>
      <div className="audit-pie-legend">
        {slices.slice(0, 5).map(s => (
          <div className="audit-pie-legend-item" key={s.key}>
            <span className="audit-pie-dot" style={{ background: s.color }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {formatter(s.key)}
            </span>
            <span className="audit-pie-pct">{Math.round(s.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Line Chart (SVG) ─────────────────────────── */
function LineChart({ data }: { data: { date: string; count: number }[] }) {
  const W = 800, H = 120, PAD = { top: 12, right: 16, bottom: 8, left: 28 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const maxVal = Math.max(...data.map(d => d.count), 1)

  const points = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1 || 1)) * innerW,
    y: PAD.top  + innerH - (d.count / maxVal) * innerH,
    ...d,
  }))

  const pathD  = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD  = [
    `M ${points[0].x} ${PAD.top + innerH}`,
    ...points.map(p => `L ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${PAD.top + innerH}`,
    'Z',
  ].join(' ')

  // show at most 6 date labels
  const labelIndices = data.length <= 6
    ? data.map((_, i) => i)
    : [0, Math.floor(data.length / 5), Math.floor(data.length * 2 / 5),
       Math.floor(data.length * 3 / 5), Math.floor(data.length * 4 / 5), data.length - 1]

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) }
    catch { return d }
  }

  return (
    <div className="audit-line-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: 110 }}>
        <defs>
          <linearGradient id="audit-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#408a71" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#408a71" stopOpacity="0"   />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1].map(f => {
          const y = PAD.top + innerH * (1 - f)
          return (
            <g key={f}>
              <line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y}
                stroke="#1e3530" strokeWidth="1" strokeDasharray="3 4" />
              <text x={PAD.left - 4} y={y + 4} textAnchor="end"
                fill="#7a9e90" fontSize="9">{Math.round(maxVal * f)}</text>
            </g>
          )
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#audit-area-grad)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="#408a71" strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3"
            fill="#b0e4cc" stroke="#0f1f1c" strokeWidth="1.5" />
        ))}

        {/* X-axis date labels */}
        {labelIndices.map(i => (
          <text key={i} x={points[i].x} y={H - 1} textAnchor="middle"
            fill="#7a9e90" fontSize="8">{formatDate(data[i].date)}</text>
        ))}
      </svg>
    </div>
  )
}
