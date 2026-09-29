import type { CSSProperties, ReactNode } from 'react'
import type { Photo } from '../data/photos'
import { photoUrl } from '../data/photos'

// 按 photos.json 里记录的真实宽高预留位置，图片加载前后容器尺寸不变（避免 CLS）。
interface RatioBoxProps {
  photo: Photo
  className?: string
  children?: ReactNode
}

export function RatioBox({ photo, className, children }: RatioBoxProps) {
  const style: CSSProperties = { aspectRatio: `${photo.width} / ${photo.height}` }
  return (
    <span className={`ratio-box${className ? ` ${className}` : ''}`} style={style}>
      {children}
    </span>
  )
}

interface PhotoImageProps {
  photo: Photo
  eager?: boolean
}

export function PhotoImage({ photo, eager = false }: PhotoImageProps) {
  return (
    <img
      src={photoUrl(photo)}
      alt={photo.altText}
      width={photo.width}
      height={photo.height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}
