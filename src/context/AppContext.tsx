import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { FilterValue, Photo } from '../data/photos'

// 筛选状态提升到路由之外：/work 卸载（进入系列详情）再返回时，选择不会被重置。
interface WorkFilterContextValue {
  filter: FilterValue
  setFilter: (filter: FilterValue) => void
}

const WorkFilterContext = createContext<WorkFilterContextValue | null>(null)

export function WorkFilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<FilterValue>('all')
  const value = useMemo(() => ({ filter, setFilter }), [filter])
  return <WorkFilterContext.Provider value={value}>{children}</WorkFilterContext.Provider>
}

export function useWorkFilter(): WorkFilterContextValue {
  const ctx = useContext(WorkFilterContext)
  if (!ctx) throw new Error('useWorkFilter 必须在 WorkFilterProvider 内使用')
  return ctx
}

// 全局灯箱：任意页面打开的都是同一个组件实例。
// 调用方显式传入「本次可浏览的照片列表」，因此导航范围天然限定在
// 当前筛选结果 / 当前系列之内，而不是写死的全量 14 张。
interface LightboxContextValue {
  photos: Photo[]
  index: number
  isOpen: boolean
  open: (photos: Photo[], index: number) => void
  close: () => void
  prev: () => void
  next: () => void
}

const LightboxContext = createContext<LightboxContextValue | null>(null)

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [index, setIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback((nextPhotos: Photo[], nextIndex: number) => {
    if (nextPhotos.length === 0) return
    setPhotos(nextPhotos)
    setIndex(Math.min(Math.max(nextIndex, 0), nextPhotos.length - 1))
    setIsOpen(true)
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + photos.length) % photos.length)
  }, [photos.length])

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % photos.length)
  }, [photos.length])

  const value = useMemo(
    () => ({ photos, index, isOpen, open, close, prev, next }),
    [photos, index, isOpen, open, close, prev, next],
  )

  return <LightboxContext.Provider value={value}>{children}</LightboxContext.Provider>
}

export function useLightbox(): LightboxContextValue {
  const ctx = useContext(LightboxContext)
  if (!ctx) throw new Error('useLightbox 必须在 LightboxProvider 内使用')
  return ctx
}
