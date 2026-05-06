// Map configuration - tile layers and default view
const TILE_URL = import.meta.env.VITE_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_LABEL = import.meta.env.VITE_TILE_LABEL || 'Custom Map'

export const MAP_CENTER = [
  parseFloat(import.meta.env.VITE_DEFAULT_LAT || '-6.178'),
  parseFloat(import.meta.env.VITE_DEFAULT_LNG || '106.630'),
]

export const MAP_ZOOM = parseInt(import.meta.env.VITE_DEFAULT_ZOOM || '9')

export const TILE_LAYERS = {
  custom: {
    id: 'custom',
    label: TILE_LABEL,
    url: TILE_URL,
    attribution: '&copy; Custom Tile Map',
    maxZoom: 20,
    tms: false,
  },
  osm: {
    id: 'osm',
    label: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    tms: false,
  },
  google_roadmap: {
    id: 'google_roadmap',
    label: 'Google Maps',
    type: 'google',
    googleType: 'roadmap',
    maxZoom: 20,
  },
  google_satellite: {
    id: 'google_satellite',
    label: 'Google Satellite',
    type: 'google',
    googleType: 'satellite',
    maxZoom: 20,
  },
  google_hybrid: {
    id: 'google_hybrid',
    label: 'Google Hybrid',
    type: 'google',
    googleType: 'hybrid',
    maxZoom: 20,
  },
  mapbox: {
    id: 'mapbox',
    label: 'Mapbox Streets',
    url: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/512/{z}/{x}/{y}?access_token=${import.meta.env.VITE_MAPBOX_TOKEN || ''}`,
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 22,
    zoomOffset: -1,
    tileSize: 512,
  },
}

// Helper untuk buat URL Mapbox tile dari ID tileset
const mbUrl = (tilesetId) =>
  `https://api.mapbox.com/v4/${tilesetId}/{z}/{x}/{y}@2x.png?access_token=${import.meta.env.VITE_MAPBOX_TOKEN || ''}`

/**
 * DEFAULT TILE OVERLAY LAYERS — Hardcoded, selalu ada di semua deployment.
 * Tambah/ubah entry di sini untuk mengatur tiles bawaan.
 *
 * isDefault: true  → Layer ini tidak bisa dihapus user dari UI.
 * autoOn: true     → Layer ini otomatis aktif saat pertama kali dibuka
 *                    (termasuk setelah fresh deploy ke Vercel).
 *
 * Untuk menambah tile baru:
 * { id: 'unik_id', name: 'Nama Peta', url: mbUrl('username.tilesetid'), isDefault: true, autoOn: true, isCustomLink: true }
 */
export const DEFAULT_LINK_LAYERS = [
  {
    id: 'default_jetty',
    name: 'Jetty',
    url: mbUrl('hendrapoernama.1nvtkn1g'),
    isDefault: true,
    autoOn: true,
    isCustomLink: true,
  },
  {
    id: 'default_km12',
    name: 'Km12',
    url: mbUrl('hendrapoernama.b9knhl5l'),
    isDefault: true,
    autoOn: true,
    isCustomLink: true,
  },
  {
    id: 'default_jalan_utara_selatan',
    name: 'Jalan Utara - Selatan',
    url: mbUrl('hendrapoernama.0cdq15q3'),
    isDefault: true,
    autoOn: true,
    isCustomLink: true,
  },
  {
    id: 'default_jetty_stockrom',
    name: 'Jetty - Stockrom',
    url: mbUrl('hendrapoernama.7bd4z4nv'),
    isDefault: true,
    autoOn: true,
    isCustomLink: true,
  },
  {
    id: 'default_pit_all_jo_utara',
    name: 'PIT All JO Utara',
    url: mbUrl('hendrapoernama.9aarafhz'),
    isDefault: true,
    autoOn: true,
    isCustomLink: true,
  },
  {
    id: 'default_cpp33',
    name: 'CPP33',
    url: mbUrl('hendrapoernama.2hc3u43l'),
    isDefault: true,
    autoOn: true,
    isCustomLink: true,
  },
  {
    id: 'default_mawar_shortcut',
    name: 'Mawar Shortcut',
    url: mbUrl('hendrapoernama.ayi0jg2c'),
    isDefault: true,
    autoOn: true,
    isCustomLink: true,
  },
  {
    id: 'default_pit_selatan',
    name: 'PIT Selatan',
    url: mbUrl('hendrapoernama.41yavqkb'),
    isDefault: true,
    autoOn: true,
    isCustomLink: true,
  },
  {
    id: 'default_pit_utara_jo',
    name: 'PIT Utara JO',
    url: mbUrl('hendrapoernama.djeqb8ym'),
    isDefault: true,
    autoOn: true,
    isCustomLink: true,
  },
]
