/**
 * chatApi.ts — Prismatic Chat & Audit API Service
 *
 * POST /chat        → Send message to AI agent, get structured response
 * GET  /chat/audits → Fetch audit log data directly
 *
 * All requests go through the Vite proxy to avoid CORS.
 * Auth is via httpOnly cookie (credentials: 'include').
 */
const BASE = import.meta.env.VITE_API_URL ?? '';
async function handleResponse(res) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = typeof data?.detail === 'string'
            ? data.detail
            : Array.isArray(data?.detail)
                ? data.detail.map((e) => e.msg).join(', ')
                : `HTTP ${res.status}`;
        throw new Error(msg);
    }
    return data;
}
// ── Chat ─────────────────────────────────────────────────────────────────────
export async function apiChat(message, sessionId) {
    const body = { message };
    if (sessionId)
        body.session_id = sessionId;
    const res = await fetch(`${BASE}/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return handleResponse(res);
}
// ── Audits ───────────────────────────────────────────────────────────────────
export async function apiGetAudits(limit = 100, phase) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (phase)
        params.set('phase', phase);
    const res = await fetch(`${BASE}/chat/audits?${params}`, {
        method: 'GET',
        credentials: 'include',
    });
    return handleResponse(res);
}
