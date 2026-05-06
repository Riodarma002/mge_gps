import { create } from 'zustand'
import { DEFAULT_LINK_LAYERS } from '../config/mapConfig'

// ─── Helpers LocalStorage ───────────────────────────────────────────────────
const LS_ACTIVE_OVERLAYS  = 'gis_activeOverlays'
const LS_ACTIVE_LAYER     = 'gis_activeLayer'
const LS_KNOWN_DEFAULTS   = 'gis_knownDefaults' // tracking default IDs yang sudah pernah terlihat

function loadActiveOverlays() {
  // ID semua default layer yang seharusnya auto-ON
  const autoOnIds = DEFAULT_LINK_LAYERS.filter(l => l.autoOn).map(l => l.id)

  try {
    const raw = localStorage.getItem(LS_ACTIVE_OVERLAYS)

    if (raw === null) {
      // ── Fresh install / deploy baru ──────────────────────────────────────
      // Aktifkan semua default layer yang autoOn
      return [...autoOnIds]
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return [...autoOnIds]

    // ── Kunjungan berikutnya ─────────────────────────────────────────────
    // Cek apakah ada default layer BARU yang belum pernah diketahui sebelumnya.
    // Jika ada → otomatis aktifkan (kode baru ditambahkan ke config).
    let knownDefaults = new Set()
    try {
      const kr = localStorage.getItem(LS_KNOWN_DEFAULTS)
      if (kr) knownDefaults = new Set(JSON.parse(kr))
    } catch { /* ignore */ }

    const brandNewDefaults = autoOnIds.filter(id => !knownDefaults.has(id))

    // Merge: state lama + default baru yang belum pernah ada
    return [...new Set([...parsed, ...brandNewDefaults])]

  } catch {
    return [...autoOnIds]
  }
}

function saveActiveOverlays(arr) {
  localStorage.setItem(LS_ACTIVE_OVERLAYS, JSON.stringify(arr))
  // Simpan semua default IDs yang sudah diketahui saat ini
  // agar deteksi "default baru" di loadActiveOverlays bekerja benar
  const allDefaultIds = DEFAULT_LINK_LAYERS.map(l => l.id)
  localStorage.setItem(LS_KNOWN_DEFAULTS, JSON.stringify(allDefaultIds))
}

// ─── Store ──────────────────────────────────────────────────────────────────
const useGisStore = create((set) => ({
  // Unit data
  units: [],
  setUnits: (newUnits) => set((s) => {
    // Smart merge: hanya ganti objek unit yang benar-benar berubah.
    // Ini mencegah marker goyang (jitter) karena Leaflet tidak re-mount
    // marker yang posisi/statusnya tidak berubah.
    if (s.units.length === 0) return { units: newUnits }

    const prevMap = new Map(s.units.map(u => [u.id, u]))
    let hasChange = newUnits.length !== s.units.length

    const merged = newUnits.map(newUnit => {
      const prev = prevMap.get(newUnit.id)
      if (!prev) { hasChange = true; return newUnit }

      // Bandingkan field kritis — jika tidak ada yang berubah, pakai referensi lama
      const changed =
        prev.lat    !== newUnit.lat    ||
        prev.lng    !== newUnit.lng    ||
        prev.speed  !== newUnit.speed  ||
        prev.course !== newUnit.course ||
        prev.status !== newUnit.status ||
        prev.name   !== newUnit.name

      if (changed) { hasChange = true; return newUnit }
      return prev // referensi sama → React skip re-render
    })

    return hasChange ? { units: merged } : {} // {} = tidak trigger re-render sama sekali
  }),

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


  // Custom User Links (via UI) + Default Tile Layers dari config
  customLinkLayers: (() => {
    // DEFAULT_LINK_LAYERS selalu ada — hardcoded di mapConfig.js,
    // tidak bergantung localStorage → aman di semua deployment Vercel.
    const defaultIds = new Set(DEFAULT_LINK_LAYERS.map(l => l.id))

    // Ambil layer tambahan yang di-add user (dari localStorage)
    let userLayers = []
    try {
      const raw = localStorage.getItem('customLinkLayers')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          // Filter: hanya simpan layer user (bukan default) agar tidak duplikat
          userLayers = parsed.filter(l => !defaultIds.has(l.id))
        }
      }
    } catch (e) {
      // ignore
    }

    // Default selalu di depan, user layers di belakang
    return [...DEFAULT_LINK_LAYERS, ...userLayers]
  })(),
  addLinkLayer: (layer) => set(s => {
    const fresh = [...s.customLinkLayers, layer]
    localStorage.setItem('customLinkLayers', JSON.stringify(fresh))
    return { customLinkLayers: fresh }
  }),
  removeLinkLayer: (layerId) => set(s => {
    // Lindungi default layers — tidak bisa dihapus user
    const targetLayer = s.customLinkLayers.find(l => l.id === layerId)
    if (targetLayer?.isDefault) return {}

    const nextActive = s.activeOverlays.filter(id => id !== layerId)
    const fresh = s.customLinkLayers.filter(l => l.id !== layerId)
    // Hanya simpan user layers ke localStorage (bukan default)
    const userOnly = fresh.filter(l => !l.isDefault)
    localStorage.setItem('customLinkLayers', JSON.stringify(userOnly))
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
