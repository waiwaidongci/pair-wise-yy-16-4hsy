import { getPhoto, photoSrc } from '../lib/photos'

const TIMELINE: { year: string; title: string; detail: string }[] = [
  {
    year: '2013',
    title: '开始拍照',
    detail: '在西宁的一家暗房做学徒，第一次看着影像在显影液里浮上来，决定把摄影当作长期的事。',
  },
  {
    year: '2016',
    title: '转向黑白肖像',
    detail: '完成第一组黑白人物特写《低垂》，开始在小画廊与独立杂志上发表，专注眼神与皮肤纹理。',
  },
  {
    year: '2018',
    title: '初上高原',
    detail: '因一次牧场委托进入海拔四千米的夏季牧场，此后每年固定前往，记录山脊、草甸与游牧的日常。',
  },
  {
    year: '2021',
    title: '系列《无人之境》完成',
    detail: '用三年时间走完同一片无人区的四季，作品在国内多个摄影节展出，地貌与雾成为新的主角。',
  },
  {
    year: '2024',
    title: '成为独立摄影师',
    detail: '离开商业摄影机构，专注个人系列与长期委托，现居成都，仍保持每年两次的高原行程。',
  },
]

export default function AboutPage() {
  // The portrait referenced on this page is a real photograph from the dataset.
  const portrait = getPhoto('portrait-01')

  return (
    <div className="page about-page">
      <div className="about-grid">
        <figure className="about-portrait">
          <img
            src={photoSrc(portrait)}
            alt={portrait.altText}
            width={portrait.width}
            height={portrait.height}
            loading="lazy"
          />
        </figure>

        <div className="about-content">
          <header className="page-head">
            <p className="eyebrow">关于</p>
            <h1>林见山</h1>
          </header>

          <div className="about-bio">
            <p>
              1990 年出生于青海，现居成都。我的拍摄在两类题材之间往返：
              一类是离得极近的黑白肖像特写，另一类是高海拔地区辽阔而安静的地貌与牧场。
            </p>
            <p>
              我习惯长时间地等——等一束侧光落上眼睑，等雾把山谷的边界收走，
              等一头牛在木屋旁停下脚步。快门按下之前，照片往往已经在那里，
              我只是没有走开。
            </p>
          </div>

          <ol className="timeline">
            {TIMELINE.map(item => (
              <li className="timeline-item" key={item.year}>
                <span className="timeline-dot" aria-hidden="true" />
                <div>
                  <p className="timeline-year">{item.year}</p>
                  <h2>{item.title}</h2>
                  <p>{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
