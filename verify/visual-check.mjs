// 人工浏览器逐项核对脚本：覆盖任务要求的每个交互状态，并产出截图到 verify/screens/。
import { chromium } from '@playwright/test'
import fs from 'node:fs'

const BASE = 'http://127.0.0.1:5173'
const OUT = new URL('./screens/', import.meta.url).pathname
fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })

const results = []
function check(name, ok, detail = '') {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })

{
  const p = await ctx.newPage()
  const errors = []
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  p.on('pageerror', (e) => errors.push(String(e)))

  // ---- 状态 A：首页 ----
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await p.waitForSelector('.hero-title')
  await p.screenshot({ path: `${OUT}a-home.png`, fullPage: true })
  check('A 首页 hero 姓名与简介', (await p.locator('.hero-title').textContent())?.includes('林昭'))
  check('A 三个系列入口', await p.locator('.series-card').count() === 3,
    String(await p.locator('.series-card').count()))
  check('A 控制台无 error', errors.length === 0, errors.join(' | '))

  // ---- 状态 B：/work 筛选牧野 ----
  await p.goto(`${BASE}/work`, { waitUntil: 'networkidle' })
  await p.getByRole('button', { name: '牧野' }).click()
  await p.waitForFunction(() => document.querySelectorAll('.photo-button').length === 4)
  check('B 牧野筛选 4 张', await p.locator('.photo-button').count() === 4)
  check('B 选中态 aria-pressed',
    await p.getByRole('button', { name: '牧野' }).getAttribute('aria-pressed') === 'true')
  await p.screenshot({ path: `${OUT}b-work-filtered.png`, fullPage: true })

  // ---- 约束1：进入系列再返回保留筛选 ----
  await p.locator('.series-entry').click()
  await p.waitForURL(/highland-pastoral/)
  await p.goBack()
  await p.waitForURL(/\/work$/)
  const kept = await p.getByRole('button', { name: '牧野' }).getAttribute('aria-pressed')
  check('约束1 返回后筛选保留', kept === 'true' && await p.locator('.photo-button').count() === 4)

  // ---- 状态 C：灯箱范围限定（牧野第2张 → 下一张 = 第3张） ----
  await p.locator('.photo-button').nth(1).click()
  await p.waitForSelector('.lightbox[role="dialog"]')
  const c1 = await p.locator('.lightbox-info .eyebrow').textContent()
  const t1 = (await p.locator('.lightbox-info h2').textContent()).trim()
  await p.screenshot({ path: `${OUT}c1-lightbox.png` })
  await p.getByRole('button', { name: '下一张' }).click()
  await p.waitForTimeout(300)
  const c2 = await p.locator('.lightbox-info .eyebrow').textContent()
  const t2 = (await p.locator('.lightbox-info h2').textContent()).trim()
  await p.screenshot({ path: `${OUT}c2-lightbox-next.png` })
  check('C 打开第2张时计数 2/4', /2\s*\/\s*4/.test(c1 || ''), c1)
  check('C 下一张后为 3/4 且标题=雪山下的歇息', /3\s*\/\s*4/.test(c2 || '') && t2 === '雪山下的歇息',
    `${c2} / ${t2}`)
  // 从第2张起共点 4 次「下一张」应回到第2张（已点1次，再点3次）
  await p.getByRole('button', { name: '下一张' }).click()
  await p.waitForTimeout(200)
  await p.getByRole('button', { name: '下一张' }).click()
  await p.waitForTimeout(200)
  await p.getByRole('button', { name: '下一张' }).click()
  await p.waitForTimeout(300)
  const t3 = (await p.locator('.lightbox-info h2').textContent()).trim()
  check('C 再两次下一张循环回坡地牛群', t3 === '坡地牛群', t3)
  await p.getByRole('button', { name: '关闭' }).click()
  await p.waitForSelector('.lightbox', { state: 'detached' })

  // 全部状态下灯箱 total=14
  await p.getByRole('button', { name: '全部' }).click()
  await p.waitForFunction(() => document.querySelectorAll('.photo-button').length === 14)
  await p.locator('.photo-button').first().click()
  await p.waitForSelector('.lightbox[role="dialog"]')
  const all = await p.locator('.lightbox-info .eyebrow').textContent()
  check('C 全部时灯箱 total=14', /1\s*\/\s*14/.test(all || ''), all)
  await p.getByRole('button', { name: '关闭' }).click()

  // ---- 状态 D：系列详情 ----
  await p.goto(`${BASE}/work/highland-pastoral`, { waitUntil: 'networkidle' })
  const storyTitles = await p.locator('.story article h2').allTextContents()
  check('D 系列4幅按 order 顺序',
    JSON.stringify(storyTitles) === JSON.stringify(['独牛与木屋', '坡地牛群', '雪山下的歇息', '新疆牧场']),
    storyTitles.join(','))
  check('D summary 以斜体引言呈现',
    await p.locator('.series-intro').evaluate((el) => getComputedStyle(el).fontStyle) === 'italic')
  await p.screenshot({ path: `${OUT}d-series.png`, fullPage: true })

  // ---- 关于 / 联系 渲染 ----
  await p.goto(`${BASE}/about`, { waitUntil: 'networkidle' })
  check('关于页时间线', await p.locator('.timeline-item').count() === 5)
  await p.screenshot({ path: `${OUT}about.png`, fullPage: true })

  await p.goto(`${BASE}/contact`, { waitUntil: 'networkidle' })
  check('F 空表单提交禁用', await p.getByRole('button', { name: '发送消息' }).isDisabled())
  await p.getByLabel('邮箱').fill('bad')
  await p.getByLabel('邮箱').blur()
  const errVisible = await p.getByText('请输入有效的邮箱地址').isVisible()
  check('F 非法邮箱行内提示', errVisible)
  await p.screenshot({ path: `${OUT}f1-contact-error.png` })
  await p.getByLabel('姓名').fill('访客')
  await p.getByLabel('邮箱').fill('hello@example.com')
  await p.getByLabel('留言').fill('想了解一项完整的摄影合作计划，谢谢。')
  check('F 合法后可提交', await p.getByRole('button', { name: '发送消息' }).isEnabled())
  await p.getByRole('button', { name: '发送消息' }).click()
  await p.getByText('谢谢你的来信').waitFor({ timeout: 5000 })
  check('F 成功态出现', await p.getByText('谢谢你的来信').isVisible())
  await p.screenshot({ path: `${OUT}f2-contact-success.png` })
}

