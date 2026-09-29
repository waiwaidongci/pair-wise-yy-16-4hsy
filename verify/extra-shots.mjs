// 补充截图：打磨后的首页三卡片等高等宽、系列页引言
import { chromium } from '@playwright/test'

const BASE = 'http://127.0.0.1:5173'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const p = await ctx.newPage()

await p.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await p.waitForTimeout(800)
const covers = await p.locator('.series-cover').evaluateAll((els) =>
  els.map((el) => {
    const r = el.getBoundingClientRect()
    return { w: Math.round(r.width), h: Math.round(r.height) }
  }),
)
const heights = new Set(covers.map((c) => c.h))
console.log('covers:', JSON.stringify(covers), heights.size === 1 ? 'UNIFORM ✓' : 'MISMATCH ✗')
await p.screenshot({ path: new URL('./screens/a-home.png', import.meta.url).pathname, fullPage: true })

await p.goto(`${BASE}/work/highland-pastoral`, { waitUntil: 'networkidle' })
await p.waitForTimeout(800)
await p.screenshot({ path: new URL('./screens/d-series.png', import.meta.url).pathname, fullPage: true })

// 移动端系列页与首页、关于、联系整页（最终回归）
const m = await browser.newContext({ viewport: { width: 390, height: 844 } })
const mp = await m.newPage()
await mp.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await mp.waitForTimeout(600)
await mp.screenshot({ path: new URL('./screens/m-home.png', import.meta.url).pathname, fullPage: true })

await browser.close()
