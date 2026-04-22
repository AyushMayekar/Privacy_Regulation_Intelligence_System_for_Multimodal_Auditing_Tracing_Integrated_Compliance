const BASE = '/integrate'

export async function getIntegrationStatus(): Promise<{ mongo: boolean; gmail: boolean }> {
  const res = await fetch(`${BASE}/status`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch integration status')
  return res.json()
}

export async function connectMongo(mongo_uri: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/mongo`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mongo_uri }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.detail ?? data?.message ?? 'MongoDB connection failed')
  return data
}

export function startGmailOAuth() {
  window.location.href = '/integrate/gmail'
}
