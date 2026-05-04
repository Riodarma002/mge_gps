import { create } from 'zustand'

// ─── Helpers LocalStorage ───────────────────────────────────────────────────
const LS_ACTIVE_OVERLAYS = 'gis_activeOverlays'
const LS_ACTIVE_LAYER    = 'gis_activeLayer'

function loadActiveOverlays() {
  try {
    const raw = localStorage.getItem(LS_ACTIVE_OVERLAYS)
    if (raw === null) return []
    const parsed = JSON.parse(raw)
    // Migration: jika tersimpan array kosong [] dari bug sesi lama, hapus → auto-ON saat load
    if (Array.isArray(parsed) && parsed.length === 0) {
      localStorage.removeItem(LS_ACTIVE_OVERLAYS)
      return []
    }
    return parsed
  } catch {
    return []
  }
}

function saveActiveOverlays(arr) {
  localStorage.setItem(LS_ACTIVE_OVERLAYS, JSON.stringify(arr))
}

// ─── Store ──────────────────────────────────────────────────────────────────
const useGisStore = create((set) => ({
  // Unit data
  units: [],
  setUnits: (units) => set({ units }),

  // Selected unit (for fly-to & highlight)
  selectedUnit: null,
  setSelectedUnit: (unit) => set({ selectedUnit: unit }),

  // Filter
  activeFilter: 'all',
  setActiveFilter: (filter) => set({ activeFilter: filter }),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Map state — persisted di localStorage
  activeLayer: localStorage.getItem(LS_ACTIVE_LAYER) || 'google_satellite',
  setActiveLayer: (layer) => {
    localStorage.setItem(LS_ACTIVE_LAYER, layer)
    set({ activeLayer: layer })
  },

  // Custom Map Tile Overlays dari tile-server (local mbtiles)
  availableLayers: [],
  
  /**
   * Set daftar layer dari tile-server.
   * Jika localStorage punya saved overlay → restore.
   * Jika belum pernah disimpan (kunjungan pertama) → aktifkan SEMUA layer secara default.
   */
  setAvailableLayers: (layers) => set((s) => {
    const localLayerIds = layers.map(l => l.id)
    const hasExistingSaved = localStorage.getItem(LS_ACTIVE_OVERLAYS) !== null

    let nextActive

    if (!hasExistingSaved) {
      // Kunjungan pertama — aktifkan SEMUA tiles lokal
      nextActive = [...localLayerIds]
    } else {
      // Ada preferensi tersimpan, tapi tambahkan layer BARU yg belum pernah ada
      const saved = loadActiveOverlays()
      const savedSet = new Set(saved)
      // Tambahkan layer baru yang belum pernah tersimpan sebelumnya (auto ON for new files)
      const newLayers = localLayerIds.filter(id => {
        // "baru" = tidak pernah dimatikan, dan tidak ada di saved sama sekali
        // Cek di s.availableLayers (layer yg sebelumnya diketahui)
        const wasKnownBefore = s.availableLayers.find(l => l.id === id)
        return !wasKnownBefore && !savedSet.has(id)
      })
      nextActive = [...new Set([...saved, ...newLayers])]
    }

    saveActiveOverlays(nextActive)
    return { availableLayers: layers, activeOverlays: nextActive }
  }),


  // Custom User Links (via UI) + Mapbox Drone defaults
  customLinkLayers: (() => {
    try {
      const raw = localStorage.getItem('customLinkLayers');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    // Jika kosong, masukkan tile khusus buatan mapbox sebagai default
    return [
      {
        id: 'mapbox_drone',
        name: 'Mapbox Drone: cpp33_south',
        url: `https://api.mapbox.com/v4/hendrapoernama.5v7j1wzv/{z}/{x}/{y}@2x.png?access_token=${import.meta.env.VITE_MAPBOX_TOKEN || ''}`,
        isCustomLink: true
      }
    ];
  })(),
  addLinkLayer: (layer) => set(s => {
    const fresh = [...s.customLinkLayers, layer]
    localStorage.setItem('customLinkLayers', JSON.stringify(fresh))
    return { customLinkLayers: fresh }
  }),
  removeLinkLayer: (layerId) => set(s => {
    const nextActive = s.activeOverlays.filter(id => id !== layerId)
    const fresh = s.customLinkLayers.filter(l => l.id !== layerId)
    localStorage.setItem('customLinkLayers', JSON.stringify(fresh))
    saveActiveOverlays(nextActive)
    return { customLinkLayers: fresh, activeOverlays: nextActive }
  }),

  // Active overlay IDs — persisted di localStorage
  activeOverlays: loadActiveOverlays(),
  toggleOverlay: (layerId) => set((s) => {
    const isActv = s.activeOverlays.includes(layerId)
    const nextActive = isActv
      ? s.activeOverlays.filter(id => id !== layerId)
      : [...s.activeOverlays, layerId]
    saveActiveOverlays(nextActive)
    return { activeOverlays: nextActive }
  }),
  bringLayerForward: (layerId) => set((s) => {
    const idx = s.activeOverlays.indexOf(layerId)
    if (idx === -1 || idx === s.activeOverlays.length - 1) return {}
    const arr = [...s.activeOverlays]
    const temp = arr[idx]
    arr[idx] = arr[idx + 1]
    arr[idx + 1] = temp
    saveActiveOverlays(arr)
    return { activeOverlays: arr }
  }),
  sendLayerBackward: (layerId) => set((s) => {
    const idx = s.activeOverlays.indexOf(layerId)
    if (idx <= 0) return {}
    const arr = [...s.activeOverlays]
    const temp = arr[idx]
    arr[idx] = arr[idx - 1]
    arr[idx - 1] = temp
    saveActiveOverlays(arr)
    return { activeOverlays: arr }
  }),

  // Sidebar collapsible
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // Loading & error
  loading: false,
  setLoading: (loading) => set({ loading }),
  error: null,
  setError: (error) => set({ error }),

  // Last update timestamp
  lastUpdate: null,
  setLastUpdate: (lastUpdate) => set({ lastUpdate }),
}))

export default useGisStore
