import type { Photo } from '../data/photos'
import { categoryLabel } from '../data/photos'
import { useLightbox } from '../context/AppContext'
import { PhotoImage, RatioBox } from './RatioBox'

interface PhotoCardProps {
  photos: Photo[]
  photo: Photo
  index: number
}

// /work 网格中的单张照片。点击打开全局灯箱，可浏览范围由父级传入的 photos 决定，
// 因此筛选后灯箱只会在筛选子集内切换。
export function PhotoCard({ photos, photo, index }: PhotoCardProps) {
  const { open } = useLightbox()

  return (
    <button
      type="button"
      className="photo-button"
      onClick={() => open(photos, index)}
      aria-label={`查看照片《${photo.title}》`}
    >
      <RatioBox photo={photo} className="photo-frame">
        <PhotoImage photo={photo} />
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
      <span className="photo-meta">
        <strong>{photo.title}</strong>
        <span className="photo-category">{categoryLabel(photo.category)}</span>
      </span>
    </button>
  )
}
