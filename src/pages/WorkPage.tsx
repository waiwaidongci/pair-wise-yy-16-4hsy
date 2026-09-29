import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  categories,
  getSeries,
  photosForFilter,
  type FilterValue,
} from '../data/photos'
import { useWorkFilter } from '../context/AppContext'
import { PhotoCard } from '../components/PhotoCard'

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: '全部' },
  ...categories.map((c) => ({ value: c.id as FilterValue, label: c.label })),
]

export function WorkPage() {
  const { filter, setFilter } = useWorkFilter()
  const photos = useMemo(() => photosForFilter(filter), [filter])

  // 每个真实分类恰好对应一个系列；筛选时提供进入该系列长图文的入口。
  const linkedSeries = filter === 'all' ? undefined : getSeriesByCategory(filter)

  return (
    <div className="work-page page-section">
      <header className="page-head">
        <p className="eyebrow">Portfolio</p>
        <h1>作品集</h1>
        <p className="page-intro">
          十四个瞬间，分属三个长期系列。按题材筛选，或进入任一系列读完整个故事。
        </p>
      </header>

      <div className="filters" role="group" aria-label="按分类筛选照片">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={filter === item.value ? 'filter-chip active' : 'filter-chip'}
            aria-pressed={filter === item.value}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}

        {linkedSeries && (
          <Link className="series-entry" to={`/work/${linkedSeries.id}`}>
            进入系列《{linkedSeries.title}》
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>

      <p className="result-count" aria-live="polite">
        {filter === 'all' ? '全部照片' : getSeriesByCategory(filter)?.title ?? ''}
        · {photos.length} 张
      </p>

      <div className="masonry">
        {photos.map((photo, index) => (
          <PhotoCard key={photo.id} photos={photos} photo={photo} index={index} />
        ))}
      </div>
    </div>
  )
}

function getSeriesByCategory(category: string) {
  return getSeries(
    category === 'portrait'
      ? 'gaze'
      : category === 'landscape'
        ? 'wilderness'
        : 'highland-pastoral',
  )
}
