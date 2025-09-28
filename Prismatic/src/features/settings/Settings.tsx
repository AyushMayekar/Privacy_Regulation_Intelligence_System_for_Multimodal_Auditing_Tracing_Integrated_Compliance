// Feature: Settings
// Purpose: Organization settings form (org info, admins, notifications, RBAC) for dev/demo.
// Notes: Pure frontend state to be replaced with real API later.

import { useState } from 'react'

type Admin = { id: string; email: string; role: 'Admin' | 'Auditor' }

export default function Settings() {
  const [orgName, setOrgName] = useState('Prismatic Inc.')
  const [admins, setAdmins] = useState<Admin[]>([
    { id: 'a1', email: 'admin@prismatic.io', role: 'Admin' },
    { id: 'a2', email: 'auditor@prismatic.io', role: 'Auditor' },
  ])
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<Admin['role']>('Admin')
  const [prefEmail, setPrefEmail] = useState(true)
  const [prefPush, setPrefPush] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function addAdmin(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail) return
    setAdmins(prev => prev.concat({ id: `a_${Date.now()}`, email: newEmail, role: newRole }))
    setNewEmail('')
    setNewRole('Admin')
  }

  function removeAdmin(id: string) {
    setAdmins(prev => prev.filter(a => a.id !== id))
  }

  async function saveChanges(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    await new Promise(r => setTimeout(r, 700))
    setSaving(false)
    setMessage('Settings saved successfully.')
    setTimeout(() => setMessage(null), 1200)
  }

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <h5 className="mb-3">Organization Settings</h5>

        <form onSubmit={saveChanges} className="row g-3">
          <div className="col-12 col-lg-6">
            <div className="card border-0" style={{ borderRadius: 12 }}>
              <div className="card-body">
                <h6>Organization Info</h6>
                <div className="mb-3">
                  <label className="form-label">Organization Name</label>
                  <input className="form-control" value={orgName} onChange={e => setOrgName(e.target.value)} required />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card border-0" style={{ borderRadius: 12 }}>
              <div className="card-body">
                <h6>Notification Preferences</h6>
                <div className="form-check form-switch mb-2">
                  <input className="form-check-input" type="checkbox" id="emailNotif" checked={prefEmail} onChange={e => setPrefEmail(e.target.checked)} />
                  <label className="form-check-label" htmlFor="emailNotif">Email notifications</label>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="pushNotif" checked={prefPush} onChange={e => setPrefPush(e.target.checked)} />
                  <label className="form-check-label" htmlFor="pushNotif">Push notifications</label>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card border-0" style={{ borderRadius: 12 }}>
              <div className="card-body">
                <h6>Admins & Auditors</h6>
                <form className="row g-2" onSubmit={addAdmin}>
                  <div className="col-12 col-md-6">
                    <input className="form-control" type="email" placeholder="email@example.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                  </div>
                  <div className="col-6 col-md-3">
                    <select className="form-select" value={newRole} onChange={e => setNewRole(e.target.value as Admin['role'])}>
                      <option>Admin</option>
                      <option>Auditor</option>
                    </select>
                  </div>
                  <div className="col-6 col-md-3 d-grid">
                    <button className="btn btn-dark" type="submit">Add</button>
                  </div>
                </form>

                <div className="table-responsive mt-3">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Role</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map(a => (
                        <tr key={a.id}>
                          <td>{a.email}</td>
                          <td>
                            <select className="form-select form-select-sm" value={a.role} onChange={e => setAdmins(prev => prev.map(x => x.id === a.id ? { ...x, role: e.target.value as Admin['role'] } : x))}>
                              <option>Admin</option>
                              <option>Auditor</option>
                            </select>
                          </td>
                          <td className="text-end">
                            <button className="btn btn-outline-dark btn-sm" onClick={() => removeAdmin(a.id)}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="d-flex justify-content-end">
              <button className="btn btn-dark px-4" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
            {message && <div className="alert alert-success mt-3 mb-0">{message}</div>}
          </div>
        </form>
      </div>
    </div>
  )
}


