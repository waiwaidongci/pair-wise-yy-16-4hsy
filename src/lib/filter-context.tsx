import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { FilterId } from './photos'

// Lives above the router so the /work page can unmount (e.g. when visiting a
// series page) without losing the user's chosen category filter.
interface FilterContextValue {
  filter: FilterId
  setFilter: (filter: FilterId) => void
}

const FilterContext = createContext<FilterContextValue | null>(null)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<FilterId>('all')
  const value = useMemo(() => ({ filter, setFilter }), [filter])
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export function useFilter(): FilterContextValue {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilter 必须在 <FilterProvider> 内使用')
  return ctx
}
