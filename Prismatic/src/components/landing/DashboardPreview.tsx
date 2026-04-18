import { useEffect, useRef } from 'react'

// SVG area chart path data for compliance score over time
const CHART_POINTS = [
  [0, 115], [47, 100], [94, 110], [141, 84],
  [188, 72], [235, 78], [282, 58], [329, 65],
  [376, 48], [423, 38], [470, 42], [520, 24],
]

function toPath(pts: number[][]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0][0]},${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1]
    const [cx, cy] = pts[i]
    const mx = (px + cx) / 2
    d += ` C ${mx},${py} ${mx},${cy} ${cx},${cy}`
  }
  return d
}

const linePath = toPath(CHART_POINTS)
const areaPath =
  linePath +
  ` L ${CHART_POINTS[CHART_POINTS.length - 1][0]},160 L 0,160 Z`

const navItems = [
  { icon: '⊞', label: 'Dashboard', active: true },
  { icon: '◎', label: 'Scans' },
  { icon: '⚑', label: 'Violations' },
  { icon: '📋', label: 'Audit Logs' },
  { icon: '⚙', label: 'Policies' },
  { icon: '📊', label: 'Reports' },
]

const metrics = [
  { label: 'Records Scanned', value: '2.41M', trend: '+11.2%', up: true },
  { label: 'Violations Found', value: '47', trend: '-20.9%', up: false },
  { label: 'Compliance Score', value: '94.2%', trend: '+2.1%', up: true },
]

const barData = [
  { label: 'GDPR', pct: 94 },
  { label: 'HIPAA', pct: 87 },
  { label: 'CCPA', pct: 98 },
  { label: 'SOC 2', pct: 73 },
  { label: 'ISO 27701', pct: 81 },
]

const logItems = [
  { action: 'PII exposure detected in payments_db', time: '2m ago', badge: 'warn', badgeLabel: 'Warning' },
  { action: 'Weekly GDPR audit completed', time: '1h ago', badge: 'ok', badgeLabel: 'Passed' },
  { action: 'New data source connected: S3 bucket', time: '3h ago', badge: 'info', badgeLabel: 'Info' },
  { action: 'Consent records updated — 14,200 users', time: '5h ago', badge: 'ok', badgeLabel: 'Passed' },
]

export default function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) ref.current?.classList.add('visible') },
      { threshold: 0.2 }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="pris-dbpreview" id="dashboard-preview">
      <div className="pris-dbpreview__inner">
        <div className="pris-dbpreview__header">
          <div className="pris-label">Dashboard Preview</div>
          <h2 className="pris-dbpreview__title">
            Your compliance command centre
          </h2>
          <p className="pris-dbpreview__sub">
            A live, unified view of your privacy posture — metrics, charts,
            and activity logs always at a glance.
          </p>
        </div>

        {/* Mock Dashboard */}
        <div className="pris-db" ref={ref}>
          {/* Top bar */}
          <div className="pris-db__topbar">
            <div className="pris-db__dots">
              <div className="pris-db__dot pris-db__dot--r" />
              <div className="pris-db__dot pris-db__dot--y" />
              <div className="pris-db__dot pris-db__dot--g" />
            </div>
            <div className="pris-db__title-bar">Prismatic — Compliance Dashboard</div>
          </div>

          {/* Body */}
          <div className="pris-db__body">
            {/* Sidebar */}
            <div className="pris-db__sidebar">
              <div className="pris-db__sidebar-logo">PRISMATIC</div>
              {navItems.map((item) => (
                <div key={item.label} className={`pris-db__nav-item${item.active ? ' active' : ''}`}>
                  <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Main */}
            <div className="pris-db__main">
              <div className="pris-db__greeting">
                Hello, <strong>Admin</strong> — here's your compliance overview
              </div>

              {/* Metric cards */}
              <div className="pris-db__metrics">
                {metrics.map((m) => (
                  <div key={m.label} className="pris-db__metric">
                    <div className="pris-db__metric-label">{m.label}</div>
                    <div className="pris-db__metric-value">{m.value}</div>
                    <div className={`pris-db__metric-trend pris-db__metric-trend--${m.up ? 'up' : 'down'}`}>
                      {m.up ? '↑' : '↓'} {m.trend}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="pris-db__chart-wrap">
                <div className="pris-db__chart-title">Compliance Score — Last 12 Months</div>
                <svg
                  className="pris-db__chart-svg"
                  viewBox="0 0 520 160"
                  preserveAspectRatio="none"
                  style={{ height: 120 }}
                >
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#408a71" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#408a71" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#408a71" />
                      <stop offset="100%" stopColor="#b0e4cc" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  {[40, 80, 120].map((y) => (
                    <line key={y} x1="0" y1={y} x2="520" y2={y} stroke="rgba(176,228,204,0.06)" strokeWidth="1" />
                  ))}
                  {/* Area fill */}
                  <path d={areaPath} fill="url(#areaGrad)" />
                  {/* Line */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="url(#lineGrad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data points */}
                  {CHART_POINTS.map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="3.5" fill="#b0e4cc" />
                  ))}
                  {/* X-axis labels */}
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                    <text key={m} x={i * 47} y="156" fontSize="9" fill="rgba(176,228,204,0.35)" textAnchor="middle">{m}</text>
                  ))}
                </svg>
              </div>
            </div>

            {/* Right panel */}
            <div className="pris-db__right">
              {/* Analytics */}
              <div>
                <div className="pris-db__panel-title">Framework Score</div>
                <div className="pris-db__analytics" style={{ marginTop: 12 }}>
                  {barData.map(({ label, pct }) => (
                    <div key={label} className="pris-db__bar-row">
                      <div className="pris-db__bar-label">{label}</div>
                      <div className="pris-db__bar-track">
                        <div className="pris-db__bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(176,228,204,0.5)', width: 28, textAlign: 'right' }}>{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity log */}
              <div>
                <div className="pris-db__panel-title">Recent Activity</div>
                <div className="pris-db__log" style={{ marginTop: 12 }}>
                  {logItems.map((item) => (
                    <div key={item.action} className="pris-db__log-item">
                      <div className="pris-db__log-action">{item.action}</div>
                      <div className="pris-db__log-meta">
                        <span>{item.time}</span>
                        <span className={`pris-db__log-badge pris-db__log-badge--${item.badge}`}>
                          {item.badgeLabel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
