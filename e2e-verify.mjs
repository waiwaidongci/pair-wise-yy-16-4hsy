#!/usr/bin node
/**
 * e2e-verify.mjs —— 任务要求的浏览器逐项自检脚本（无后端，前端模拟提交）。
 *
 * 用法：
 *   1. 先启动开发服务器：npm run dev（默认 http://127.0.0.1:5173）
 *   2. node e2e-verify.mjs
 *
 * 覆盖 task.md 的 7 条耦合约束：
 *   1 筛选状态跨导航保持  2 灯箱只在当前筛选结果内循环  3 图片按比例预留（CLS）
 *   4 系列页与作品集共用同一份数据  5 移动端单列 + 灯箱底部说明
 *   6 字体仅来自本地 woff2、无 Google CDN  7 表单行内校验 / 禁用提交 / 成功态
 *
 * 依赖：@playwright/test（devDependency）；首次运行需 npx playwright install chromium。
 */
import { chromium } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173'

const results = []
function check(name, ok, detail = '') {
  results.push({ name, ok })
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`)
}

async function assertPage(page) {
  const errs = []
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
  page.on('pageerror', (e) => errs.push(String(e)))
  return {
    noConsoleErrors: () => check('控制台无 error', errs.length === 0, errs.join(' | ')),
  }
}

const browser = await chromium.launch()
const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } })

{
  // 页面渲染
  const page = await desktop.newPage()
  const guard = await assertPage(page)
  for (const route of ['/', '/work', '/work/gaze', '/work/wilderness', '/work/highland-pastoral', '/about', '/contact']) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
    check(`路由可渲染：${route}`, await page.locator('main').isVisible())
  }
  guard.noConsoleErrors()

  // 约束1：筛选状态保持
  await page.goto(`${BASE}/work`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '牧野' }).click()
  await page.waitForFunction(() => document.querySelectorAll('.photo-button').length === 4)
  await page.locator('.series-entry').click()
  await page.waitForURL(/highland-pastoral/)
  await page.goBack()
  await page.waitForURL(/\/work$/)
  check(
    '约束1 返回后筛选仍为牧野且 4 张',
    (await page.getByRole('button', { name: '牧野' }).getAttribute('aria-pressed')) === 'true' &&
      (await page.locator('.photo-button').count()) === 4,
  )

  // 约束2：灯箱限定范围循环（4 次下一张回到起点）
  await page.locator('.photo-button').first().click()
  await page.waitForSelector('.lightbox[role="dialog"]')
  const firstTitle = (await page.locator('.lightbox-info h2').textContent()).trim()
  check('约束2 计数器 1/4', /1\s*\/\s*4/.test((await page.locator('.lightbox-info .eyebrow').textContent()) || ''))
  const titles = [firstTitle]
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: '下一张' }).click()
    titles.push((await page.locator('.lightbox-info h2').textContent()).trim())
  }
  check('约束2 4 次循环回起点且经过 4 个不同系列', titles[4] === titles[0] && new Set(titles.slice(0, 4)).size === 4,
    titles.slice(0, 4).join(' → '))
  await page.getByRole('button', { name: '关闭' }).click()

  // 首页精选卡片打开同一个灯箱组件
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.locator('.series-card').first().click()
  check('首页精选卡片打开共享灯箱', await page.locator('.lightbox[role="dialog"]').isVisible())
  await page.getByRole('button', { name: '关闭' }).click()

  // 约束4：系列页顺序来自共享数据
  await page.goto(`${BASE}/work/highland-pastoral`, { waitUntil: 'networkidle' })
  const order = await page.locator('.story article h2').allTextContents()
  check('约束4 高原牧歌按 order 渲染',
    JSON.stringify(order) === JSON.stringify(['独牛与木屋', '坡地牛群', '雪山下的歇息', '新疆牧场']))

  // 约束6：无外部字体请求
  const urls = []
  page.on('request', (r) => urls.push(r.url()))
  for (const route of ['/', '/work', '/about', '/contact']) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
  }
  check('约束6 无 googleapis/gstatic 请求',
    !urls.some((u) => /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u)))
  check('约束6 加载本地 woff2 (≥2)',
    new Set(urls.filter((u) => u.includes('/fonts/') && u.endsWith('.woff2'))).size >= 2)

  // 约束7：联系表单
  await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' })
  const submit = page.getByRole('button', { name: '发送消息' })
  check('约束7 空表单提交被禁用', await submit.isDisabled())
  await page.getByLabel('邮箱').fill('bad')
  await page.getByLabel('邮箱').blur()
  check('约束7 非法邮箱行内提示', await page.getByText('请输入有效的邮箱地址').isVisible())
  check('约束7 非法时仍禁用', await submit.isDisabled())
  await page.getByLabel('姓名').fill('访客')
  await page.getByLabel('邮箱').fill('hello@example.com')
  await page.getByLabel('留言').fill('想了解一项完整的摄影合作计划，谢谢。')
  check('约束7 合法后可提交', await submit.isEnabled())
  await submit.click()
  await page.getByText('谢谢你的来信').waitFor({ timeout: 5000 })
  check('约束7 提交后显示成功态', await page.getByText('谢谢你的来信').isVisible())
}

// 约束3：图片加载前按比例预留（人为延迟 jpg 900ms）
{
  const page = await desktop.newPage()
  await page.route('**/*.jpg', async (route) => {
    await new Promise((r) => setTimeout(r, 900))
    await route.continue()
  })
  await page.goto(`${BASE}/work`, { waitUntil: 'domcontentloaded' })
  const box = await page.locator('.photo-button .ratio-box').first().boundingBox()
  check('约束3 加载前占位比例=4067/6000',
    !!box && Math.abs(box.width / box.height - 4067 / 6000) < 0.01,
    box ? String((box.width / box.height).toFixed(4)) : 'no box')
  const before = await page.locator('.photo-button').nth(1).boundingBox()
  await page.waitForLoadState('networkidle')
  const after = await page.locator('.photo-button').nth(1).boundingBox()
  check('约束3 图片加载后位置位移<1px', !!before && !!after && Math.abs(before.y - after.y) < 1,
    `dy=${Math.abs(before.y - after.y)}`)
}

// 约束5：移动端单列 + 灯箱底部说明
{
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await mobile.newPage()
  await page.goto(`${BASE}/work`, { waitUntil: 'networkidle' })
  check('约束5 移动端汉堡菜单可见', await page.locator('.menu').isVisible())
  const b1 = await page.locator('.photo-button').first().boundingBox()
  const b2 = await page.locator('.photo-button').nth(1).boundingBox()
  check('约束5 网格单列', !!b1 && !!b2 && b2.y > b1.y + b1.height - 2 && Math.abs(b2.x - b1.x) < 4)
  await page.locator('.photo-button').first().click()
  await page.waitForSelector('.lightbox[role="dialog"]')
  const img = await page.locator('.lightbox-image').boundingBox()
  const info = await page.locator('.lightbox-info').boundingBox()
  check('约束5 灯箱说明在图片下方（底部条）',
    !!img && !!info && info.y >= img.y + img.height - 2,
    `info.y=${info?.y} imgBottom=${img && img.y + img.height}`)
}

await browser.close()

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} 项通过`)
process.exit(failed.length ? 1 : 0)
