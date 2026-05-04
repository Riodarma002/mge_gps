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
