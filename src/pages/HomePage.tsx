import { Link } from 'react-router-dom'
import {
  categories,
  categoryLabel,
  getPhoto,
  photosBySeries,
  photoSrc,
  seriesList,
} from '../lib/photos'
import { useLightbox } from '../lib/lightbox-context'
import RatioImage from '../components/RatioImage'

export default function HomePage() {
  const { openLightbox } = useLightbox()
  // Hero uses a wide highland photograph (the site's visual world); featured
  // cards use each series' first photograph. All derived from photos.json.
  const heroPhoto = getPhoto('pastoral-01')

  const featured = seriesList.map(series => ({
    series,
    photos: photosBySeries(series.id),
  }))

  return (
    <>
      <section className="hero">
        <img
          className="hero-bg"
          src={photoSrc(heroPhoto)}
          alt={heroPhoto.altText}
          width={heroPhoto.width}
          height={heroPhoto.height}
        />
        <div className="hero-scrim" />
        <div className="hero-content">
          <p className="eyebrow">独立摄影师 · 高原与面孔</p>
          <h1 className="hero-title">在凝视与旷野之间</h1>
          <p className="hero-lede">
            我是林见山。过去七年，我在两种距离之间往返：镜头离皮肤不到一米，
            离地平线却有数十公里。这个网站收录了那些被凝视留下的痕迹——
            黑白人像的细微情绪，以及高原地区自然与牧场生活的辽阔节奏。
          </p>
          <Link className="text-link" to="/work">
            浏览全部作品 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="featured">
        <header className="section-head">
          <p className="eyebrow">精选作品</p>
          <h2>三个系列</h2>
        </header>

        <div className="series-grid">
          {featured.map(({ series, photos }) => {
            const cover = photos[0]
            return (
              <article className="series-card" key={series.id}>
                <button
                  type="button"
                  className="series-card-media photo-button"
                  onClick={() => openLightbox(photos, 0)}
                  aria-label={`打开《${series.title}》系列首图：${cover.title}`}
                >
                  <RatioImage photo={cover} />
                  <span className="photo-meta">
                    <strong>{series.title}</strong>
                    <span className="photo-category">
                      {categoryLabel(series.category)}
                    </span>
                  </span>
                </button>
                <div className="series-card-body">
                  <p className="series-summary">{series.summary}</p>
                  <Link className="text-link" to={`/work/${series.id}`}>
                    进入系列 <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            )
          })}
        </div>

        <p className="featured-categories">
          {categories.map(c => c.label).join(' · ')}
        </p>
      </section>
    </>
  )
}
