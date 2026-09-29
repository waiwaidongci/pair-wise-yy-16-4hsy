import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } })
const B = 'http://127.0.0.1:5173'

// /work all (masonry, mixed ratios)
await p.goto(B + '/work', { waitUntil: 'networkidle' })
await p.screenshot({ path: 'verify-shots/work-all.png', fullPage: true })

// /work pastoral filter
await p.getByRole('button', { name: '牧野' }).click()
await p.waitForFunction(() => document.querySelectorAll('.photo-button').length === 4)
await p.waitForTimeout(200)
await p.screenshot({ path: 'verify-shots/b-work-pastoral.png' })

// lightbox on pastoral subset, from 2nd photo
await p.locator('.photo-button').nth(1).click()
await p.locator('.lightbox').waitFor()
await p.waitForTimeout(300)
await p.screenshot({ path: 'verify-shots/c-lightbox.png' })
await p.keyboard.press('Escape')

// series
await p.goto(B + '/work/highland-pastoral', { waitUntil: 'networkidle' })
await p.screenshot({ path: 'verify-shots/d-series.png', fullPage: true })

// about
await p.goto(B + '/about', { waitUntil: 'networkidle' })
await p.screenshot({ path: 'verify-shots/about.png', fullPage: true })

// contact error + success
await p.goto(B + '/contact', { waitUntil: 'networkidle' })
await p.getByLabel('邮箱').fill('bad')
await p.getByLabel('邮箱').blur()
await p.waitForTimeout(200)
await p.screenshot({ path: 'verify-shots/f1-contact-error.png' })
await p.getByLabel('姓名').fill('访客')
await p.getByLabel('邮箱').fill('hello@example.com')
await p.getByLabel('留言').fill('想约一次高原上的肖像拍摄，想了解档期与合作方式。')
await p.getByRole('button', { name: '发送消息' }).click()
await p.getByText('谢谢你的来信').waitFor()
await p.screenshot({ path: 'verify-shots/f2-contact-success.png' })

// gaze series (portrait, checks alternating layout for 5 items)
await p.goto(B + '/work/gaze', { waitUntil: 'networkidle' })
await p.screenshot({ path: 'verify-shots/series-gaze.png', fullPage: true })

await b.close()
console.log('shots done')
