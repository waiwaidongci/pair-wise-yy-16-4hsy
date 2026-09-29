import type { Photo } from '../lib/photos'
import { categoryLabel } from '../lib/photos'
import { useLightbox } from '../lib/lightbox-context'
import RatioImage from './RatioImage'

interface PhotoTileProps {
  photo: Photo
  list: Photo[]
  index: number
}

export default function PhotoTile({ photo, list, index }: PhotoTileProps) {
  const { openLightbox } = useLightbox()
  return (
    <button
      type="button"
      className="photo-button"
      onClick={() => openLightbox(list, index)}
      aria-label={`查看照片：${photo.title}`}
    >
      <RatioImage photo={photo} />
      <span className="photo-meta">
        <strong>{photo.title}</strong>
        <span className="photo-category">{categoryLabel(photo.category)}</span>
      </span>
    </button>
  )
}
