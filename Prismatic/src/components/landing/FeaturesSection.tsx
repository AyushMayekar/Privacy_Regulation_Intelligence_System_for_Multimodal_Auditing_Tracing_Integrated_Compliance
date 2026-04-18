import { useEffect, useRef } from 'react'

const features = [
  {
    title: 'Intelligent Data Scanning',
    desc: 'Automatically crawl databases, APIs, file systems, and cloud storage to identify and classify sensitive PII with ML-powered accuracy.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    title: 'Data Transformation',
    desc: 'Anonymize, pseudonymize, and mask personal data at scale with policy-driven transformation pipelines that maintain referential integrity.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
    ),
  },
  {
    title: 'Real-Time Compliance Monitoring',
    desc: 'Live dashboards track your compliance posture across GDPR, HIPAA, CCPA, SOC 2, and custom internal policies, 24/7.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    title: 'Immutable Audit Logs',
    desc: 'Every action, access, and policy decision is written to a tamperproof, timestamped audit trail — ready for regulators on demand.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    title: 'Agentic Automation',
    desc: 'Deploy autonomous AI agents that handle end-to-end compliance workflows — from discovery to remediation — without human intervention.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/>
      </svg>
    ),
  },
  {
    title: 'Smart Violation Alerts',
    desc: 'Context-aware alerts surface only critical risks, reducing noise and letting your team act fast on what actually matters.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
]

export default function FeaturesSection() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    cardRefs.current.forEach((el, i) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => el.classList.add('visible'), i * 80)
          }
        },
        { threshold: 0.15 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return (
    <section className="pris-features" id="features">
      <div className="pris-features__inner">
        <div className="pris-features__header">
          <div className="pris-label">Features</div>
          <h2 className="pris-features__title">
            Everything compliance<br />teams need
          </h2>
          <p className="pris-features__sub">
            Purpose-built tools for every stage of the privacy and
            compliance lifecycle.
          </p>
        </div>

        <div className="pris-features__grid">
          {features.map((f, i) => (
            <div
              key={f.title}
              ref={(el) => { cardRefs.current[i] = el }}
              className="pris-feature-card"
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              <div className="pris-feature-card__icon">{f.icon}</div>
              <h3 className="pris-feature-card__title">{f.title}</h3>
              <p className="pris-feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
