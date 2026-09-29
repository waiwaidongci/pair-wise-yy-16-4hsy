import type { Photo } from '../lib/photos'
import { photoSrc } from '../lib/photos'

interface RatioImageProps {
  photo: Photo
  /** cover: cropped fill for grids / cards; contain: full frame for the lightbox */
  fit?: 'cover' | 'contain'
  eager?: boolean
  className?: string
}

/**
 * Renders a placeholder whose aspect ratio is derived from the real
 * width/height metadata, so the layout never shifts when the image decodes.
 */
export default function RatioImage({
  photo,
  fit = 'cover',
  eager = false,
  className,
}: RatioImageProps) {
  return (
    <div
      className={`ratio-box ${fit}${className ? ` ${className}` : ''}`}
      style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
    >
      <img
        src={photoSrc(photo)}
        alt={photo.altText}
        width={photo.width}
        height={photo.height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  )
}
