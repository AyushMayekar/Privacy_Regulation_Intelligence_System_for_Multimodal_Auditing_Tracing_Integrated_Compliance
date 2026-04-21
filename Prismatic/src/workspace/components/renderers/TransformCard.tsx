import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import type { TransformData } from '../../types/chat'

const BAR_COLORS = ['#408a71', '#b0e4cc', '#818cf8', '#6ee7b7', '#f59e0b', '#60a5fa']
const PIE_COLORS = ['#408a71', '#285a48', '#b0e4cc', '#34d399', '#10b981', '#6ee7b7']

interface Props { data: TransformData; summary: string }

export default function TransformCard({ data, summary }: Props) {
  const empty = !data || !data.total_records
  if (empty) return (
    <div className="ws-card">
      <div className="ws-card__header">
        <div className="ws-card__icon transform">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="21 12 18 12 15 21 9 3 6 12 3 12"/>
          </svg>
        </div>
        <div>
          <div className="ws-card__title">Transformation Completed</div>
          <div className="ws-card__subtitle">No data to transform</div>
        </div>
      </div>
      <div className="ws-card__body"><p className="ws-summary">{summary}</p></div>
    </div>
  )

  const confPct = Math.round((data.average_confidence ?? 0) * 100)
  const confColor = confPct >= 80 ? '#10b981' : confPct >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="ws-card">
      <div className="ws-card__header">
        <div className="ws-card__icon transform">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="21 12 18 12 15 21 9 3 6 12 3 12"/>
          </svg>
        </div>
        <div>
          <div className="ws-card__title">Transformation Completed</div>
          <div className="ws-card__subtitle">{data.total_records.toLocaleString()} records transformed</div>
        </div>
      </div>

      <div className="ws-card__body">
        {/* Stats chips */}
        <div className="ws-stats-row">
          <div className="ws-stat-chip">
            <div className="ws-stat-chip__value">{data.total_records.toLocaleString()}</div>
            <div className="ws-stat-chip__label">Transformed</div>
          </div>
          <div className="ws-stat-chip">
            <div className="ws-stat-chip__value">{data.transformation_types?.length ?? 0}</div>
            <div className="ws-stat-chip__label">Techniques</div>
          </div>
          <div className="ws-stat-chip">
            <div className="ws-stat-chip__value" style={{ color: confColor }}>{confPct}%</div>
            <div className="ws-stat-chip__label">Confidence</div>
          </div>
          <div className="ws-stat-chip">
            <div className="ws-stat-chip__value">{data.laws_applied?.length ?? 0}</div>
            <div className="ws-stat-chip__label">Laws Applied</div>
          </div>
        </div>

        {/* Transformation types bar chart */}
        {data.transformation_types && data.transformation_types.length > 0 && (
          <div className="ws-chart-area">
            <p className="ws-chart-title">Transformation Techniques Applied</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.transformation_types} barCategoryGap="30%">
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--c-text-3)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fill: 'var(--c-text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 8, fontSize: '0.8rem' }}
                  cursor={{ fill: 'var(--c-accent-dim)' }}
                  formatter={(val: any) => [`${val} records`]}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={700}>
                  {data.transformation_types.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* PII types mini pie */}
        {data.pii_types && data.pii_types.length > 0 && (
          <div className="ws-chart-area">
            <p className="ws-chart-title">Affected PII Categories</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 140px' }}>
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie data={data.pii_types} dataKey="value" cx="50%" cy="50%" outerRadius={60} paddingAngle={2} animationDuration={700}>
                      {data.pii_types.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 8, fontSize: '0.78rem' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {data.pii_types.map((item, i) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                    <span style={{ color: 'var(--c-text-2)', flex: 1 }}>{item.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--c-text)', fontVariantNumeric: 'tabular-nums' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <p className="ws-summary" style={{ marginBottom: 12 }}>{summary}</p>

        {/* Law tags */}
        {data.laws_applied && data.laws_applied.length > 0 && (
          <div className="ws-tags">
            {data.laws_applied.map(law => (
              <span key={law} className="ws-tag" style={{ borderColor: '#818cf8', color: '#818cf8', background: 'rgba(99,102,241,0.08)' }}>
                {law}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
