// Production: resolves to https://privacy-regulation-intelligence-system.onrender.com/integrate
// Development: resolves to /integrate (empty string → Vite proxy forwards to localhost:8000)
const BASE = `${import.meta.env.VITE_API_URL ?? ''}/integrate`

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
  // Full URL needed for browser redirect — uses deployed backend in production,
  // falls back to /integrate/gmail (Vite proxy) in local development.
  window.location.href = `${BASE}/gmail`
}
