// Feature: Policies (Regex Rules)
// Purpose: Define custom scan rules (regex/patterns) and test them against sample text.

import { useState } from 'react'

type Rule = { id: string; name: string; pattern: string; enabled: boolean }

export default function Policies() {
  const [rules, setRules] = useState<Rule[]>([
    { id: 'r1', name: 'Email Detector', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[A-Za-z]{2,}', enabled: true },
    { id: 'r2', name: 'Indian PAN (simple)', pattern: '[A-Z]{5}[0-9]{4}[A-Z]{1}', enabled: true },
  ])
  const [sample, setSample] = useState('Contact me at user@example.com. PAN: ABCDE1234F')
  const [message, setMessage] = useState<string | null>(null)

  function addRule() {
    setRules(prev => prev.concat({ id: `r_${Date.now()}`, name: 'New Rule', pattern: '', enabled: true }))
  }

  function removeRule(id: string) {
    setRules(prev => prev.filter(r => r.id !== id))
  }

  function testRules() {
    const enabled = rules.filter(r => r.enabled && r.pattern)
    const results = enabled.map(r => {
      try {
        const re = new RegExp(r.pattern, 'g')
        const matches = sample.match(re) || []
        return `${r.name}: ${matches.length} matches`
      } catch (e) {
        return `${r.name}: invalid regex`
      }
    })
    setMessage(results.join('\n'))
  }

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="mb-0">Policies (Regex Rules)</h5>
          <button className="btn btn-dark" onClick={addRule}>Add Rule</button>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Pattern</th>
                    <th>Enabled</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map(r => (
                    <tr key={r.id}>
                      <td>
                        <input className="form-control form-control-sm" value={r.name} onChange={e => setRules(prev => prev.map(x => x.id === r.id ? { ...x, name: e.target.value } : x))} />
                      </td>
                      <td>
                        <input className="form-control form-control-sm" value={r.pattern} onChange={e => setRules(prev => prev.map(x => x.id === r.id ? { ...x, pattern: e.target.value } : x))} />
                      </td>
                      <td>
                        <div className="form-check form-switch">
                          <input className="form-check-input" type="checkbox" checked={r.enabled} onChange={e => setRules(prev => prev.map(x => x.id === r.id ? { ...x, enabled: e.target.checked } : x))} />
                        </div>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-outline-dark btn-sm" onClick={() => removeRule(r.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <label className="form-label">Sample Text</label>
            <textarea className="form-control" rows={8} value={sample} onChange={e => setSample(e.target.value)}></textarea>
            <div className="d-flex justify-content-end mt-2">
              <button className="btn btn-dark" onClick={testRules}>Test</button>
            </div>
            {message && (
              <pre className="mt-3 p-3 bg-accent-soft border-accent" style={{ border: '1px solid', borderRadius: 8, whiteSpace: 'pre-wrap' }}>{message}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


