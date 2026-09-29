import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } })
const B = 'http://127.0.0.1:5173'
let ok = 0, bad = 0
const c = (n, v) => { v ? ok++ : bad++; console.log((v ? 'PASS' : 'FAIL') + '  ' + n) }

// keyboard arrows navigate within scoped list
await p.goto(B + '/work', { waitUntil: 'networkidle' })
await p.getByRole('button', { name: '肖像' }).click()
await p.waitForFunction(() => document.querySelectorAll('.photo-button').length === 5)
await p.locator('.photo-button').first().click()
await p.locator('.lightbox').waitFor()
await p.keyboard.press('ArrowRight')
c('键盘→到第2张', /2 \/ 5/.test(await p.locator('.lightbox-info .eyebrow').textContent()))
await p.keyboard.press('ArrowLeft')
c('键盘←回第1张', /1 \/ 5/.test(await p.locator('.lightbox-info .eyebrow').textContent()))
// backdrop click closes
await p.mouse.click(20, 500)
c('点击遮罩关闭', (await p.locator('.lightbox').count()) === 0)

// wilderness series from footer
await p.goto(B + '/', { waitUntil: 'networkidle' })
await p.locator('.footer-series a', { hasText: '无人之境' }).click()
await p.waitForURL(/wilderness/)
const wt = await p.locator('.story article h2').allTextContents()
c('无人之境 5 张顺序', JSON.stringify(wt) === JSON.stringify(
  ['野花坡', '金色平原', '静丘', '山脊线', '雾谷']))
// quote present
c('引言存在', (await p.locator('.pull-quote').count()) === 1)

// gaze series direct nav
await p.goto(B + '/work/gaze', { waitUntil: 'networkidle' })
c('凝视 5 图文块', (await p.locator('.story article').count()) === 5)
// unknown series redirects to /work
await p.goto(B + '/work/nope', { waitUntil: 'networkidle' })
c('未知系列回退 /work', p.url().endsWith('/work'))

// contact: blur empty fields shows errors; name empty blocks submit
await p.goto(B + '/contact', { waitUntil: 'networkidle' })
await p.getByLabel('姓名').fill('x')
await p.getByLabel('姓名').fill('')
await p.getByLabel('姓名').blur()
c('空姓名行内错误', await p.getByText('请填写你的姓名').isVisible())
await p.getByLabel('留言').fill('   ')
await p.getByLabel('留言').blur()
c('空留言行内错误', await p.getByText('请写下你想说的话').isVisible())
c('提交保持禁用', await p.getByRole('button', { name: '发送消息' }).isDisabled())
// fixing fields enables
await p.getByLabel('姓名').fill('张三')
await p.getByLabel('邮箱').fill('a@b.co')
await p.getByLabel('留言').fill('想约拍一组黑白肖像。')
c('合法后启用', await p.getByRole('button', { name: '发送消息' }).isEnabled())

// mobile hamburger actually navigates
await p.setViewportSize({ width: 390, height: 844 })
await p.goto(B + '/work', { waitUntil: 'networkidle' })
await p.locator('.menu').click()
await p.locator('.main-nav a', { hasText: '关于' }).click()
await p.waitForURL(/about/)
c('移动菜单导航到关于', p.url().endsWith('/about'))
c('移动菜单点击后收起', await p.locator('.main-nav').evaluate(e => !e.classList.contains('open')))

// tablet 2-col sanity at 760? grid stays single below 480, 2 cols at 760? spec only requires single at 390
await p.setViewportSize({ width: 1440, height: 1000 })

console.log(`\n${ok} passed, ${bad} failed`)
process.exit(bad ? 1 : 0)
