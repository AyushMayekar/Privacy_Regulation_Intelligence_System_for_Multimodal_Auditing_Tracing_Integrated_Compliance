export interface FindingsData {
  total_findings: number
  avg_confidence: number
  pii_distribution: Record<string, number>
  field_distribution: Record<string, number>
  law_distribution: Record<string, number>
}
const BASE = import.meta.env.VITE_API_URL ?? ''
export interface FindingsResponse {
  status: 'success' | 'empty'
  message?: string
  data?: FindingsData
}

export async function fetchFindings(sessionId: string): Promise<FindingsResponse> {
  const res = await fetch(`${BASE}/findings/latest?session_id=${encodeURIComponent(sessionId)}`, {
    credentials: 'include',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.detail ?? err?.message ?? 'Failed to fetch findings')
  }
  return res.json()
}
