import { useEffect } from 'react'
import { useLightbox } from '../lib/lightbox-context'
import { categoryLabel } from '../lib/photos'
import RatioImage from './RatioImage'

export default function Lightbox() {
  const { state, closeLightbox, showPrev, showNext } = useLightbox()

  useEffect(() => {
    if (!state) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLightbox()
      if (event.key === 'ArrowLeft') showPrev()
      if (event.key === 'ArrowRight') showNext()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [state, closeLightbox, showPrev, showNext])

  if (!state) return null

  const { list, index } = state
  const photo = list[index]
  const total = list.length
  // Touch-swipe support for the single-column mobile layout.
  let touchStartX = 0
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.changedTouches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(delta) > 48) (delta > 0 ? showPrev : showNext)()
  }

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.title} 灯箱预览`}
      onMouseDown={e => {
        if (e.target === e.currentTarget) closeLightbox()
      }}
    >
      <button
        type="button"
        className="lightbox-close icon-button"
        aria-label="关闭"
        onClick={closeLightbox}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {total > 1 && (
        <button
          type="button"
          className="lightbox-prev icon-button"
          aria-label="上一张"
          onClick={showPrev}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      {total > 1 && (
        <button
          type="button"
          className="lightbox-next icon-button"
          aria-label="下一张"
          onClick={showNext}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <div className="lightbox-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <RatioImage photo={photo} fit="contain" eager className="lightbox-image" />
        <div className="lightbox-info">
          <p className="eyebrow">
            {categoryLabel(photo.category)} · {index + 1} / {total}
          </p>
          <h2>{photo.title}</h2>
          <p className="lightbox-caption">{photo.caption}</p>
        </div>
      </div>
    </div>
  )
}
