import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { MAP_CENTER, MAP_ZOOM, TILE_LAYERS } from '../../config/mapConfig'
import UnitMarker from './UnitMarker'
import LayerControl from './LayerControl'
import useGisStore from '../../store/useGisStore'
import { useUnitFilter } from '../../hooks/useUnitFilter'

// Component to handle auto-framing and fly-to interactions
function MapController() {
  const map = useMap()
  const selectedUnit = useGisStore((s) => s.selectedUnit)
  const units = useGisStore((s) => s.units)
  const initialFitDone = useRef(false)

  // 1. Auto fit to bounding box of all units on initial load
  useEffect(() => {
    if (!initialFitDone.current && units.length > 0) {
      const validUnits = units.filter(u => u.hasPosition)
      if (validUnits.length > 0) {
        const bounds = L.latLngBounds(validUnits.map(u => [u.lat, u.lng]))
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
        initialFitDone.current = true
      }
    }
  }, [units, map])

  // 2. Fly to specific selected unit
  useEffect(() => {
    if (selectedUnit && selectedUnit.hasPosition) {
      // Pertahankan level zoom saat ini jika zoom sudah lebih dari 16
      const currentZoom = map.getZoom()
      const targetZoom = Math.max(16, currentZoom)
      
      map.flyTo([selectedUnit.lat, selectedUnit.lng], targetZoom, {
        animate: true,
        duration: 1.2,
      })
    }
  }, [selectedUnit, map])

  return null
}

export default function MapView() {
  const { filteredUnits } = useUnitFilter()
  const activeLayer = useGisStore((s) => s.activeLayer)
  const selectedUnit = useGisStore((s) => s.selectedUnit)
  const setSelectedUnit = useGisStore((s) => s.setSelectedUnit)
  // ✔ Subscribe di sini, bukan di dalam .map() — menghindari Rules of Hooks violation
  const activeOverlays    = useGisStore((s) => s.activeOverlays)
  const customLinkLayers  = useGisStore((s) => s.customLinkLayers)

  const currentTile = TILE_LAYERS[activeLayer] || TILE_LAYERS.custom
  const isGoogle = currentTile.type === 'google'

  return (
    <div className="map-container">
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        zoomControl={false}
        style={{ width: '100%', height: '100%' }}
        preferCanvas={true}
      >
        <MapController />
        <LayerControl />

        {/* Base Layer (Google/OSM/Mapbox) */}
        {!isGoogle && activeLayer !== 'custom' && (
          <TileLayer
            key={activeLayer}
            url={currentTile.url}
            attribution={currentTile.attribution}
            maxNativeZoom={currentTile.maxZoom ?? 19}
            maxZoom={28}
            tileSize={currentTile.tileSize ?? 256}
            zoomOffset={currentTile.zoomOffset ?? 0}
          />
        )}

        {isGoogle && (
          <GoogleTileLayer type={currentTile.googleType} />
        )}

        {/* Dynamic Overlay Maps (Mapbox Web Links) */}
        {activeOverlays.map((layerId, index) => {
          const layerDef = customLinkLayers.find(l => l.id === layerId)

          if (!layerDef) return null

          return (
            <TileLayer
              key={layerId}
              url={layerDef.url}
              zIndex={10 + index}
              bounds={layerDef.bounds || undefined}
              minNativeZoom={Math.max(layerDef.minZoom || 0, 12)}
              maxNativeZoom={layerDef.maxZoom || 16}
              maxZoom={28}
              errorTileUrl="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            />
          )
        })}

        {/* Unit Markers */}
        {filteredUnits
          .filter((u) => u.hasPosition)
          .map((unit) => (
            <UnitMarker
              key={unit.id}
              unit={unit}
              isSelected={selectedUnit?.id === unit.id}
              onClick={() => setSelectedUnit(unit)}
            />
          ))}
      </MapContainer>
    </div>
  )
}

// Google Maps tile layer using standard Google tile URLs
function GoogleTileLayer({ type }) {
  const typeMap = {
    roadmap:   'm',
    satellite: 's',
    hybrid:    'y',
    terrain:   'p',
  }
  const t = typeMap[type] || 'm'
  const url = `https://mt1.google.com/vt/lyrs=${t}&x={x}&y={y}&z={z}`

  return (
    <TileLayer
      key={`google-${type}`}
      url={url}
      attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
      maxNativeZoom={20}
      maxZoom={28}
    />
  )
}
