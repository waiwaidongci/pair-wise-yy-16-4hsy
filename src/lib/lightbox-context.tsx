import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Photo } from './photos'

interface LightboxState {
  /** The exact list the lightbox may navigate within (e.g. a filtered subset). */
  list: Photo[]
  index: number
}

interface LightboxContextValue {
  openLightbox: (list: Photo[], index: number) => void
  closeLightbox: () => void
  showPrev: () => void
  showNext: () => void
  state: LightboxState | null
}

const LightboxContext = createContext<LightboxContextValue | null>(null)

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState | null>(null)

  const openLightbox = useCallback((list: Photo[], index: number) => {
    if (list.length === 0) return
    setState({ list, index: Math.min(Math.max(index, 0), list.length - 1) })
  }, [])

  const closeLightbox = useCallback(() => setState(null), [])

  const step = useCallback((delta: number) => {
    setState(current => {
      if (!current) return current
      const { list, index } = current
      const next = (index + delta + list.length) % list.length
      return { list, index: next }
    })
  }, [])

  const showPrev = useCallback(() => step(-1), [step])
  const showNext = useCallback(() => step(1), [step])

  const value = useMemo(
    () => ({ openLightbox, closeLightbox, showPrev, showNext, state }),
    [openLightbox, closeLightbox, showPrev, showNext, state],
  )

  return <LightboxContext.Provider value={value}>{children}</LightboxContext.Provider>
}

export function useLightbox(): LightboxContextValue {
  const ctx = useContext(LightboxContext)
  if (!ctx) throw new Error('useLightbox 必须在 <LightboxProvider> 内使用')
  return ctx
}
