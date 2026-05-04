import { Gauge, Navigation, MapPin, Clock, Layers } from 'lucide-react'
import { getStatusConfig, formatSpeed, formatTimestamp, formatCoord, formatAge } from '../../utils/statusHelper'

export default function UnitPopup({ unit }) {
  const cfg = getStatusConfig(unit.status)

  const openLocator = () => {
    const token = import.meta.env.VITE_WIALON_TOKEN
    window.open(
      `https://eyes.ptdigital.co.id/locator/index.html?t=${token}&allUnitsEnabled=0&map=gurtam_maps`,
      '_blank'
    )
  }

  return (
    <div className="popup-content">
      {/* Header */}
      <div className="popup-header" style={{ borderColor: cfg.color }}>
        <div className="popup-title-row">
          <span className="popup-unit-name">{unit.name}</span>
          <span className="popup-badge" style={{ color: cfg.color, background: cfg.bgColor, border: `1px solid ${cfg.borderColor}` }}>
            <span className="popup-badge-dot" style={{ background: cfg.color }} />
            {cfg.label}
          </span>
        </div>
        {unit.description && (
          <span className="popup-desc">{unit.description}</span>
        )}
      </div>

      {/* Info rows */}
      <div className="popup-body">
        {/* Position */}
        {unit.hasPosition && (
          <div className="popup-info-row">
            <MapPin size={13} color="#6e7681" />
            <span className="popup-info-label">Posisi</span>
            <span className="popup-info-val">
              {formatCoord(unit.lat, 'lat')}, {formatCoord(unit.lng, 'lng')}
            </span>
          </div>
        )}

        {/* Speed */}
        <div className="popup-info-row">
          <Gauge size={13} color="#6e7681" />
          <span className="popup-info-label">Kecepatan</span>
          <span className="popup-info-val">{formatSpeed(unit.speed)}</span>
        </div>

        {/* Course */}
        {unit.status === 'online' && (
          <div className="popup-info-row">
            <Navigation size={13} color="#6e7681" style={{ transform: `rotate(${unit.course}deg)` }} />
            <span className="popup-info-label">Arah</span>
            <span className="popup-info-val">{unit.course}°</span>
          </div>
        )}

        {/* Last update */}
        <div className="popup-info-row">
          <Clock size={13} color="#6e7681" />
          <span className="popup-info-label">Update</span>
          <span className="popup-info-val muted">{formatAge(unit.timestamp)}</span>
        </div>

        {/* Timestamp */}
        <div className="popup-info-row">
          <Layers size={13} color="#6e7681" />
          <span className="popup-info-label">Waktu</span>
          <span className="popup-info-val muted">{formatTimestamp(unit.timestamp)}</span>
        </div>
      </div>

      {/* Footer */}
      <button className="popup-locator-btn" onClick={openLocator}>
        Buka di Locator ↗
      </button>
    </div>
  )
}
