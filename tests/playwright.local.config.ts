import { defineConfig } from '@playwright/test'
import path from 'node:path'

// Local verification config: the official suite in tests/playwright.config.ts
// points at ../sota-submission; in this workspace the app lives at the repo root.
const APP_DIR = path.resolve(process.cwd(), '..')
const PORT = 5173
const BASE_URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `npm run dev -- --port ${PORT} --host 127.0.0.1`,
    cwd: APP_DIR,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
