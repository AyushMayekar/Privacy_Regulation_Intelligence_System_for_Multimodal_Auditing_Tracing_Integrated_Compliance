import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../theme/ThemeContext'

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    setDrawerOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <nav className={`pris-nav${scrolled ? ' pris-nav--scrolled' : ''}`}>
        <div className="pris-nav__inner">
          <Link to="/" className="pris-nav__logo" onClick={() => setDrawerOpen(false)}>
            <img
              src="https://res.cloudinary.com/dpuqctqfl/image/upload/v1776519708/Prismatic_Logo_qzrypl.png"
              alt="Prismatic"
            />
          </Link>

          <div className="pris-nav__links">
            <Link to="/" className="pris-nav__link">Home</Link>
            <button className="pris-nav__link" onClick={() => scrollTo('features')}>Features</button>
            <button className="pris-nav__link" onClick={() => scrollTo('developers')}>Developers</button>
          </div>

          <div className="pris-nav__actions">
            <button
              id="theme-toggle"
              className="pris-nav__theme"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <button className="pris-btn pris-btn--ghost" onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button className="pris-btn pris-btn--primary" onClick={() => navigate('/login')}>
              Sign Up
            </button>
            <button
              className="pris-nav__hamburger"
              onClick={() => setDrawerOpen((p) => !p)}
              aria-label="Menu"
            >
              <span style={drawerOpen ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}} />
              <span style={drawerOpen ? { opacity: 0 } : {}} />
              <span style={drawerOpen ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {}} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`pris-nav__drawer${drawerOpen ? ' open' : ''}`}>
        <Link to="/" className="pris-nav__link" onClick={() => setDrawerOpen(false)}>Home</Link>
        <button className="pris-nav__link" onClick={() => scrollTo('features')}>Features</button>
        <button className="pris-nav__link" onClick={() => scrollTo('developers')}>Developers</button>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="pris-btn pris-btn--ghost" style={{ justifyContent: 'center' }} onClick={() => { setDrawerOpen(false); navigate('/login') }}>Sign In</button>
          <button className="pris-btn pris-btn--primary" style={{ justifyContent: 'center' }} onClick={() => { setDrawerOpen(false); navigate('/login') }}>Sign Up</button>
        </div>
      </div>
    </>
  )
}
