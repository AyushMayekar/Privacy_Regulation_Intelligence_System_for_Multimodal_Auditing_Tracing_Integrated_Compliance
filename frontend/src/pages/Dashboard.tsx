import { useEffect, useRef, useState } from 'react'
import { logout, getActiveSession } from '../services/DummyDatabase.jsx'
import ScanHistory from '../features/scan-history/ScanHistory'
import DsarRequests from '../features/dsar/DsarRequests'
import Logs from '../features/logs_trail/Logs'
import Settings from '../features/settings/Settings'
import Policies from '../features/policies/Policies'
import Findings from '../features/findings/Findings'
import ChatPanel from '../components/ChatPanel.jsx'
import Integrations from './Integrations.jsx'
// @ts-ignore
import { mockApi } from '../api/mockApi.js'

function TopNav() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{ zIndex: 1000 }}>
      <div className="container-fluid px-3">
        <span className="navbar-brand fw-bold glow-effect" style={{ letterSpacing: 1 }}>PRISMATIC</span>
        <div className="ms-auto d-flex align-items-center gap-3">
          <div className="dropdown">
            <button className="btn btn-outline-dark notif-toggle position-relative dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
              <i className="bi bi-bell" style={{ fontSize: 18 }}></i>
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-warning border border-dark rounded-circle pulse-effect"></span>
            </button>
            <div className="dropdown-menu dropdown-menu-end p-0" style={{ width: 360, maxHeight: 360, overflowY: 'auto' }}>
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex align-items-start gap-2">
                  <span style={{ color: 'var(--accent-orange)' }}>⚠️</span>
                  <div>
                    <div className="small">New DSAR request pending</div>
                    <div className="text-muted small">2 mins ago</div>
                  </div>
                </div>
                <div className="list-group-item d-flex align-items-start gap-2">
                  <span style={{ color: 'var(--accent-green)' }}>✅</span>
                  <div>
                    <div className="small">Scan completed successfully</div>
                    <div className="text-muted small">10 mins ago</div>
                  </div>
                </div>
                <div className="list-group-item d-flex align-items-start gap-2">
                  <span style={{ color: 'var(--accent-orange)' }}>⚠️</span>
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
     { key: 'findings', label: 'Findings', icon: 'shield-exclamation' },
    { key: 'integrations', label: 'Integrations', icon: 'plug' },
    { key: 'scans', label: 'Scan History', icon: 'clock-history' },
    { key: 'dsar', label: 'DSAR Requests', icon: 'inbox' },
    { key: 'policies', label: 'Policies', icon: 'sliders' },
    { key: 'logs', label: 'Logs', icon: 'journal-text' },
    { key: 'settings', label: 'Settings', icon: 'gear' },
  ]
  return (
    <div className="d-flex flex-column p-3 sidebar-dark" style={{ width: 260, minHeight: '100vh' }}>
      {items.map(item => (
        <button
          key={item.key}
          className={`btn text-start d-flex align-items-center gap-2 mb-2 ${active === item.key ? 'btn-dark glow-effect' : 'btn-outline-dark'}`}
          onClick={() => setActive(item.key)}
          style={{ 
            transition: 'all 0.3s ease',
            borderRadius: '8px'
          }}
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
  const [scanRunning, setScanRunning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [chatbotWidth, setChatbotWidth] = useState(50) // Percentage width
  const [isResizing, setIsResizing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992)
  
  // Dashboard statistics state
  const [dashboardStats, setDashboardStats] = useState({
    connectedIntegrations: 0,
    pendingDSARRequests: 0,
    totalLogs24h: 0,
    criticalFindings: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [hasScanned, setHasScanned] = useState(false) // Track if initial scan has been completed

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
              setHasScanned(true) // Mark that initial scan is complete
              loadDashboardStats() // Load real data after scan completes
            }, 800)
          }
          return next
        })
      }, 600)
    }
    return () => timer && clearInterval(timer)
  }, [scanRunning])

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load chatbot width from localStorage on component mount
  useEffect(() => {
    const savedWidth = localStorage.getItem('prismatic-chatbot-width')
    if (savedWidth) {
      const width = parseInt(savedWidth)
      if (width >= 20 && width <= 80) { // Reasonable bounds
        setChatbotWidth(width)
      }
    }
  }, [])

  // Save chatbot width to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('prismatic-chatbot-width', chatbotWidth.toString())
  }, [chatbotWidth])

  // Load dashboard statistics from mock API
  const loadDashboardStats = async () => {
    try {
      setIsLoadingStats(true)
      
      // If no scan has been completed yet, keep everything at 0 (healthy state)
      if (!hasScanned) {
        setDashboardStats({
          connectedIntegrations: 0,
          pendingDSARRequests: 0,
          totalLogs24h: 0,
          criticalFindings: 0
        })
        setIsLoadingStats(false)
        return
      }
      
      // Load all statistics in parallel
      const [
        dsarResponse,
        auditLogsResponse,
        findingsResponse,
        integrationsResponse
      ] = await Promise.all([
        mockApi.getDSARRequests(),
        mockApi.getAuditLogs(),
        mockApi.getAllFindings(),
        mockApi.getIntegratedSources()
      ])
      
      // Calculate statistics
      const dsarRequests = dsarResponse.data || []
      const auditLogs = auditLogsResponse.data || []
      const findings = findingsResponse.data || []
      const integrations = integrationsResponse.data || []
      
      // Count pending DSAR requests
      const pendingDSARRequests = dsarRequests.filter((request: any) => 
        request.status === 'pending' || request.status === 'in_progress'
      ).length
      
      // Count logs from last 24 hours
      const now = new Date()
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const logs24h = auditLogs.filter((log: any) => 
        new Date(log.timestamp) >= last24Hours
      ).length
      
      // Count critical findings
      const criticalFindings = findings.filter((finding: any) => 
        finding.severity === 'critical'
      ).length
      
      // Count connected integrations from localStorage
      const savedConnections = JSON.parse(localStorage.getItem('prismatic-integrations') || '{}')
      const connectedIntegrations = Object.values(savedConnections).filter((conn: any) => 
        conn.status === 'connected'
      ).length
      
      setDashboardStats({
        connectedIntegrations,
        pendingDSARRequests,
        totalLogs24h: logs24h,
        criticalFindings
      })
    } catch (error) {
      console.error('Error loading dashboard statistics:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Load dashboard statistics on component mount
  useEffect(() => {
    loadDashboardStats()
  }, [hasScanned])

  // Reload statistics when active page changes (to keep data fresh)
  useEffect(() => {
    if (active === 'home') {
      loadDashboardStats()
    }
  }, [active])

  // Handle navigation from chatbot
  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      const { page } = event.detail
      setActive(page)
    }

    // Handle data refresh events from other components
    const handleDataRefresh = () => {
      loadDashboardStats()
    }

    window.addEventListener('navigateToPage', handleNavigation as EventListener)
    window.addEventListener('refreshDashboardStats', handleDataRefresh as EventListener)
    
    return () => {
      window.removeEventListener('navigateToPage', handleNavigation as EventListener)
      window.removeEventListener('refreshDashboardStats', handleDataRefresh as EventListener)
    }
  }, [])

  // Handle resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setIsResizing(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    
    const startX = e.clientX
    const startWidth = chatbotWidth
    
    const handleMouseMove = (e: MouseEvent) => {
      const containerWidth = window.innerWidth - 260 // Subtract sidebar width
      const deltaX = e.clientX - startX
      const deltaPercentage = (deltaX / containerWidth) * 100
      
      let newWidth = startWidth - deltaPercentage // Subtract because we're dragging from left
      
      // Constrain width between 20% and 80%
      newWidth = Math.max(20, Math.min(80, newWidth))
      
      setChatbotWidth(newWidth)
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setIsResizing(true)
    document.body.style.userSelect = 'none'
    
    const startX = e.touches[0].clientX
    const startWidth = chatbotWidth
    
    const handleTouchMove = (e: TouchEvent) => {
      const containerWidth = window.innerWidth - 260
      const deltaX = e.touches[0].clientX - startX
      const deltaPercentage = (deltaX / containerWidth) * 100
      
      let newWidth = startWidth - deltaPercentage
      newWidth = Math.max(20, Math.min(80, newWidth))
      
      setChatbotWidth(newWidth)
    }
    
    const handleTouchEnd = () => {
      setIsDragging(false)
      setIsResizing(false)
      document.body.style.userSelect = ''
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
    
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
  }


  return (
    <div className="min-vh-100" style={{ background: 'var(--bg-primary)' }}>
      <TopNav />
      <div className="d-flex">
        <Sidebar active={active} setActive={setActive} />
        {/* Resizable Split Layout - Responsive */}
        <div className="flex-grow-1 d-flex flex-column flex-lg-row">
          {/* Left Panel - Dashboard Content */}
          <main 
            className="dashboard-panel p-4" 
            style={{ 
              minHeight: 'calc(100vh - 76px)',
              width: `${100 - chatbotWidth}%`,
              background: 'var(--bg-primary)'
            }}
          >
          {active === 'home' && <h4 className="mb-4">Welcome, Admin</h4>}
          {active === 'home' && (
            <div className="row g-3">
            <div className="col-12 col-md-6 col-xl-3">
               <div className="card border-0 shadow-sm glow-effect" style={{ borderRadius: 16 }}>
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-muted small">Scan Status</div>
                       <div className="h5 mb-0">
                         {hasScanned ? (
                           <span style={{ color: 'var(--accent-red)' }}>Warning</span>
                         ) : (
                           <span style={{ color: 'var(--accent-green)' }}>Healthy</span>
                         )}
                       </div>
                     </div>
                     <i 
                       className={`bi ${hasScanned ? 'bi-shield-exclamation' : 'bi-shield-check'}`} 
                       style={{ 
                         fontSize: 28, 
                         color: hasScanned ? 'var(--accent-red)' : 'var(--accent-green)',
                         filter: hasScanned ? 'drop-shadow(0 0 8px var(--accent-red))' : 'drop-shadow(0 0 8px var(--accent-green))'
                       }}
                     ></i>
                   </div>
                 </div>
               </div>
             </div>

             <div className="col-12 col-md-6 col-xl-3">
               <div 
                 className="card border-0 shadow-sm dashboard-card" 
                 style={{ borderRadius: 16 }}
                 onClick={() => setActive('findings')}
                 onKeyDown={(e) => e.key === 'Enter' && setActive('findings')}
                 tabIndex={0}
                 role="button"
                 aria-label="View Critical Findings"
                 title="Click to view Critical Findings"
               >
                 <div className="card-body">
                   <div className="d-flex align-items-center justify-content-between">
                     <div>
                       <div className="text-muted small">Critical Findings</div>
                       <div className="h5 mb-0">
                         {isLoadingStats ? (
                           <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                         ) : (
                           dashboardStats.criticalFindings
                         )}
                       </div>
                    </div>
                     <i className="bi bi-shield-exclamation" style={{ 
                       fontSize: 28, 
                       color: dashboardStats.criticalFindings > 0 ? 'var(--accent-red)' : 'var(--accent-green)',
                       filter: dashboardStats.criticalFindings > 0 ? 'drop-shadow(0 0 8px var(--accent-red))' : 'drop-shadow(0 0 8px var(--accent-green))'
                     }}></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-3">
              <div 
                className="card border-0 shadow-sm dashboard-card" 
                style={{ borderRadius: 16 }}
                onClick={() => setActive('integrations')}
                onKeyDown={(e) => e.key === 'Enter' && setActive('integrations')}
                tabIndex={0}
                role="button"
                aria-label="View Integrations"
                title="Click to view Integrations"
              >
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-muted small">Integrations</div>
                      <div className="h5 mb-0">
                        {isLoadingStats ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          `${dashboardStats.connectedIntegrations} Connected`
                        )}
                      </div>
                    </div>
                    <i className="bi bi-plug" style={{ fontSize: 28 }}></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-3">
              <div 
                className="card border-0 shadow-sm dashboard-card" 
                style={{ borderRadius: 16 }}
                onClick={() => setActive('dsar')}
                onKeyDown={(e) => e.key === 'Enter' && setActive('dsar')}
                tabIndex={0}
                role="button"
                aria-label="View DSAR Requests"
                title="Click to view DSAR Requests"
              >
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-muted small">DSAR Pending</div>
                      <div className="h5 mb-0">
                        {isLoadingStats ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          dashboardStats.pendingDSARRequests
                        )}
                      </div>
                    </div>
                    <i className="bi bi-inbox" style={{ fontSize: 28 }}></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-3">
              <div 
                className="card border-0 shadow-sm dashboard-card" 
                style={{ borderRadius: 16 }}
                onClick={() => setActive('logs')}
                onKeyDown={(e) => e.key === 'Enter' && setActive('logs')}
                tabIndex={0}
                role="button"
                aria-label="View Audit Logs"
                title="Click to view Audit Logs"
              >
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-muted small">Logs (24h)</div>
                      <div className="h5 mb-0">
                        {isLoadingStats ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          dashboardStats.totalLogs24h.toLocaleString()
                        )}
                      </div>
                    </div>
                    <i className="bi bi-journal-text" style={{ fontSize: 28 }}></i>
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}

           {active === 'findings' && (
             <Findings />
          )}

          {active === 'integrations' && (
             <Integrations />
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
                    <button className="btn btn-dark px-4" disabled={scanRunning} onClick={() => setScanRunning(true)}>
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
          
          {/* Resize Handle - Only visible on desktop */}
          <div 
            className={`resize-handle d-none d-lg-flex ${isDragging ? 'dragging' : ''}`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{ 
              cursor: 'col-resize'
            }}
            title="Drag to resize chatbot panel"
          />
          
           {/* Right Panel - Chatbot */}
           <div 
             className="chatbot-panel-container border-start border-lg-start" 
             style={{ 
               width: isDesktop ? `${chatbotWidth}%` : '100%',
               minHeight: '400px',
               maxHeight: 'calc(100vh - 76px)',
               background: 'var(--bg-primary)',
               borderColor: 'var(--bg-tertiary) !important'
             }}
           >
             <ChatPanel />
          </div>
        </div>
      </div>

    </div>
  )
}


