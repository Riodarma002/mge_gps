import { useMemo } from 'react'
import { Marker, Popup } from 'react-leaflet'
import { createUnitIcon } from '../../utils/markerIcons'
import UnitPopup from './UnitPopup'

export default function UnitMarker({ unit, isSelected, onClick }) {
  // Memoize icon — hanya buat ulang jika data yang relevan berubah.
  // Ini mencegah Leaflet me-remount marker (yang menyebabkan jitter/goyang)
  // pada setiap siklus polling 10 detik.
  const icon = useMemo(
    () => createUnitIcon(unit),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unit.id, unit.lat, unit.lng, unit.speed, unit.course, unit.status, unit.name]
  )

  return (
    <Marker
      position={[unit.lat, unit.lng]}
      icon={icon}
      eventHandlers={{
        click: onClick,
      }}
      zIndexOffset={isSelected ? 1000 : 0}
    >
      <Popup
        minWidth={260}
        maxWidth={300}
        className="unit-popup"
        autoPan={false}
      >
        <UnitPopup unit={unit} />
      </Popup>
    </Marker>
  )
}
