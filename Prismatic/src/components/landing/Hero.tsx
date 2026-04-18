import { useNavigate } from 'react-router-dom'

export default function Hero() {
  const navigate = useNavigate()

  const scrollToFeatures = () => {
    const el = document.getElementById('features')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="pris-hero" id="home">
      <div className="pris-hero__bg" aria-hidden="true" />

      <div className="pris-hero__inner">
        {/* ── Left: text ── */}
        <div className="pris-hero__text">
          <div className="pris-hero__badge">
            <span className="pris-hero__badge-dot" />
            AI-Powered Privacy Compliance
          </div>

          <h1 className="pris-hero__headline">
            See Every Risk.<br />
            <span>Prove Every</span><br />
            Decision.
          </h1>

          <p className="pris-hero__sub">
            Prismatic is an intelligent compliance platform that
            automatically scans, audits, and traces privacy regulations
            across your entire data ecosystem — powered by AI agents.
          </p>

          <div className="pris-hero__ctas">
            <button
              id="hero-get-started"
              className="pris-btn pris-btn--primary pris-btn--large"
              onClick={() => navigate('/login')}
            >
              Get Started Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <button
              id="hero-learn-more"
              className="pris-btn pris-btn--ghost pris-btn--large"
              onClick={scrollToFeatures}
            >
              Learn More
            </button>
          </div>

          <div className="pris-hero__stats">
            <div>
              <div className="pris-hero__stat-num">2.4M+</div>
              <div className="pris-hero__stat-label">Records Scanned</div>
            </div>
            <div className="pris-hero__stat-divider" />
            <div>
              <div className="pris-hero__stat-num">99.1%</div>
              <div className="pris-hero__stat-label">Audit Accuracy</div>
            </div>
            <div className="pris-hero__stat-divider" />
            <div>
              <div className="pris-hero__stat-num">12+</div>
              <div className="pris-hero__stat-label">Regulations Covered</div>
            </div>
          </div>
        </div>

        {/* ── Right: abstract shapes ── */}
        <div className="pris-hero__shapes" aria-hidden="true">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
          <div className="shape shape-4" />
          <div className="shape shape-5" />
          <div className="shape shape-6" />
          <div className="shape shape-7" />
          <div className="shape shape-8" />
          <div className="shape shape-9" />
        </div>
      </div>
    </section>
  )
}
