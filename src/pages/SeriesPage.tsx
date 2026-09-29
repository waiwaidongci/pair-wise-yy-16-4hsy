import { Link, Navigate, useParams } from 'react-router-dom'
import {
  categoryLabel,
  getSeries,
  photoSrc,
  photosBySeries,
} from '../lib/photos'
import { useLightbox } from '../lib/lightbox-context'
import RatioImage from '../components/RatioImage'

export default function SeriesPage() {
  const { seriesId } = useParams<{ seriesId: string }>()
  const series = seriesId ? getSeries(seriesId) : undefined
  const { openLightbox } = useLightbox()

  if (!series) return <Navigate to="/work" replace />

  const storyPhotos = photosBySeries(series.id)
  const cover = storyPhotos[0]
  const quoteAfter = Math.floor(storyPhotos.length / 2)

  return (
    <div className="series-page">
      <section className="series-hero">
        <img
          className="series-hero-bg"
          src={photoSrc(cover)}
          alt={cover.altText}
          width={cover.width}
          height={cover.height}
        />
        <div className="series-hero-scrim" />
        <div className="series-hero-content">
          <p className="eyebrow">{categoryLabel(series.category)}</p>
          <h1>{series.title}</h1>
          <p className="series-hero-summary">{series.summary}</p>
        </div>
      </section>

      <div className="page">
        <Link className="back-link text-link" to="/work">
          <span aria-hidden="true">←</span> 返回作品集
        </Link>

        <div className="story">
          {storyPhotos.map((photo, index) => (
            <div key={photo.id}>
              <article className={`story-block ${index % 2 === 1 ? 'reverse' : ''}`}>
                <button
                  type="button"
                  className="story-photo photo-button"
                  onClick={() => openLightbox(storyPhotos, index)}
                  aria-label={`查看照片：${photo.title}`}
                >
                  <RatioImage photo={photo} />
                </button>
                <div className="story-text">
                  <p className="story-index">
                    {String(index + 1).padStart(2, '0')} / {String(storyPhotos.length).padStart(2, '0')}
                  </p>
                  <h2>{photo.title}</h2>
                  <p>{photo.caption}</p>
                </div>
              </article>

              {index === quoteAfter - 1 && (
                <blockquote className="pull-quote">
                  {series.summary}
                </blockquote>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
