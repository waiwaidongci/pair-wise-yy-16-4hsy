// 路由深链 + 其余两个系列 + 移动菜单 回归
import { chromium } from '@playwright/test'

const BASE = 'http://127.0.0.1:5173'
let failures = 0
const ok = (n, c, d = '') => {
  console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`)
  if (!c) failures++
}

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })

for (const [route, ids, titles] of [
  ['/work/gaze', 5, ['低垂', '遮蔽', '屏息', '侧光', '睁大']],
  ['/work/wilderness', 5, ['野花坡', '金色平原', '静丘', '山脊线', '雾谷']],
]) {
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(String(e)))
  await p.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
  const got = await p.locator('.story article h2').allTextContents()
  ok(`${route} 深链渲染 ${ids} 幅顺序`, JSON.stringify(got) === JSON.stringify(titles), got.join(','))
  ok(`${route} 无 pageerror`, errs.length === 0, errs.join('|'))
  await p.close()
}

// 未知 seriesId 应回退到 /work
{
  const p = await ctx.newPage()
  await p.goto(`${BASE}/work/does-not-exist`, { waitUntil: 'networkidle' })
  ok('未知系列重定向 /work', p.url().endsWith('/work'), p.url())
}

// 移动菜单开合
{
  const m = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const p = await m.newPage()
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await p.locator('.menu').click()
  const shown = await p.locator('.mobile-nav').isVisible()
  ok('移动菜单可展开', shown)
  await p.screenshot({ path: new URL('./screens/m-menu.png', import.meta.url).pathname })
  await p.locator('.mobile-nav .nav-link', { hasText: '关于' }).click()
  await p.waitForURL(/about/)
  ok('移动菜单点击跳转', p.url().includes('/about'))
}

// 灯箱键盘操作
{
  const p = await ctx.newPage()
  await p.goto(`${BASE}/work`, { waitUntil: 'networkidle' })
  await p.getByRole('button', { name: '肖像' }).click()
  await p.waitForFunction(() => document.querySelectorAll('.photo-button').length === 5)
  await p.locator('.photo-button').first().click()
  await p.waitForSelector('.lightbox[role="dialog"]')
  await p.keyboard.press('ArrowRight')
  await p.waitForTimeout(200)
  const c1 = (await p.locator('.lightbox-info .eyebrow').textContent()).trim()
  ok('键盘右切换到 2/5', c1.includes('2 / 5'), c1)
  await p.keyboard.press('Escape')
  await p.waitForSelector('.lightbox', { state: 'detached' })
  ok('Esc 关闭灯箱', true)
}

await browser.close()
process.exit(failures ? 1 : 0)
