import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { categoryLabel, photoUrl } from '../data/photos'
import { useLightbox } from '../context/AppContext'

// 全站唯一的灯箱组件（非独立路由）。导航范围严格等于打开时传入的 photos 列表，
// 计数器格式：「分类 · 序号 / 总数」。
export function Lightbox() {
  const { photos, index, isOpen, close, prev, next } = useLightbox()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('lightbox-open')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('lightbox-open')
    }
  }, [isOpen, close, prev, next])

  // 预加载相邻图片，切换时无空白等待。
  useEffect(() => {
    if (!isOpen) return
    for (const offset of [-1, 1]) {
      const neighbor = (index + offset + photos.length) % photos.length
      const img = new Image()
      img.src = photoUrl(photos[neighbor])
    }
  }, [isOpen, index, photos])

  if (!isOpen) return null

  const photo = photos[index]
  const total = photos.length

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`照片《${photo.title}》大图查看`}
    >
      <div className="lightbox-backdrop" onClick={close} aria-hidden="true" />

      <button type="button" className="lightbox-close" onClick={close} aria-label="关闭">
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <path
            d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <button
        type="button"
        className="lightbox-nav lightbox-prev"
        onClick={prev}
        aria-label="上一张"
        disabled={total <= 1}
      >
        <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
          <path d="M15.4 4.6 8 12l7.4 7.4 1.4-1.4L10.8 12l6-6Z" fill="currentColor" />
        </svg>
      </button>
      <button
        type="button"
        className="lightbox-nav lightbox-next"
        onClick={next}
        aria-label="下一张"
        disabled={total <= 1}
      >
        <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
          <path d="M8.6 19.4 16 12 8.6 4.6 7.2 6l6 6-6 6Z" fill="currentColor" />
        </svg>
      </button>

      <div className="lightbox-stage">
        <figure className="lightbox-figure">
          <div className="lightbox-image-wrap">
            <img
              key={photo.id}
              className="lightbox-image"
              src={photoUrl(photo)}
              alt={photo.altText}
              width={photo.width}
              height={photo.height}
            />
          </div>
          <figcaption className="lightbox-info">
            <p className="eyebrow">
              {categoryLabel(photo.category)} · {index + 1} / {total}
            </p>
            <h2>{photo.title}</h2>
            <p className="lightbox-caption">{photo.caption}</p>
            <button
              type="button"
              className="lightbox-series-link"
              onClick={() => {
                close()
                navigate(`/work/${photo.seriesId}`)
              }}
            >
              查看所属系列 →
            </button>
          </figcaption>
        </figure>
      </div>
    </div>
  )
}
