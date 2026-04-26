import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // ── LOCAL DEVELOPMENT PROXY ───────────────────────────────────────────────
    // Active ONLY when running `vite dev` with VITE_API_URL='' (.env.development).
    // Forwards relative API paths to the local FastAPI backend on localhost:8000.
    //
    // In PRODUCTION (Vercel / `vite build`), this proxy block is ignored entirely —
    // all API calls use the full VITE_API_URL from .env.production instead.
    //
    // To disable local proxying and hit the deployed backend during dev:
    //   → set VITE_API_URL=https://privacy-regulation-intelligence-system.onrender.com
    //     in .env.development (or uncomment the line already there).
    proxy: {
      '/auth':     { target: 'http://localhost:8000', changeOrigin: true, secure: false },
      '/integrate': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
      '/chat':     { target: 'http://localhost:8000', changeOrigin: true, secure: false },
      '/findings': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
      '/audits':   { target: 'http://localhost:8000', changeOrigin: true, secure: false },
      '/api':      { target: 'http://localhost:8000', changeOrigin: true, secure: false },
    },
  },
})



