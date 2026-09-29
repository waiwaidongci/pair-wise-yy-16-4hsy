import photosJson from '../data/photos.json'

export type CategoryId = 'portrait' | 'landscape' | 'pastoral'
export type FilterId = 'all' | CategoryId

export interface Category {
  id: CategoryId
  label: string
}

export interface Series {
  id: string
  title: string
  category: CategoryId
  summary: string
  photoIds: string[]
}

export interface Photo {
  id: string
  category: CategoryId
  seriesId: string
  file: string
  title: string
  altText: string
  caption: string
  width: number
  height: number
  order: number
}

interface PhotoData {
  categories: Category[]
  series: Series[]
  photos: Photo[]
}

const data = photosJson as PhotoData

export const categories = data.categories
export const seriesList = data.series
export const photos = data.photos

const photoById = new Map(photos.map(p => [p.id, p]))

export function getPhoto(id: string): Photo {
  const photo = photoById.get(id)
  if (!photo) throw new Error(`未知照片 id：${id}`)
  return photo
}

export function getSeries(id: string): Series | undefined {
  return seriesList.find(s => s.id === id)
}

export function categoryLabel(id: string): string {
  return categories.find(c => c.id === id)?.label ?? id
}

/** Photos of a series, in narrative order — the ONLY way pages obtain them. */
export function photosBySeries(seriesId: string): Photo[] {
  return photos
    .filter(p => p.seriesId === seriesId)
    .sort((a, b) => a.order - b.order)
}

/** Grid ordering: keep the data file's category/photo order (portrait first). */
export function photosByFilter(filter: FilterId): Photo[] {
  if (filter === 'all') return photos
  return photos.filter(p => p.category === filter)
}

/** Public URL served out of public/ (synced from mock-data by scripts/sync-assets). */
export function photoSrc(photo: Photo): string {
  return `/${photo.file}`
}
