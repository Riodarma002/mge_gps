import { useEffect, useState, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import useGisStore from '../../store/useGisStore'
import { MAP_CENTER, MAP_ZOOM } from '../../config/mapConfig'

const LAYER_OPTIONS = [
  { id: 'osm',            label: 'OSM',       icon: '🗺️' },
  { id: 'google_roadmap', label: 'G.Maps',    icon: '📍' },
  { id: 'google_satellite', label: 'Satellite', icon: '🛰️' },
  { id: 'google_hybrid',  label: 'Hybrid',    icon: '🗺️' },
  { id: 'mapbox',         label: 'Mapbox',    icon: '🌍' },
]

export default function LayerControl() {
  const map = useMap()
  const activeLayer      = useGisStore((s) => s.activeLayer)
  const setActiveLayer   = useGisStore((s) => s.setActiveLayer)
  const activeOverlays   = useGisStore((s) => s.activeOverlays)
  const toggleOverlay    = useGisStore((s) => s.toggleOverlay)
  const customLinkLayers = useGisStore((s) => s.customLinkLayers)
  const addLinkLayer     = useGisStore((s) => s.addLinkLayer)
  const removeLinkLayer  = useGisStore((s) => s.removeLinkLayer)
  const bringLayerForward = useGisStore((s) => s.bringLayerForward)
  const sendLayerBackward = useGisStore((s) => s.sendLayerBackward)

  const [panelOpen, setPanelOpen] = useState(false)
  const panelRef = useRef(null)
  const zoomRef  = useRef(null)

  // Disable Leaflet map interactions on controls
  useEffect(() => {
    if (panelRef.current) {
      L.DomEvent.disableClickPropagation(panelRef.current)
      L.DomEvent.disableScrollPropagation(panelRef.current)
    }
    if (zoomRef.current) {
      L.DomEvent.disableClickPropagation(zoomRef.current)
      L.DomEvent.disableScrollPropagation(zoomRef.current)
    }
  })

  // Tutup panel saat klik di luar
  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false)
      }
    }
    if (panelOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [panelOpen])

  const handleCenter = () => {
    map.flyTo(MAP_CENTER, MAP_ZOOM, { animate: true })
    setPanelOpen(false)
  }

  const handleAddCustomLink = () => {
    const name = prompt("Masukkan Nama Peta Web Baru:")
    if (!name) return
    const url = prompt("Masukkan URL Tile Peta (contoh: https://.../{z}/{x}/{y}.png):")
    if (!url) return
    const id = 'custom_link_' + Date.now()
    addLinkLayer({ id, name, url, isCustomLink: true })
  }

  // Urutkan custom mapbox overlays agar sesuai z-index (yang tertinggi di atas UI)
  const sortedCustomLayers = [...customLinkLayers].sort((a, b) => {
    const idxA = activeOverlays.indexOf(a.id)
    const idxB = activeOverlays.indexOf(b.id)
    if (idxA !== -1 && idxB !== -1) return idxB - idxA
    if (idxA !== -1) return -1
    if (idxB !== -1) return 1
    return a.id.localeCompare(b.id)
  })

  return (
    <>
      {/* Zoom controls — bottom center */}
      <div className="zoom-controls-bottom" ref={zoomRef}>
        <button className="control-btn" onClick={() => map.zoomIn()}  title="Zoom In">+</button>
        <button className="control-btn" onClick={() => map.zoomOut()} title="Zoom Out">−</button>
      </div>

      <div className="map-controls" ref={panelRef}>

      {/* Zoom controls — rendered separately at bottom-center via CSS */}

      {/* Toggle Panel Button — pill shape */}
      <button
        className={`layer-toggle-btn${panelOpen ? ' panel-open' : ''}`}
        onClick={() => setPanelOpen(v => !v)}
        title={panelOpen ? 'Tutup panel layer' : 'Buka panel layer'}
      >
        <span className="layer-toggle-icon">🗂️</span>
        <span>Base Layer</span>
        <span className={`layer-toggle-chevron${panelOpen ? ' rotated' : ''}`}>▼</span>
      </button>

      {/* Compass / center map */}
      <button
        className="control-btn compass-btn"
        onClick={handleCenter}
        title="Pusatkan Peta"
      >
        🗺️
      </button>

      {/* Panel Drop-down */}
      {panelOpen && (
        <div className="layer-panel">

          {/* ── Base Layer ── */}
          <div className="layer-control-title">Base Layer</div>
          {LAYER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`layer-btn ${activeLayer === opt.id ? 'active' : ''}`}
              onClick={() => setActiveLayer(opt.id)}
              title={opt.label}
            >
              <span className="layer-icon">{opt.icon}</span>
              <span className="layer-label">{opt.label}</span>
            </button>
          ))}

          {/* ── Drone Overlays ── */}
          <div className="layer-control-title">
            <span>Mapbox Overlays</span>
          </div>

          {/* Tidak ada overlay */}
          {customLinkLayers.length === 0 && (
            <div style={{ fontSize: '11px', color: '#888', padding: '10px', textAlign: 'center', lineHeight: 1.5 }}>
               Tidak ada overlay Mapbox.
            </div>
          )}


          {/* Custom Web Link overlays */}
          {sortedCustomLayers.map(layer => {
            const isActive = activeOverlays.includes(layer.id)
            return (
              <div key={layer.id} style={{ display: 'flex', marginBottom: '3px' }}>
                <button
                  className={`layer-btn ${isActive ? 'active' : ''}`}
                  onClick={() => toggleOverlay(layer.id)}
                  style={{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0, margin: 0 }}
                  title={layer.url}
                >
                  <span className="layer-icon">🔗</span>
                  <span className="layer-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                    <span style={{ color: '#6e7681', fontSize: '9px' }}>Web Link</span>
                    <span>{layer.name}</span>
                  </span>
                </button>
                {isActive && (
                  <div style={{ display: 'flex', flexDirection: 'column', width: '22px' }}>
                    <button
                      onClick={() => bringLayerForward(layer.id)}
                      style={{ flex: 1, background: 'rgba(38,217,127,0.2)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '9px' }}
                      title="Pindah ke Atas"
                    >▲</button>
                    <button
                      onClick={() => sendLayerBackward(layer.id)}
                      style={{ flex: 1, background: 'rgba(38,217,127,0.05)', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '9px' }}
                      title="Pindah ke Bawah"
                    >▼</button>
                  </div>
                )}
                <button
                  onClick={() => { if (window.confirm(`Hapus "${layer.name}"?`)) removeLinkLayer(layer.id) }}
                  style={{ padding: '0 8px', background: 'var(--bg-card)', color: '#f85149', border: '1px solid var(--border-light)', borderLeft: 'none', borderTopRightRadius: '6px', borderBottomRightRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Hapus layer ini"
                >✖</button>
              </div>
            )
          })}

          {/* Tambah Peta Link */}
          <button
            className="layer-btn"
            style={{ justifyContent: 'center', background: 'rgba(38,217,127,0.07)', color: '#26d97f', border: 'none', borderTop: '1px dashed rgba(38,217,127,0.3)' }}
            onClick={handleAddCustomLink}
          >
            ➕ Tambah Peta Link
          </button>
        </div>
      )}
    </div>
    </>
  )
}
