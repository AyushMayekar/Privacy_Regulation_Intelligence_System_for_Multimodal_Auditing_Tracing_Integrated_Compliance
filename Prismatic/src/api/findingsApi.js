const BASE = import.meta.env.VITE_API_URL ?? '';
export async function fetchFindings(sessionId) {
    const res = await fetch(`${BASE}/findings/latest?session_id=${encodeURIComponent(sessionId)}`, {
        credentials: 'include',
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail ?? err?.message ?? 'Failed to fetch findings');
    }
    return res.json();
}
