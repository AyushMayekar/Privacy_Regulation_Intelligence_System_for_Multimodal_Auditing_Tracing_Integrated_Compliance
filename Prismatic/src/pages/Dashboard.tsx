import { useEffect, useRef, useState } from 'react'
import { logout, getActiveSession } from '../services/DummyDatabase.jsx'
import ScanHistory from '../features/scan-history/ScanHistory'
import DsarRequests from '../features/dsar/DsarRequests'
import Logs from '../features/logs_trail/Logs'
import Settings from '../features/settings/Settings'
import Policies from '../features/policies/Policies'

function TopNav() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top" style={{ zIndex: 1000 }}>
      <div className="container-fluid px-3">
        <span className="navbar-brand fw-bold" style={{ color: '#0b1b2b', letterSpacing: 1 }}>PRISMATIC</span>
        <div className="ms-auto d-flex align-items-center gap-3">
          <div className="dropdown">
            <button className="btn btn-outline-light notif-toggle text-dark position-relative dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
              <i className="bi bi-bell" style={{ fontSize: 18 }}></i>
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-warning border border-light rounded-circle"></span>
            </button>
            <div className="dropdown-menu dropdown-menu-end p-0" style={{ width: 360, maxHeight: 360, overflowY: 'auto' }}>
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex align-items-start gap-2">
                  <span className="text-accent">⚠️</span>
                  <div>
                    <div className="small">New DSAR request pending</div>
                    <div className="text-muted small">2 mins ago</div>
                  </div>
                </div>
                <div className="list-group-item d-flex align-items-start gap-2">
                  <span className="text-success">✅</span>
                  <div>
                    <div className="small">Scan completed successfully</div>
                    <div className="text-muted small">10 mins ago</div>
                  </div>
                </div>
                <div className="list-group-item d-flex align-items-start gap-2">
                  <span className="text-accent">⚠️</span>
                  <div>
                    <div className="small">S3 integration requires re-auth</div>
                    <div className="text-muted small">1 hr ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="dropdown">
            <button className="btn btn-outline-dark dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
              {getActiveSession()?.user?.name || 'Admin'}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><a className="dropdown-item" href="#">Profile</a></li>
              <li><a className="dropdown-item" href="#">Settings</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item" onClick={() => logout()}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}

