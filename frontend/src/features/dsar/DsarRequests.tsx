// Feature: DSAR Requests
// Purpose: Manage DSAR requests (view/process) for dev/demo with modal confirmation.
// Notes: Pure frontend state; replace with API integration later.

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getActiveSession } from '../../services/DummyDatabase.jsx'
import { exportDsarReportPdf } from '../../utils/pdf'

type DsarRow = {
  id: string
  date: string
  type: 'Delete' | 'Export'
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed'
}

function seed(): DsarRow[] {
  const now = new Date()
  return Array.from({ length: 12 }).map((_, i) => ({
    id: `dsar_${i}`,
    date: new Date(now.getTime() - i * 86400000).toISOString(),
    type: i % 2 === 0 ? 'Delete' : 'Export',
    status: i % 3 === 0 ? 'Completed' : 'Pending',
  }))
}

export default function DsarRequests() {
  const [rows, setRows] = useState<DsarRow[]>(seed())
  const [selected, setSelected] = useState<DsarRow | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const bsInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (modalRef.current && !bsInstanceRef.current) {
      // @ts-ignore
      bsInstanceRef.current = new window.bootstrap.Modal(modalRef.current, { backdrop: 'static', keyboard: false })
    }
  }, [])

  function open(row: DsarRow) {
    setSelected(row)
    setMessage(null)
    if (!bsInstanceRef.current && modalRef.current) {
      // @ts-ignore
      bsInstanceRef.current = new window.bootstrap.Modal(modalRef.current, { backdrop: 'static', keyboard: false })
    }
    bsInstanceRef.current?.show()
  }

  function close() {
    bsInstanceRef.current?.hide()
  }

  async function processRequest() {
    if (!selected) return
    // RBAC: only admin/processor can process
    const role = getActiveSession()?.user?.role
    if (role !== 'admin' && role !== 'processor') {
      setMessage('You do not have permission to process this request.')
      return
    }
    setRows(prev => prev.map(r => r.id === selected.id ? { ...r, status: 'Processing' } : r))
    setMessage('Processing…')
    // Longer delay to avoid modal rapid hide/show causing flicker
    await new Promise(r => setTimeout(r, 1000))
    const success = Math.random() > 0.1
    setRows(prev => prev.map(r => r.id === selected.id ? { ...r, status: success ? 'Completed' : 'Failed' } : r))
    setMessage(success ? 'Request completed successfully.' : 'Failed to complete request.')
    // Keep modal stable for a moment to avoid flicker
    setTimeout(() => { setMessage(null); close() }, 1200)
  }

  function viewReport(row: DsarRow) {
    const who = getActiveSession()?.user?.email || 'unknown'
    exportDsarReportPdf({ id: row.id, type: row.type, date: new Date(row.date).toLocaleString(), status: row.status, processedBy: who, items: Math.floor(Math.random() * 50) })
  }

  const counters = useMemo(() => {
    return {
      pending: rows.filter(r => r.status === 'Pending').length,
      completed: rows.filter(r => r.status === 'Completed').length,
    }
  }, [rows])

  const modalNode = createPortal(
    <div className="modal" tabIndex={-1} ref={modalRef} aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false" style={{ display: 'none' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Process DSAR Request</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={close}></button>
          </div>
          <div className="modal-body">
            <p className="mb-2">Confirm processing this request?</p>
            {selected && (
              <ul className="small text-muted mb-0">
                <li>ID: {selected.id}</li>
                <li>Type: {selected.type}</li>
                <li>Date: {new Date(selected.date).toLocaleString()}</li>
              </ul>
            )}
            {message && <div className="alert alert-info mt-3 mb-0">{message}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-dark" onClick={close}>Cancel</button>
            <button type="button" className="btn btn-dark" onClick={processRequest}>Confirm</button>
          </div>
        </div>
      </div>
    </div>, document.body)

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="mb-0">DSAR Requests</h5>
          <div className="d-flex gap-3 small text-muted">
            <span>Pending: {counters.pending}</span>
            <span>Completed: {counters.completed}</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Request Date</th>
                <th>Type</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.date).toLocaleString()}</td>
                  <td>{r.type}</td>
                  <td>
                    {r.status === 'Completed' ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle">Completed</span>
                    ) : r.status === 'Processing' ? (
                      <span className="badge badge-gold">Processing</span>
                    ) : r.status === 'Failed' ? (
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle">Failed</span>
                    ) : (
                      <span className="badge bg-secondary-subtle text-dark border border-secondary-subtle">Pending</span>
                    )}
                  </td>
                  <td className="text-end">
                    <div className="btn-group">
                      <button className="btn btn-outline-dark btn-sm" onClick={() => open(r)} disabled={getActiveSession()?.user?.role === 'auditor'}>Process</button>
                      <button className="btn btn-dark btn-sm" onClick={() => viewReport(r)}>View Report</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalNode}
    </div>
  )
}


