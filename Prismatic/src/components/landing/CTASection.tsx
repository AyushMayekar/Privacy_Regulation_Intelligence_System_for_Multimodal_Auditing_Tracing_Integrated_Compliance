import { useNavigate } from 'react-router-dom'

export default function CTASection() {
  const navigate = useNavigate()

  return (
    <section className="pris-cta" id="cta">
      <div className="pris-cta__inner">
        <div className="pris-label" style={{ marginBottom: 24 }}>Get Started</div>
        <h2 className="pris-cta__title">
          Start working with<br />
          <span>Prismatic</span>
        </h2>
        <p className="pris-cta__sub">
          Join organisations already running their privacy compliance with AI.
          Free to start. No credit card required.
        </p>
        <div className="pris-cta__actions">
          <button
            id="cta-try-now"
            className="pris-btn pris-btn--primary pris-btn--large"
            onClick={() => navigate('/login')}
          >
            Try Now — It&apos;s Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
          <button
            className="pris-btn pris-btn--ghost pris-btn--large"
            onClick={() => navigate('/login')}
          >
            Request a Demo
          </button>
        </div>
      </div>
    </section>
  )
}
