import { MapPin, Gauge, Wifi, WifiOff, Clock } from 'lucide-react'
import { getStatusConfig, formatSpeed, formatAge } from '../../utils/statusHelper'
import useGisStore from '../../store/useGisStore'

export default function UnitCard({ unit }) {
  const selectedUnit = useGisStore((s) => s.selectedUnit)
  const setSelectedUnit = useGisStore((s) => s.setSelectedUnit)

  const cfg = getStatusConfig(unit.status)
  const isSelected = selectedUnit?.id === unit.id

  const handleClick = () => {
    setSelectedUnit(isSelected ? null : unit)
  }

  return (
    <div
      className={`unit-card ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      style={isSelected ? { borderColor: cfg.color, background: `${cfg.color}08` } : {}}
    >
      {/* Status indicator line */}
      <div className="unit-card-status-bar" style={{ background: cfg.color }} />

      {/* Content */}
      <div className="unit-card-content">
        {/* Header row */}
        <div className="unit-card-header">
          <span className="unit-card-name">{unit.name}</span>
          <span className="unit-card-badge" style={{ color: cfg.color }}>
            <span className="unit-dot" style={{ background: cfg.color }} />
            {cfg.label}
          </span>
        </div>

        {/* Info row */}
        <div className="unit-card-meta">
          {unit.hasPosition ? (
            <span className="unit-meta-item">
              <MapPin size={11} />
              {unit.lat.toFixed(4)}, {unit.lng.toFixed(4)}
            </span>
          ) : (
            <span className="unit-meta-item muted">
              <WifiOff size={11} />
              Tidak ada posisi
            </span>
          )}
          <span className="unit-meta-item">
            <Gauge size={11} />
            {formatSpeed(unit.speed)}
          </span>
        </div>

        <div className="unit-card-time">
          <Clock size={10} />
          {formatAge(unit.timestamp)}
        </div>
      </div>
    </div>
  )
}
