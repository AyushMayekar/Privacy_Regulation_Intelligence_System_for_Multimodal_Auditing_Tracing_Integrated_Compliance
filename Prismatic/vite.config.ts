import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward /auth/* and /integrate/* to FastAPI backend during dev
      '/auth': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
      '/integrate': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
      '/chat': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
      '/findings': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
      '/audits': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})



