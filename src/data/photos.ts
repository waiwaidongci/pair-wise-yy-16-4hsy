// 全站唯一内容数据源：mock-data/photos.json（构建期拷入 src/data）。
// 作品集网格、系列详情、首页精选、灯箱都从这里派生，禁止在组件中另写一份。
import raw from './photos.json'

export type CategoryId = 'portrait' | 'landscape' | 'pastoral'
export type FilterValue = 'all' | CategoryId

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

export interface Series {
  id: string
  title: string
  category: CategoryId
  summary: string
  photoIds: string[]
}

export interface Category {
  id: CategoryId
  label: string
}

interface PhotoData {
  categories: Category[]
  series: Series[]
  photos: Photo[]
}

const data = raw as PhotoData

export const categories: Category[] = data.categories
export const series: Series[] = data.series

const photoById = new Map<string, Photo>(data.photos.map((p) => [p.id, p]))

export function getPhoto(id: string): Photo {
  const photo = photoById.get(id)
  if (!photo) throw new Error(`photos.json 中找不到照片：${id}`)
  return photo
}

// mock-data 中的 file 是相对 public/ 的路径（photos/<category>/<id>.jpg）
export function photoUrl(photo: Photo): string {
  return `/${photo.file}`
}

export function categoryLabel(id: string): string {
  return data.categories.find((c) => c.id === id)?.label ?? id
}

export function getSeries(id: string): Series | undefined {
  return data.series.find((s) => s.id === id)
}

export function photosForSeries(seriesId: string): Photo[] {
  return data.photos
    .filter((p) => p.seriesId === seriesId)
    .sort((a, b) => a.order - b.order)
}

export function photosForFilter(filter: FilterValue): Photo[] {
  return filter === 'all'
    ? data.photos
    : data.photos.filter((p) => p.category === filter)
}