// ---- 约束3：CLS（限速 jpg）----
{
  const p = await ctx.newPage()
  await p.route('**/*.jpg', async (r) => {
    await new Promise((res) => setTimeout(res, 900))
    await r.continue()
  })
  await p.goto(`${BASE}/work`, { waitUntil: 'domcontentloaded' })
  const box = await p.locator('.photo-button .ratio-box').first().boundingBox()
  const res = await p.request.fetch(`${BASE}/photos/portrait/portrait-01.jpg`)
  const expected = 4067 / 6000
  const actual = box.width / box.height
  check('约束3 加载前占位比例正确', Math.abs(actual - expected) < 0.01,
    `actual=${actual.toFixed(4)} expected=${expected.toFixed(4)} status=${res.status()}`)
  const before = await p.locator('.photo-button').nth(1).boundingBox()
  await p.waitForLoadState('networkidle')
  const after = await p.locator('.photo-button').nth(1).boundingBox()
  check('约束3 加载完成后位移<1px', Math.abs(before.y - after.y) < 1,
    `dy=${Math.abs(before.y - after.y)}`)
}

// ---- 约束5：移动端 ----
{
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const p = await mobile.newPage()
  await p.goto(`${BASE}/work`, { waitUntil: 'networkidle' })
  check('E 汉堡菜单可见', await p.locator('.menu').isVisible())
  const b1 = await p.locator('.photo-button').first().boundingBox()
  const b2 = await p.locator('.photo-button').nth(1).boundingBox()
  check('E 单列排布', b2.y > b1.y + b1.height - 2 && Math.abs(b2.x - b1.x) < 4)
  await p.screenshot({ path: `${OUT}e-work-mobile.png`, fullPage: false })
  await p.locator('.photo-button').first().click()
  await p.waitForSelector('.lightbox[role="dialog"]')
  await p.waitForTimeout(400)
  const img = await p.locator('.lightbox-image').boundingBox()
  const info = await p.locator('.lightbox-info').boundingBox()
  check('E 灯箱说明在图片下方', info.y >= img.y + img.height - 2,
    `info.y=${info.y} imgBottom=${img.y + img.height}`)
  await p.screenshot({ path: `${OUT}e-lightbox-mobile.png` })
}

// ---- 约束6：无外部字体请求 ----
{
  const p = await ctx.newPage()
  const urls = []
  p.on('request', (r) => urls.push(r.url()))
  for (const r of ['/', '/work', '/about', '/contact']) {
    await p.goto(`${BASE}${r}`, { waitUntil: 'networkidle' })
  }
  const external = urls.filter((u) => /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u))
  const local = new Set(urls.filter((u) => u.includes('/fonts/') && u.endsWith('.woff2')))
  check('约束6 零外部字体请求', external.length === 0, external.join(','))
  check('约束6 本地 woff2 被加载', local.size >= 2, [...local].join(' , '))
}

// ---- 首页精选卡片打开的是同一个灯箱（非跳转） ----
{
  const p = await ctx.newPage()
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await p.locator('.series-card').first().click()
  const open = await p.locator('.lightbox[role="dialog"]').isVisible()
  check('首页精选卡片打开共享灯箱', open)
  await p.screenshot({ path: `${OUT}home-lightbox.png` })
}

await browser.close()

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
