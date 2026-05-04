import { Activity, RefreshCw, AlertCircle } from 'lucide-react'
import { useUnitFilter } from '../../hooks/useUnitFilter'
import useGisStore from '../../store/useGisStore'
import CustomLogo from '../../assets/logo_mge.png'

const STATS = [
  { key: 'all',       label: 'Total',      color: '#8b949e' },
  { key: 'online',    label: 'Online',     color: '#26d97f' },
  { key: 'idle',      label: 'Idle',       color: '#f0a500' },
  { key: 'offline',   label: 'Offline',    color: '#f85149' },
  { key: 'no_signal', label: 'No Signal',  color: '#6e7681' },
]

export default function StatsBar({ onReload }) {
  const { counts } = useUnitFilter()
  const loading = useGisStore((s) => s.loading)
  const error = useGisStore((s) => s.error)
  const lastUpdate = useGisStore((s) => s.lastUpdate)

  const formatTime = (date) => {
    if (!date) return '--:--'
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="stats-bar">
      {/* Logo / brand */}
      <div className="stats-brand">
        <img src={CustomLogo} alt="WebGIS Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
        <span className="stats-brand-name">Planning Unit Monitoring</span>
      </div>

      {/* Stats */}
      <div className="stats-counts">
        {STATS.map((s) => (
          <div key={s.key} className="stat-item">
            <span className="stat-count" style={{ color: s.color }}>
              {counts[s.key] ?? 0}
            </span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Right side: update time + reload */}
      <div className="stats-right">
        {error && (
          <div className="stats-error">
            <AlertCircle size={13} color="#f85149" />
            <span>Error: {error.slice(0, 40)}</span>
          </div>
        )}
        {lastUpdate && !error && (
          <span className="stats-update-time">
            Update: {formatTime(lastUpdate)}
          </span>
        )}
        <button
          className={`reload-btn ${loading ? 'loading' : ''}`}
          onClick={onReload}
          disabled={loading}
          title="Refresh data"
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
        </button>
      </div>
    </div>
  )
}
