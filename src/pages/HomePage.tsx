import { Link } from 'react-router-dom'
import {
  categoryLabel,
  getSeries,
  photoUrl,
  photosForSeries,
  series,
} from '../data/photos'
import { useLightbox } from '../context/AppContext'
import { PhotoImage } from '../components/RatioBox'

// 三个系列精选卡片：点击卡片主体打开共享灯箱（仅浏览该系列照片），
// 卡片上的链接负责进入系列长图文页。
function SeriesCard({ seriesId }: { seriesId: string }) {
  const item = getSeries(seriesId)!
  const photos = photosForSeries(seriesId)
  const cover = photos[0]
  const { open } = useLightbox()

  return (
    <article className="series-card-wrap">
      <button
        type="button"
        className="series-card"
        onClick={() => open(photos, 0)}
        aria-label={`预览《${item.title}》系列照片`}
      >
        {/* 精选封面统一采用 4:3 固定画框，三张卡片高度一致 */}
        <span className="series-cover">
          {/* 三张精选封面均为视口内内容，全部立即加载 */}
          <PhotoImage photo={cover} eager />
          <span className="series-card-overlay">
            <span className="series-card-text">
              <strong>{cover.title}</strong>
              <em>{categoryLabel(item.category)}</em>
            </span>
          </span>
        </span>
      </button>
      <div className="series-card-meta">
        <h3>{item.title}</h3>
        <p>{item.summary}</p>
        <Link className="series-card-link" to={`/work/${item.id}`}>
          进入系列
        </Link>
      </div>
    </article>
  )
}

export function HomePage() {
  // Hero 使用《无人之境》的末幅「雾谷」，人像留给三个系列入口
  const hero = photosForSeries('wilderness')[4]

  return (
    <div className="home-page">
      <section className="hero">
        <img
          className="hero-bg"
          src={photoUrl(hero!)}
          alt={hero!.altText}
          width={hero!.width}
          height={hero!.height}
        />
        <div className="hero-scrim" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow">独立摄影师 · 黑白肖像 / 高原记录</p>
          <h1 className="hero-title">林昭</h1>
          <p className="hero-bio">
            我在人脸上寻找没有说出口的话，也在海拔四千米以上寻找没有人的寂静。
            这里收录三个系列：《凝视》《无人之境》与《高原牧歌》。
          </p>
          <div className="hero-actions">
            <Link className="btn btn-gold" to="/work">
              浏览作品集
            </Link>
            <Link className="btn btn-ghost" to="/about">
              关于我
            </Link>
          </div>
        </div>
      </section>

      <section className="featured">
        <div className="section-heading">
          <h2>精选系列</h2>
          <span className="hairline" aria-hidden="true" />
          <p className="section-sub">三组长期拍摄计划，按系列进入完整长图文</p>
        </div>

        <div className="series-grid">
          {series.map((item) => (
            <SeriesCard key={item.id} seriesId={item.id} />
          ))}
        </div>
      </section>
    </div>
  )
}
