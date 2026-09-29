import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The authoritative content lives in ../mock-data (kept outside the app source on
// purpose). Vite needs an explicit fs.allow entry so dev mode can read it.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '127.0.0.1',
    fs: {
      allow: ['..'],
    },
  },
})
