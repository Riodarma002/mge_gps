import { Marker, Popup } from 'react-leaflet'
import { createUnitIcon } from '../../utils/markerIcons'
import UnitPopup from './UnitPopup'

export default function UnitMarker({ unit, isSelected, onClick }) {
  const icon = createUnitIcon(unit)

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
