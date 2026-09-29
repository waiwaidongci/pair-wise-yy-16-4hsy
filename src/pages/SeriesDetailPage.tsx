import { Link, Navigate, useParams } from 'react-router-dom'
import { categoryLabel, getSeries, photoUrl, photosForSeries } from '../data/photos'
import { useLightbox } from '../context/AppContext'
import { PhotoImage, RatioBox } from '../components/RatioBox'

export function SeriesDetailPage() {
  const { seriesId } = useParams<{ seriesId: string }>()
  const seriesInfo = seriesId ? getSeries(seriesId) : undefined
  const photos = seriesId ? photosForSeries(seriesId) : []
  const { open } = useLightbox()

  if (!seriesInfo || !seriesId) return <Navigate to="/work" replace />

  const cover = photos[0]
  // 中间位置的一幅额外承担 pull-quote，形成参考图里「图文交替 + 引言」的节奏。
  const quoteIndex = Math.floor((photos.length - 1) / 2)

  return (
    <div className="series-page">
      <section className="series-hero">
        <img
          className="series-hero-bg"
          src={photoUrl(cover)}
          alt={cover.altText}
          width={cover.width}
          height={cover.height}
        />
        <div className="series-hero-scrim" aria-hidden="true" />
        <div className="series-hero-content">
          <p className="eyebrow">{categoryLabel(seriesInfo.category)} · 系列</p>
          <h1>{seriesInfo.title}</h1>
        </div>
      </section>

      <div className="page-section story">
        <p className="series-intro">
          <span className="quote-mark" aria-hidden="true">“</span>
          {seriesInfo.summary}
        </p>

        {photos.map((photo, index) => (
          <article
            key={photo.id}
            className={index % 2 === 1 ? 'story-block reverse' : 'story-block'}
          >
            <button
              type="button"
              className="photo-button story-media"
              onClick={() => open(photos, index)}
              aria-label={`查看照片《${photo.title}》`}
            >
              <RatioBox photo={photo} className="photo-frame">
                <PhotoImage photo={photo} />
                <span className="photo-index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="photo-hover" aria-hidden="true">
                  <span className="photo-view">
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                      <path
                        d="M12 5c-5 0-8.6 4.6-9.4 6.2-.2.4-.2.8 0 1.2C3.4 14.4 7 19 12 19s8.6-4.6 9.4-6.6c.2-.4.2-.8 0-1.2C20.6 9.6 17 5 12 5Zm0 11a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4Zm0-6.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8Z"
                        fill="currentColor"
                      />
                    </svg>
                    查看
                  </span>
                </span>
              </RatioBox>
            </button>

            <div className="story-text">
              <p className="story-order">第 {index + 1} 幅</p>
              <h2>{photo.title}</h2>
              <p className="story-caption">{photo.caption}</p>
              {index === quoteIndex && <blockquote className="pull-quote">{seriesInfo.summary}</blockquote>}
            </div>
          </article>
        ))}

        <div className="series-footer">
          <Link className="btn btn-ghost" to="/work">
            ← 返回作品集
          </Link>
        </div>
      </div>
    </div>
  )
}
