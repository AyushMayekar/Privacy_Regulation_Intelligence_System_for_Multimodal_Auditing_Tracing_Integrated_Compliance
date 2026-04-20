const BASE_URL = import.meta.env.VITE_API_URL ?? ''
export interface AuditLog {
  phase: string
  pii: string
  act: string
  laws: string[]
  conf: number
  ts: string
  vh?: string
}

export interface AuditQuery {
  limit?: number
  phase?: string
  date_from?: string
  date_to?: string
}

export async function fetchAuditLogs(query: AuditQuery = {}): Promise<AuditLog[]> {
  const body: AuditQuery = { limit: 100, ...query }
  // Remove empty optional filters
  if (!body.phase) delete body.phase
  if (!body.date_from) delete body.date_from
  if (!body.date_to) delete body.date_to

  const res = await fetch(`${BASE_URL}/audits/logs`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.detail ?? err?.message ?? 'Failed to fetch audit logs')
  }
  return res.json()
}
