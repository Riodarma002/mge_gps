// Status config: label, warna, CSS class
export const STATUS_CONFIG = {
  online: {
    label: 'Online',
    color: '#26d97f',
    bgColor: 'rgba(38, 217, 127, 0.15)',
    borderColor: '#26d97f',
    pulseColor: 'rgba(38, 217, 127, 0.4)',
    dotClass: 'dot-online',
  },
  idle: {
    label: 'Idle',
    color: '#f0a500',
    bgColor: 'rgba(240, 165, 0, 0.15)',
    borderColor: '#f0a500',
    pulseColor: 'rgba(240, 165, 0, 0.4)',
    dotClass: 'dot-idle',
  },
  offline: {
    label: 'Offline',
    color: '#f85149',
    bgColor: 'rgba(248, 81, 73, 0.15)',
    borderColor: '#f85149',
    pulseColor: null,
    dotClass: 'dot-offline',
  },
  no_signal: {
    label: 'No Signal',
    color: '#6e7681',
    bgColor: 'rgba(110, 118, 129, 0.15)',
    borderColor: '#6e7681',
    pulseColor: null,
    dotClass: 'dot-no-signal',
  },
}

export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG['no_signal']
}

export function formatSpeed(kmh) {
  if (!kmh || kmh === 0) return '0 km/h'
  return `${Math.round(kmh)} km/h`
}

export function formatTimestamp(date) {
  if (!date) return 'N/A'
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatCoord(val, type) {
  if (val === null || val === undefined) return 'N/A'
  const dir = type === 'lat' ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W')
  return `${Math.abs(val).toFixed(6)}° ${dir}`
}

export function formatAge(timestamp) {
  if (!timestamp) return 'Tidak diketahui'
  const now = new Date()
  const diff = Math.floor((now - (timestamp instanceof Date ? timestamp : new Date(timestamp))) / 1000)
  if (diff < 60) return `${diff} detik lalu`
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  return `${Math.floor(diff / 86400)} hari lalu`
}
