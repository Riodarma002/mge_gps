import { useUnitFilter } from '../../hooks/useUnitFilter'
import useGisStore from '../../store/useGisStore'

const FILTERS = [
  { id: 'all',       label: 'Semua',     color: '#8b949e' },
  { id: 'online',    label: 'Online',    color: '#26d97f' },
  { id: 'idle',      label: 'Idle',      color: '#f0a500' },
  { id: 'offline',   label: 'Offline',   color: '#f85149' },
  { id: 'no_signal', label: 'No Signal', color: '#6e7681' },
]

export default function FilterBar() {
  const activeFilter = useGisStore((s) => s.activeFilter)
  const setActiveFilter = useGisStore((s) => s.setActiveFilter)
  const { counts } = useUnitFilter()

  return (
    <div className="filter-bar">
      {FILTERS.map((f) => {
        const count = counts[f.id] ?? 0
        const isActive = activeFilter === f.id
        return (
          <button
            key={f.id}
            className={`filter-chip ${isActive ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.id)}
            style={isActive ? {
              background: `${f.color}22`,
              borderColor: f.color,
              color: f.color,
            } : {}}
          >
            {f.id !== 'all' && (
              <span
                className="filter-dot"
                style={{ background: f.color }}
              />
            )}
            {f.label}
            <span className="filter-count" style={isActive ? { background: f.color, color: '#0d1117' } : {}}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
