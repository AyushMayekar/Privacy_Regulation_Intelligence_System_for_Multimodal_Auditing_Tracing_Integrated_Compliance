import { useEffect, useRef } from 'react'

interface Step {
  num: string
  heading: string
  body: string
  pills: string[]
  reversed?: boolean
  visual: React.ReactNode
}

const ScanVisual = () => (
  <div style={{ width: '100%', padding: '8px 0' }}>
    {/* Animated scan bars */}
    {['user_data.json', 'payments_db', 'logs/access.log', 'customer_pii', 'api_responses'].map((name, i) => (
      <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: i < 3 ? 'rgba(64,138,113,0.15)' : 'rgba(176,228,204,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={i < 3 ? '#408a71' : 'rgba(176,228,204,0.35)'} strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--c-text)', marginBottom: 4 }}>{name}</div>
          <div style={{ height: 4, background: 'var(--c-border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: i < 3 ? '100%' : i === 3 ? '60%' : '25%',
              background: 'linear-gradient(90deg, #408a71, #b0e4cc)',
              borderRadius: 2,
              transition: 'width 1s ease',
            }} />
          </div>
        </div>
        <div style={{ fontSize: '0.7rem', color: i < 3 ? '#10b981' : 'var(--c-text-3)', fontWeight: 600 }}>
          {i < 3 ? '✓ Done' : i === 3 ? 'Scanning…' : 'Queued'}
        </div>
      </div>
    ))}
  </div>
)

const ComplianceVisual = () => (
  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
    {[
      { label: 'GDPR', score: 94, color: '#10b981' },
      { label: 'HIPAA', score: 87, color: '#f59e0b' },
      { label: 'CCPA', score: 98, color: '#10b981' },
      { label: 'SOC2', score: 73, color: '#ef4444' },
    ].map(({ label, score, color }) => (
      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 52, fontSize: '0.8rem', fontWeight: 700, color: 'var(--c-text)' }}>{label}</div>
        <div style={{ flex: 1, height: 8, background: 'var(--c-border)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 4 }} />
        </div>
        <div style={{ width: 36, fontSize: '0.8rem', fontWeight: 700, color, textAlign: 'right' }}>{score}%</div>
      </div>
    ))}
    <div style={{ marginTop: 8, padding: '12px 16px', background: 'rgba(16,185,129,0.08)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.2)' }}>
      <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>✓ 3 frameworks passing · 1 needs attention</div>
    </div>
  </div>
)

const PipelineVisual = () => {
  const steps = [
    { icon: '🔍', label: 'Ingest', desc: 'Collect from all sources' },
    { icon: '⚡', label: 'Analyze', desc: 'AI-powered processing' },
    { icon: '🛡️', label: 'Audit', desc: 'Policy enforcement' },
    { icon: '📋', label: 'Report', desc: 'Immutable logs' },
  ]
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
        {steps.map((s, i) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'var(--c-accent-dim)', border: '1.5px solid var(--c-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem',
              }}>{s.icon}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--c-text)', textAlign: 'center' }}>{s.label}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--c-text-3)', textAlign: 'center' }}>{s.desc}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 20, height: 2,
                background: 'linear-gradient(90deg, var(--c-accent), transparent)',
                flex: '0 0 auto', margin: '0 2px',
              }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ padding: '10px 14px', background: 'var(--c-accent-dim)', borderRadius: 8, border: '1px solid var(--c-border)' }}>
        <code style={{ fontSize: '0.75rem', color: 'var(--c-accent)' }}>
          agent.run(pipeline="gdpr-audit", scope="all_sources")
        </code>
      </div>
    </div>
  )
}

const steps: Step[] = [
  {
    num: '01 — What it does',
    heading: 'Comprehensive Data Discovery & Scanning',
    body: 'Prismatic automatically discovers and scans your entire data landscape — databases, APIs, file systems, and cloud services. Our AI identifies personal data, classifies sensitivity levels, and maps data flows in real time.',
    pills: ['Database Scanning', 'API Discovery', 'PII Detection', 'Cloud Integration'],
    visual: <ScanVisual />,
  },
  {
    num: '02 — Why it matters',
    heading: 'Stay Ahead of Compliance Risk',
    body: 'Regulatory violations cost enterprises millions. Prismatic gives you a live compliance scorecard across GDPR, HIPAA, CCPA, and more — identifying gaps before auditors do, with actionable remediation steps.',
    pills: ['GDPR', 'HIPAA', 'CCPA', 'SOC 2', 'ISO 27701'],
    reversed: true,
    visual: <ComplianceVisual />,
  },
  {
    num: '03 — How it works',
    heading: 'Agentic AI Pipeline, End to End',
    body: 'Powered by autonomous AI agents, Prismatic ingests, analyzes, and enforces policies continuously. Every action is logged to an immutable audit trail — giving you proof of compliance at any moment.',
    pills: ['Autonomous Agents', 'Real-Time Processing', 'Immutable Logs', 'One-Click Reports'],
    visual: <PipelineVisual />,
  },
]

export default function ScrollSection() {
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    refs.current.forEach((el) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) el.classList.add('visible') },
        { threshold: 0.2 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return (
    <section className="pris-scroll" id="how-it-works">
      <div className="pris-scroll__inner">
        <div className="pris-scroll__header">
          <div className="pris-label">How It Works</div>
          <h2 className="pris-scroll__title">Intelligence built for<br />modern privacy challenges</h2>
          <p className="pris-scroll__sub">
            From discovery to audit, Prismatic handles the full compliance lifecycle
            so your team can focus on what matters.
          </p>
        </div>

        <div className="pris-scroll__steps">
          {steps.map((step, i) => (
            <div
              key={step.num}
              ref={(el) => { refs.current[i] = el }}
              className={`pris-scroll__step${step.reversed ? ' reversed' : ''}`}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="pris-scroll__step-text">
                <div className="pris-scroll__step-num">{step.num}</div>
                <h3 className="pris-scroll__step-h">{step.heading}</h3>
                <p className="pris-scroll__step-p">{step.body}</p>
                <div className="pris-scroll__step-pills">
                  {step.pills.map((p) => (
                    <span key={p} className="pris-scroll__pill">{p}</span>
                  ))}
                </div>
              </div>
              <div className="pris-scroll__visual">{step.visual}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
