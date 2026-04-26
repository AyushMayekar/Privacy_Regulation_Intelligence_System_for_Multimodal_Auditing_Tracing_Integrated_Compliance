/**
 * authApi.ts — Prismatic Auth API Service
 *
 * BASE_URL is controlled by VITE_API_URL (see .env.production / .env.development):
 *   • Production (Vercel)   → https://privacy-regulation-intelligence-system.onrender.com
 *   • Development (local)   → '' (empty string, Vite proxy forwards to localhost:8000)
 *
 * Endpoints:
 *   POST /auth/token     → Login  (OAuth2PasswordRequestForm: username + password)
 *   POST /auth/register  → Signup (JSON: org_name, admin_name, admin_email, password, consent)
 *   POST /auth/logout    → Logout (clears httpOnly cookies server-side)
 *   GET  /auth/protected → Verify session (reads httpOnly cookie automatically)
 *
 * Tokens are stored as httpOnly cookies by the server — we never touch them
 * in JS. All requests use `credentials: 'include'` so cookies travel with
 * every request automatically.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  admin_email: string
  password: string
}

export interface RegisterPayload {
  org_name: string
  admin_name: string
  admin_email: string
  password: string
  consent: boolean
}

export interface AuthResponse {
  message: string
  access_token?: string
  token_type?: string
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    // FastAPI puts error detail in data.detail
    const msg =
      typeof data?.detail === 'string'
        ? data.detail
        : Array.isArray(data?.detail)
          ? data.detail.map((e: any) => e.msg).join(', ')
          : `HTTP ${res.status}`
    throw new Error(msg)
  }
  return data as T
}

// ─── Login ────────────────────────────────────────────────────────────────────
/**
 * POST /auth/token
 * Backend uses OAuth2PasswordRequestForm — must be sent as application/x-www-form-urlencoded
 * Field "username" maps to admin_email (FastAPI OAuth2 convention).
 */
export async function apiLogin(payload: LoginPayload): Promise<AuthResponse> {
  const body = new URLSearchParams({
    username: payload.admin_email,
    password: payload.password,
  })

  const res = await fetch(`${BASE_URL}/auth/token`, {
    method: 'POST',
    credentials: 'include',           // sends / receives httpOnly cookies
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  return handleResponse<AuthResponse>(res)
}

// ─── Register ─────────────────────────────────────────────────────────────────
/**
 * POST /auth/register
 * Expects JSON body matching UserCreate schema.
 */
export async function apiRegister(payload: RegisterPayload): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return handleResponse<{ message: string }>(res)
}

// ─── Logout ───────────────────────────────────────────────────────────────────
/**
 * POST /auth/logout
 * Server clears httpOnly cookies. No body needed.
 */
export async function apiLogout(): Promise<void> {
  await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}

// ─── Session check ────────────────────────────────────────────────────────────
/**
 * GET /auth/protected
 * Returns { message: 'Authenticated' } if cookie is valid, 401 otherwise.
 */
export async function apiCheckSession(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/auth/protected`, {
      method: 'GET',
      credentials: 'include',
    })
    return res.ok
  } catch {
    return false
  }
}
