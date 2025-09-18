import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginWithEmailPassword, loginWithGoogle } from '../services/DummyDatabase.jsx'

export default function Landing() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ org: '', name: '', email: '', password: '', terms: false })
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      if (mode === 'signup' && !form.terms) {
        setMessage('Please accept Terms to continue.')
        setLoading(false)
        return
      }
      // Using dummy DB to login for both modes for now
      await loginWithEmailPassword(form.email, form.password)
      setMessage('Success! Redirecting...')
      setTimeout(() => navigate('/dashboard'), 400)
    } catch (err: any) {
      setMessage(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function googleLoginAction() {
    try {
      setLoading(true)
      await loginWithGoogle()
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="text-center mb-4">
          <div className="fw-bold" style={{ fontSize: 28, color: '#0b1b2b', letterSpacing: 1 }}>
            PRISMATIC
          </div>
          <div className="text-muted">Enterprise Privacy & Compliance</div>
        </div>

        <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
          <div className="card-body p-4 p-md-5">
            <div className="d-flex justify-content-center gap-2 mb-4">
              <button className={`btn ${mode === 'signup' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setMode('signup')}>
                Sign Up
              </button>
              <button className={`btn ${mode === 'login' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setMode('login')}>
                Login
              </button>
            </div>

            {message && <div className="alert alert-info" role="alert">{message}</div>}

            <form onSubmit={submit} className="needs-validation" noValidate>
              {mode === 'signup' && (
                <div className="mb-3">
                  <label htmlFor="org" className="form-label">Organization Name</label>
                  <input id="org" name="org" className="form-control" required value={form.org} onChange={handleChange} />
                </div>
              )}
              {mode === 'signup' && (
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Admin Name</label>
                  <input id="name" name="name" className="form-control" required value={form.name} onChange={handleChange} />
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input id="email" name="email" type="email" className="form-control" required value={form.email} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input id="password" name="password" type="password" className="form-control" required value={form.password} onChange={handleChange} />
              </div>
              {mode === 'signup' && (
                <div className="form-check mb-3">
                  <input className="form-check-input" type="checkbox" id="terms" name="terms" checked={form.terms} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="terms">
                    I agree to the Terms and Privacy Policy
                  </label>
                </div>
              )}

              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-dark" disabled={loading}>
                  {loading ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Login'}
                </button>
                <button type="button" className="btn btn-outline-dark d-flex align-items-center justify-content-center gap-2" onClick={googleLoginAction} disabled={loading}>
                  <i className="bi bi-google"></i>
                  Continue with Google
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center small text-muted mt-3">
          © {new Date().getFullYear()} Prismatic — All rights reserved
        </div>
      </div>
    </div>
  )
}


