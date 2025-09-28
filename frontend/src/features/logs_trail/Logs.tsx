// Feature: Logs / Audit Trail
// Purpose: Show audit trail with filters and export (CSV/PDF placeholders) for dev/demo.
// Notes: Replace in-memory data + exports with real API/doc generation later.

import { useMemo, useState } from 'react'
import { exportLogsPdf } from '../../utils/pdf'

type LogRow = {
  id: string
  date: string
  action: string
  system: string
  user: string
  result: 'Success' | 'Warning' | 'Error'
}

const ACTIONS = ['Scan Started', 'Scan Completed', 'Integration Connected', 'DSAR Request Completed']
const SYSTEMS = ['Web', 'Worker', 'API']

function seed(): LogRow[] {
  const now = new Date()
  return Array.from({ length: 55 }).map((_, i) => ({
    id: `log_${i}`,
    date: new Date(now.getTime() - i * 36e5).toISOString(),
    action: ACTIONS[i % ACTIONS.length],
    system: SYSTEMS[i % SYSTEMS.length],
    user: i % 4 === 0 ? 'admin@prismatic.io' : 'tester@prismatic.io',
    result: i % 7 === 0 ? 'Warning' : i % 11 === 0 ? 'Error' : 'Success',
  }))
}

function download(text: string, filename: string, type: string) {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function Logs() {
  const [action, setAction] = useState('')
  const [system, setSystem] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const data = useMemo(seed, [])

  const filtered = useMemo(() => {
    return data.filter(row => {
      const a = action ? row.action === action : true
      const s = system ? row.system === system : true
      const t = new Date(row.date).getTime()
      const f = dateFrom ? t >= new Date(dateFrom).getTime() : true
      const to = dateTo ? t <= new Date(dateTo).getTime() : true
      return a && s && f && to
    })
  }, [data, action, system, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  function exportCSV() {
    const header = ['Date', 'Action', 'System', 'User', 'Result']
    const lines = [header.join(',')].concat(
      filtered.map(r => [new Date(r.date).toLocaleString(), r.action, r.system, r.user, r.result].join(','))
    )
    download(lines.join('\n'), 'logs.csv', 'text/csv')
  }

  function exportPDF() {
    const rows = filtered.map(r => [new Date(r.date).toLocaleString(), r.action, r.system, r.user, r.result] as [string,string,string,string,string])
    exportLogsPdf(rows)
  }

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
          <h5 className="mb-0 me-auto">Audit Trail</h5>
          <div>
            <label className="form-label small mb-1">Action</label>
            <select className="form-select" value={action} onChange={e => { setPage(1); setAction(e.target.value) }}>
              <option value="">All</option>
              {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label small mb-1">System</label>
            <select className="form-select" value={system} onChange={e => { setPage(1); setSystem(e.target.value) }}>
              <option value="">All</option>
              {SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label small mb-1">From</label>
            <input type="date" className="form-control" value={dateFrom} onChange={e => { setPage(1); setDateFrom(e.target.value) }} />
          </div>
          <div>
            <label className="form-label small mb-1">To</label>
            <input type="date" className="form-control" value={dateTo} onChange={e => { setPage(1); setDateTo(e.target.value) }} />
          </div>
        </div>

        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-outline-dark" onClick={exportCSV}><i className="bi bi-filetype-csv me-1"></i> Export CSV</button>
          <button className="btn btn-dark" onClick={exportPDF}><i className="bi bi-filetype-pdf me-1"></i> Export PDF</button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>System</th>
                <th>User</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(row => (
                <tr key={row.id}>
                  <td>{new Date(row.date).toLocaleString()}</td>
                  <td>{row.action}</td>
                  <td>{row.system}</td>
                  <td>{row.user}</td>
                  <td>
                    {row.result === 'Success' ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle">✅ Success</span>
                    ) : row.result === 'Warning' ? (
                      <span className="badge badge-gold">⚠️ Warning</span>
                    ) : (
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle">Error</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <nav className="d-flex justify-content-center">
          <ul className="pagination mb-0">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(Math.max(1, page - 1))}>Previous</button>
            </li>
            {Array.from({ length: totalPages }).map((_, i) => (
              <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(Math.min(totalPages, page + 1))}>Next</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}


