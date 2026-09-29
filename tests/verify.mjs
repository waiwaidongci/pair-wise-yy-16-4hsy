// Browser verification for every user requirement + target_states.md A–F.
// Run: node verify.mjs  (expects dev server at 127.0.0.1:5173)
import { chromium } from 'playwright'
import fs from 'node:fs'

const results = []
function check(name, ok, detail = '') {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`)
}
const expectCount = n => page.locator('.photo-button').first().waitFor()
  .then(() => page.waitForFunction(
    n => document.querySelectorAll('.photo-button').length === n, n))

const browser = await chromium.launch()
const BASE = 'http://127.0.0.1:5173'
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await ctx.newPage()

const externalFontReqs = []
page.on('request', req => {
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(req.url())) externalFontReqs.push(req.url())
})
const consoleErrors = []
page.on('console', m => m.type() === 'error' && consoleErrors.push(m.text()))
page.on('pageerror', e => consoleErrors.push(String(e)))

// ---------- State A: home ----------
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.screenshot({ path: 'verify-shots/a-home.png', fullPage: true })
check('A hero 简介可见', await page.getByText('我是林见山').isVisible())
const seriesCards = page.locator('.series-card')
check('A 三个系列入口', (await seriesCards.count()) === 3)
for (const t of ['凝视', '无人之境', '高原牧歌']) {
  check(`A 系列《${t}》入口`, await page.getByText(t).first().isVisible())
}

// home card opens the shared lightbox (not navigation)
await page.locator('.series-card').first().click()
await page.locator('.lightbox[role="dialog"]').waitFor()
check('A 首页精选图打开共享灯箱', await page.locator('.lightbox[role="dialog"]').isVisible())
// scoped to that series (5 photos)
check(
  'A 首页灯箱范围=该系列 5 张',
  (await page.locator('.lightbox-info .eyebrow').textContent()).includes('/ 5'),
)
await page.keyboard.press('Escape')
await page.locator('.lightbox').waitFor({ state: 'detached' })

// ---------- State B: /work + filter ----------
await page.goto(BASE + '/work', { waitUntil: 'networkidle' })
const labels = await page.locator('.filters button').allTextContents()
check('B 筛选项顺序', labels.join(',') === '全部,肖像,风光,牧野', labels.join(','))
check('B 全部时 14 张', (await page.locator('.photo-button').count()) === 14)
await page.getByRole('button', { name: '牧野' }).click()
await expectCount(4)
const bCount = await page.locator('.photo-button').count()
check('B 牧野筛选 4 张', bCount === 4, `count=${bCount}`)
check(
  'B 牧野选中态',
  (await page.getByRole('button', { name: '牧野' }).getAttribute('aria-pressed')) === 'true',
)
await page.screenshot({ path: 'verify-shots/b-work-pastoral.png' })

// ---------- State C: scoped lightbox cycle ----------
await page.locator('.photo-button').nth(1).click() // pastoral-02
await page.locator('.lightbox').waitFor()
let counter = await page.locator('.lightbox-info .eyebrow').textContent()
check('C 打开第2张显示 2/4', /2 \/ 4/.test(counter), counter.trim())
await page.screenshot({ path: 'verify-shots/c1-lightbox-p02.png' })
await page.getByRole('button', { name: '下一张' }).click() // -> pastoral-03
const titleAfterNext = (await page.locator('.lightbox-info h2').textContent()).trim()
counter = await page.locator('.lightbox-info .eyebrow').textContent()
check('C 下一张到 pastoral-03「雪山下的歇息」', titleAfterNext === '雪山下的歇息', titleAfterNext)
check('C 计数器 3/4', /3 \/ 4/.test(counter), counter.trim())
await page.screenshot({ path: 'verify-shots/c2-lightbox-p03.png' })
await page.getByRole('button', { name: '下一张' }).click() // p04
await page.getByRole('button', { name: '下一张' }).click() // wrap -> p01
const wrap1 = (await page.locator('.lightbox-info h2').textContent()).trim()
check('C 循环回到 pastoral-01「独牛与木屋」', wrap1 === '独牛与木屋', wrap1)
await page.getByRole('button', { name: '下一张' }).click() // -> p02
const wrap2 = (await page.locator('.lightbox-info h2').textContent()).trim()
check('C 再下一张回到 p02', wrap2 === '坡地牛群', wrap2)
// prev direction + close
await page.getByRole('button', { name: '上一张' }).click()
check('C 上一张回到 p01', (await page.locator('.lightbox-info h2').textContent()).trim() === '独牛与木屋')
await page.getByRole('button', { name: '关闭' }).click()
check('C 灯箱关闭', (await page.locator('.lightbox').count()) === 0)

// ---------- Constraint 1: filter persists via series page ----------
await page.getByRole('link', { name: /高原牧歌/ }).first().click()
await page.waitForURL(/highland-pastoral/)
await page.screenshot({ path: 'verify-shots/d-series.png', fullPage: true })
check('D 系列页 summary 引言', await page.locator('.pull-quote', { hasText: '牧场、牛群' }).isVisible())
const storyTitles = await page.locator('.story article h2').allTextContents()
check(
  'D 图文顺序',
  JSON.stringify(storyTitles) === JSON.stringify(['独牛与木屋', '坡地牛群', '雪山下的歇息', '新疆牧场']),
  storyTitles.join('|'),
)
check('D 4 个图文块', (await page.locator('.story article').count()) === 4)
// lightbox on series scoped to series
await page.locator('.story .photo-button').first().click()
check('D 系列灯箱 1/4', /1 \/ 4/.test(await page.locator('.lightbox-info .eyebrow').textContent()))
await page.keyboard.press('Escape')
await page.goBack()
await page.waitForURL(/\/work$/)
await expectCount(4)
check(
  '1 返回后筛选保留为牧野',
  (await page.getByRole('button', { name: '牧野' }).getAttribute('aria-pressed')) === 'true',
)
const backCount = await page.locator('.photo-button').count()
check('1 返回后仍 4 张', backCount === 4, `count=${backCount}`)

// ---------- Constraint 3: CLS ratio placeholders ----------
const data = JSON.parse(fs.readFileSync('../mock-data/photos.json', 'utf8'))
await page.route('**/*.jpg', async route => {
  await new Promise(r => setTimeout(r, 900))
  await route.continue()
})
await page.goto(BASE + '/work', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(300)
const box = await page.locator('.photo-button .ratio-box').first().boundingBox()
const expected = data.photos[0].width / data.photos[0].height
check('3 占位比例误差<0.01', Math.abs(box.width / box.height - expected) < 0.01,
  `got ${box.width / box.height} want ${expected}`)
const before = await page.locator('.photo-button').nth(1).boundingBox()
await page.waitForLoadState('networkidle')
const after = await page.locator('.photo-button').nth(1).boundingBox()
check('3 加载后无位移(<1px)', Math.abs(before.y - after.y) < 1, `${before.y} -> ${after.y}`)
await page.unroute('**/*.jpg')

// ---------- Constraint 5: mobile single column + bottom lightbox ----------
await page.setViewportSize({ width: 390, height: 844 })
await page.goto(BASE + '/work', { waitUntil: 'networkidle' })
await page.screenshot({ path: 'verify-shots/e-work-mobile.png' })
check('E 汉堡菜单可见', await page.locator('.menu').isVisible())
const f = await page.locator('.photo-button').first().boundingBox()
const s = await page.locator('.photo-button').nth(1).boundingBox()
check('E 单列堆叠', s.y > f.y + f.height - 2)
const fxs = [f.x, (await page.locator('.photo-button').nth(2).boundingBox()).x]
check('E 各项 x 起点一致', Math.abs(f.x - fxs[1]) < 2, `${f.x} vs ${fxs[1]}`)
await page.locator('.photo-button').first().click()
await page.locator('.lightbox').waitFor()
const ibox = await page.locator('.lightbox-image').boundingBox()
const infobox = await page.locator('.lightbox-info').boundingBox()
check('E 灯箱说明在图片下方', infobox.y >= ibox.y + ibox.height - 2)
await page.screenshot({ path: 'verify-shots/e2-lightbox-mobile.png' })
await page.keyboard.press('Escape')
await page.setViewportSize({ width: 1440, height: 1000 })

// desktop lightbox info still below image (side panel avoided on purpose)
await page.locator('.photo-button').first().click()
const dib = await page.locator('.lightbox-image').boundingBox()
const din = await page.locator('.lightbox-info').boundingBox()
check('桌面灯箱说明位于图片下方', din.y >= dib.y + dib.height - 2)
await page.keyboard.press('Escape')

// ---------- About ----------
await page.goto(BASE + '/about', { waitUntil: 'networkidle' })
await page.screenshot({ path: 'verify-shots/about.png', fullPage: true })
check('关于页标题', await page.getByRole('heading', { name: '林见山' }).isVisible())
check('关于页时间线', (await page.locator('.timeline-item').count()) >= 4)

// ---------- Constraint 6: fonts ----------
check('6 无 googleapis/gstatic 请求', externalFontReqs.length === 0, externalFontReqs.join(','))

// ---------- Constraint 7: contact form ----------
await page.goto(BASE + '/contact', { waitUntil: 'networkidle' })
await page.screenshot({ path: 'verify-shots/f0-contact.png' })
const submit = page.getByRole('button', { name: '发送消息' })
check('7 初始提交禁用', await submit.isDisabled())
await page.getByLabel('邮箱').fill('bad')
await page.getByLabel('邮箱').blur()
check('7 邮箱格式行内错误', await page.getByText('请输入有效的邮箱地址').isVisible())
await page.screenshot({ path: 'verify-shots/f1-contact-error.png' })
check('7 非法时仍禁用', await submit.isDisabled())
await page.getByLabel('姓名').fill('访客')
await page.getByLabel('邮箱').fill('hello@example.com')
await page.getByLabel('留言').fill('想约一次高原上的肖像拍摄，想了解档期与合作方式。')
check('7 合法后可提交', await submit.isEnabled())
await submit.click()
await page.getByText('谢谢你的来信').waitFor()
check('7 成功态', await page.getByText('谢谢你的来信').isVisible())
await page.screenshot({ path: 'verify-shots/f2-contact-success.png' })

// ---------- content fidelity ----------
await page.goto(BASE + '/work', { waitUntil: 'networkidle' })
const renderedTitles = new Set(await page.locator('.photo-button .photo-meta strong').allTextContents())
const expectedTitles = new Set(data.photos.map(p => p.title))
const missing = [...expectedTitles].filter(t => !renderedTitles.has(t))
const extra = [...renderedTitles].filter(t => !expectedTitles.has(t))
check('内容标题一致', missing.length === 0 && extra.length === 0, `missing=${missing} extra=${extra}`)

// no reference images requested anywhere
// (request listener covers whole session)
const allReqs = []
page.removeAllListeners('request')
await page.route(/reference_/, route => { allReqs.push(route.request().url()); route.continue() })
for (const r of ['/', '/work', '/work/gaze', '/about', '/contact']) {
  await page.goto(BASE + r, { waitUntil: 'networkidle' })
}
check('未加载任何参考图', allReqs.length === 0)

check('控制台无 error', consoleErrors.length === 0, consoleErrors.join(' | '))

await browser.close()
const failed = results.filter(r => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
