// Feature: Scan History
// Purpose: Display historical scans with search, filters and pagination for dev/demo.
// Notes: Pure frontend state; replace with API integration later.

import { useMemo, useState } from 'react'

type ScanRow = {
  id: string
  date: string // ISO date
  source: string
  findings: number
  actions: string
}

const SOURCES = ['Google Drive', 'Slack', 'Salesforce', 'AWS S3']

function generateData(): ScanRow[] {
  const out: ScanRow[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push({
      id: `scan_${i}`,
      date: d.toISOString(),
      source: SOURCES[i % SOURCES.length],
      findings: Math.floor(Math.random() * 20),
      actions: Math.random() > 0.5 ? 'Auto-remediation' : 'Reviewed',
    })
  }
  return out
}

export default function ScanHistory() {
  const [query, setQuery] = useState('')
  const [source, setSource] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const data = useMemo(generateData, [])

  const filtered = useMemo(() => {
    return data.filter(row => {
      const matchesQuery = query ? (row.actions.toLowerCase().includes(query.toLowerCase()) || String(row.findings).includes(query)) : true
      const matchesSource = source ? row.source === source : true
      const t = new Date(row.date).getTime()
      const fromOk = dateFrom ? t >= new Date(dateFrom).getTime() : true
      const toOk = dateTo ? t <= new Date(dateTo).getTime() : true
      return matchesQuery && matchesSource && fromOk && toOk
    })
  }, [data, query, source, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  function go(p: number) {
    const next = Math.min(Math.max(1, p), totalPages)
    setPage(next)
  }

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
          <div className="me-auto">
            <h5 className="mb-0">Scan History</h5>
          </div>
          <div className="">
            <label className="form-label small mb-1">Search</label>
            <input className="form-control" placeholder="Findings/Actions" value={query} onChange={e => { setPage(1); setQuery(e.target.value) }} />
          </div>
          <div>
            <label className="form-label small mb-1">Source</label>
            <select className="form-select" value={source} onChange={e => { setPage(1); setSource(e.target.value) }}>
              <option value="">All</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
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

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Findings</th>
                <th>Actions Taken</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(row => (
                <tr key={row.id}>
                  <td>{new Date(row.date).toLocaleString()}</td>
                  <td>{row.source}</td>
                  <td>{row.findings}</td>
                  <td>{row.actions}</td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted">No results</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <nav className="d-flex justify-content-center">
          <ul className="pagination mb-0">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => go(page - 1)}>Previous</button>
            </li>
            {Array.from({ length: totalPages }).map((_, i) => (
              <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => go(i + 1)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => go(page + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}


