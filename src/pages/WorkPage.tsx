import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  categories,
  getSeries,
  photosByFilter,
  type FilterId,
} from '../lib/photos'
import { useFilter } from '../lib/filter-context'
import PhotoTile from '../components/PhotoTile'

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: '全部' },
  ...categories.map(c => ({ id: c.id as FilterId, label: c.label })),
]

export default function WorkPage() {
  const { filter, setFilter } = useFilter()
  const visible = useMemo(() => photosByFilter(filter), [filter])

  // A single-category filter maps 1:1 to one series; offer the narrative page.
  const activeSeries =
    filter === 'all' ? undefined : getSeries(visible[0]?.seriesId ?? '')

  return (
    <div className="page work-page">
      <header className="page-head">
        <p className="eyebrow">作品集</p>
        <h1>所有作品</h1>
        <p className="page-sub">从贴近面孔的凝视，到远离人群的高原。</p>
      </header>

      <div className="filters" role="group" aria-label="按分类筛选照片">
        {FILTERS.map(f => (
          <button
            key={f.id}
            type="button"
            className={filter === f.id ? 'active' : ''}
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="result-count" aria-live="polite">
        {visible.length} 张照片
      </p>

      {activeSeries && (
        <Link className="series-entry" to={`/work/${activeSeries.id}`}>
          进入该系列的完整图文 <span aria-hidden="true">→</span>
        </Link>
      )}

      <div className="photo-grid" data-filter={filter}>
        {visible.map((photo, index) => (
          <PhotoTile key={photo.id} photo={photo} list={visible} index={index} />
        ))}
      </div>
    </div>
  )
}
