import { Link } from 'react-router-dom'
import { getPhoto, photoUrl } from '../data/photos'

const TIMELINE = [
  {
    year: '2014',
    title: '开始自学黑白摄影',
    text: '在一间朝北的暗房里学会等待显影，也学会了在按快门之前先屏住呼吸。',
  },
  {
    year: '2017',
    title: '《凝视》系列启动',
    text: '历时三年拍摄二十余位普通人，特写里只留下眼神、皮肤纹理与沉默。',
  },
  {
    year: '2019',
    title: '第一次进入高原无人区',
    text: '沿横断山脉徒步四十天，开始记录山脊、草甸与雾气在不同光线下的变化。',
  },
  {
    year: '2020',
    title: '《高原牧歌》长驻拍摄',
    text: '与川西牧场的三户人家共同度过四个转场季，记录牛群、木屋与人的日常节奏。',
  },
  {
    year: '2023',
    title: '同名摄影集出版',
    text: '三个系列结集为《在高处与在近处》，于独立书店与画廊进行巡回展映。',
  },
]

export function AboutPage() {
  const portrait = getPhoto('portrait-01')

  return (
    <div className="about-page">
      <div className="about-split">
        <div className="about-portrait">
          <img
            src={photoUrl(portrait)}
            alt={portrait.altText}
            width={portrait.width}
            height={portrait.height}
          />
        </div>

        <section className="about-content page-section">
          <p className="eyebrow">About</p>
          <h1>关于林昭</h1>

          <div className="about-bio">
            <p>
              林昭，独立摄影师，1992 年生于南方小城，现居川西。她的镜头长期停留在两处：
              人脸之上最细微的情绪，以及高海拔地区近乎无人的地貌。
            </p>
            <p>
              她相信照片是一种缓慢的语言——不急于说明，只负责留下光曾经停留过的证据。
              过去十年间，她的作品发表于若干独立摄影刊物，并通过画册与小型展览与读者相见。
            </p>
          </div>

          <h2 className="timeline-title">经历</h2>
          <ol className="timeline">
            {TIMELINE.map((item) => (
              <li key={item.year} className="timeline-item">
                <span className="timeline-dot" aria-hidden="true" />
                <div className="timeline-body">
                  <p className="timeline-year">{item.year}</p>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="about-cta">
            <Link className="btn btn-gold" to="/contact">
              邀约合作
            </Link>
            <Link className="btn btn-ghost" to="/work">
              查看作品
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
