import { defineConfig } from '@playwright/test'
import path from 'node:path'

// 本地自检配置：直接对工作区根目录的应用（/workspace）跑 tests/ 里的官方验收用例。
// 运行方式：cd verify && npx playwright test
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