function Sidebar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const items = [
    { key: 'home', label: 'Home', icon: 'house' },
    { key: 'integrations', label: 'Integrations', icon: 'plug' },
    { key: 'scans', label: 'Scan History', icon: 'clock-history' },
    { key: 'dsar', label: 'DSAR Requests', icon: 'inbox' },
    { key: 'policies', label: 'Policies', icon: 'sliders' },
    { key: 'logs', label: 'Logs', icon: 'journal-text' },
    { key: 'settings', label: 'Settings', icon: 'gear' },
  ]
  return (
    <div className="d-flex flex-column p-3" style={{ width: 260, background: '#f7f8fa', minHeight: '100vh' }}>
      {items.map(item => (
        <button
          key={item.key}
          className={`btn text-start d-flex align-items-center gap-2 mb-2 ${active === item.key ? 'btn-dark' : 'btn-outline-dark'}`}
          onClick={() => setActive(item.key)}
        >
          <i className={`bi bi-${item.icon}`}></i>
          {item.label}
        </button>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [active, setActive] = useState('home')
  const [integrations, setIntegrations] = useState([
    { id: 'google_drive', name: 'Google Drive', connected: false },
    { id: 'slack', name: 'Slack', connected: false },
    { id: 'salesforce', name: 'Salesforce', connected: false },
    { id: 'aws_s3', name: 'AWS S3', connected: false },
  ])
  const [connecting, setConnecting] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')
  const modalRef = useRef<HTMLDivElement | null>(null)
  const [scanRunning, setScanRunning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)

  useEffect(() => {
    let timer: any
    if (scanRunning) {
      timer = setInterval(() => {
        setScanProgress(prev => {
          const next = Math.min(prev + Math.ceil(Math.random() * 14), 100)
          if (next >= 100) {
            clearInterval(timer)
            setTimeout(() => {
              setScanRunning(false)
              setScanProgress(0)
            }, 800)
          }
          return next
        })
      }, 600)
    }
    return () => timer && clearInterval(timer)
  }, [scanRunning])

  function openConnectModal(id: string) {
    setConnecting(id)
    setApiKey('')
    // show modal via Bootstrap API
    const modalEl = modalRef.current
    if (!modalEl) return
    // @ts-ignore
    const modal = new window.bootstrap.Modal(modalEl)
    modal.show()
  }

  function closeModal() {
    const modalEl = modalRef.current
    if (!modalEl) return
    // @ts-ignore
    const modal = window.bootstrap.Modal.getInstance(modalEl)
    modal?.hide()
  }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    if (!apiKey || apiKey.length < 6) return
    await new Promise(r => setTimeout(r, 600))
    setIntegrations(prev => prev.map(i => i.id === connecting ? { ...i, connected: true } : i))
    closeModal()
  }

  return (
    <div className="bg-white min-vh-100">
      <TopNav />
      <div className="d-flex">
        <Sidebar active={active} setActive={setActive} />
        <main className="flex-grow-1 p-4">
          {active === 'home' && <h4 className="mb-4">Welcome, Admin</h4>}
          {active === 'home' && (
            <div className="row g-3">
            <div className="col-12 col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-muted small">Scan Status</div>
                      <div className="h5 mb-0">Healthy</div>
                    </div>
                    <i className="bi bi-shield-check" style={{ fontSize: 28 }}></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-muted small">Integrations</div>
                      <div className="h5 mb-0">{integrations.filter(i => i.connected).length} Connected</div>
                    </div>
                    <i className="bi bi-plug" style={{ fontSize: 28 }}></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-muted small">DSAR Pending</div>
                      <div className="h5 mb-0">3</div>
                    </div>
                    <i className="bi bi-inbox" style={{ fontSize: 28 }}></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-muted small">Logs (24h)</div>
                      <div className="h5 mb-0">1,284</div>
                    </div>
                    <i className="bi bi-journal-text" style={{ fontSize: 28 }}></i>
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}

          {active === 'integrations' && (
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="mb-0">Integrations</h5>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {integrations.map(integration => (
                        <tr key={integration.id} className="">
                          <td className="fw-medium">{integration.name}</td>
                          <td>
                            {integration.connected ? (
                              <span className="d-inline-flex align-items-center gap-2">
                                <span className="rounded-circle" style={{ width: 10, height: 10, background: '#28a745', display: 'inline-block' }} />
                                <span>Connected</span>
                              </span>
                            ) : (
                              <span className="d-inline-flex align-items-center gap-2">
                                <span className="rounded-circle" style={{ width: 10, height: 10, background: '#dc3545', display: 'inline-block' }} />
                                <span>Not Connected</span>
                              </span>
                            )}
                          </td>
                          <td className="text-end">
                            {integration.connected ? (
                              <button className="btn btn-outline-dark btn-sm" disabled>
                                <i className="bi bi-check2-circle me-1"></i> Connected
                              </button>
                            ) : (
                              <button className="btn btn-dark btn-sm" onClick={() => openConnectModal(integration.id)}>
                                Connect
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {active === 'scans' && (
            <ScanHistory />
          )}

          {active === 'dsar' && (
            <DsarRequests />
          )}

          {active === 'policies' && (
            <Policies />
          )}

          {active === 'logs' && (
            <Logs />
          )}

          {active === 'settings' && (
            <Settings />
          )}

          {active === 'home' && (
            <div className="mt-4">
              <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
                <div className="card-body text-center p-5">
                  <h5 className="mb-3">Start Monitoring</h5>
                  <p className="text-muted mb-4">Agents will scan in the background automatically</p>
                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <button className="btn btn-dark px-4" disabled={integrations.every(i => !i.connected) || scanRunning} onClick={() => setScanRunning(true)}>
                      {scanRunning ? 'Monitoring…' : 'Start Monitoring'}
                    </button>
                  </div>
                  {scanRunning && (
                    <div className="mt-4" style={{ maxWidth: 480, margin: '0 auto' }}>
                      <div className="progress" role="progressbar" aria-label="Monitoring Progress" aria-valuenow={scanProgress} aria-valuemin={0} aria-valuemax={100}>
                        <div className="progress-bar" style={{ width: `${scanProgress}%` }}></div>
                      </div>
                      <div className="small text-muted mt-2">{scanProgress}%</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Connect Integration Modal */}
      <div className="modal fade" tabIndex={-1} ref={modalRef} aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Connect Integration</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
            </div>
            <form onSubmit={handleConnect} className="needs-validation" noValidate>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="apiKey" className="form-label">API Key</label>
                  <input id="apiKey" className="form-control" value={apiKey} onChange={e => setApiKey(e.target.value)} required minLength={6} />
                  <div className="form-text">Paste your provider API Key. Minimum 6 characters.</div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-dark" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-dark" disabled={!apiKey || apiKey.length < 6}>Connect</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}


