import L from 'leaflet'
import { getUnitIconUrl } from '../api/wialonApi'

// Import custom SVGs
import ghtIcon from '../assets/GHT-01.svg'
import exIcon from '../assets/EX-01.svg'
import gmtIcon from '../assets/GMT-02-01.svg'

/**
 * Parse unit name jadi bagian-bagian:
 * Contoh: "MGE-GHT-714" → { prefix: "MGE", rest: "GHT 714", unitType: "GHT" }
 * Contoh: "SMP-EX-42"   → { prefix: "SMP", rest: "EX 42", unitType: "EX" }
 * Contoh: "MGE-GMT-701"  → { prefix: "MGE", rest: "GMT 701", unitType: "GMT" }
 *
 * Rule:
 * - Bagian pertama sebelum dash pertama = prefix (company initial)
 * - Dash pertama setelah prefix = spasi, dash kedua = spasi
 */
function parseUnitName(name) {
  if (!name) return { prefix: '', rest: name || '', unitType: '', unitNumber: name || '' }

  const parts = name.split('-')
  if (parts.length < 2) return { prefix: name, rest: '', unitType: name, unitNumber: name }

  const prefix     = parts[0]               // "MGE" / "SMP"
  const unitType   = parts[1]               // "GHT" / "EX" / "GMT"
  const unitNumber = parts.slice(2).join('-') || parts[parts.length - 1] // "733" / "42"
  const rest       = parts.slice(1).join(' ') // "GHT 714" / "EX 42"

  return { prefix, rest, unitType, unitNumber }
}

/**
 * Create custom Leaflet divIcon dengan design baru:
 * - Logo perusahaan (dari /company/{PREFIX}.png)
 * - White chip bertuliskan "GHT 714" (type + nomor unit)
 * - Arrow arah kalau bergerak
 * - Icon unit custom (GHT, EX, GMT)
 */
export function createUnitIcon(unit) {
  const { prefix, rest, unitType, unitNumber } = parseUnitName(unit.name)

  // Tentukan URL icon berdasarkan unitType
  let iconUrl = getUnitIconUrl(unit.id) || ''

  if (unitType === 'GHT') {
    iconUrl = ghtIcon
  } else if (unitType === 'EX') {
    iconUrl = exIcon
  } else if (unitType === 'GMT') {
    iconUrl = gmtIcon
  }

  const isMoving = unit.status === 'online' && unit.speed > 2
  const course = unit.course || 0

  // Warna label berdasarkan unitType
  const labelColor = unitType === 'GHT' ? '#1a6fff' : '#ff2a2a'

  // Path logo perusahaan — letakkan file di /public/company/MGE.png dll
  const logoUrl = prefix ? `/company/${prefix}.png` : ''

  // Arrow arah gerak: diletakkan di tengah-atas (hidung kendaraan) dengan sedikit jarak
  const arrowHtml = isMoving ? `
    <div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:14px;height:14px;z-index:2;">
      <svg viewBox="0 0 100 100" width="14" height="14">
        <polygon points="50,10 90,90 50,70 10,90" fill="#26d97f" stroke="#fff" stroke-width="8"/>
      </svg>
    </div>
  ` : ''

  // Label: Logo di atas, teks nama unit di bawah tanpa box (menggunakan outline putih)
  const labelHtml = `
    <div style="
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 2px;
      pointer-events: none;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
      white-space: nowrap;
    ">
      ${logoUrl ? `<img
        src="${logoUrl}"
        style="width:20px;height:20px;object-fit:contain;display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5));"
        onerror="this.style.display='none'"
      />` : ''}
      <div style="
        color: ${labelColor};
        font-family: 'Inter','Roboto',sans-serif;
        font-size: 10px;
        font-weight: 800;
        line-height: 1;
        letter-spacing: 0.3px;
        padding: 1px 3px;
        border-radius: 3px;
        background: rgba(0,0,0,0.25);
        text-shadow: 
          -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff,
          -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff,
          -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff,
          0 3px 4px rgba(0,0,0,0.6);
      ">
        ${rest}
      </div>
    </div>
  `



  const html = `
    <div style="position:relative;width:80px;height:55px;display:flex;align-items:center;justify-content:center;">
      <div style="position:relative;width:40px;height:40px;">
        
        <!-- Yang berputar (Vehicle + Arrow digabung) -->
        <div style="position:absolute;top:0;left:0;width:40px;height:40px;transform:rotate(${course}deg);transform-origin:center;transition:transform 0.3s ease;">
          <img src="${iconUrl}" style="width:40px;height:40px;object-fit:contain;pointer-events:auto;" onerror="this.style.opacity='0'" />
          ${arrowHtml}
        </div>

        <!-- Yang konstan horisontal (Label tidak berputar) -->
        ${labelHtml}
      </div>
    </div>
  `


  return L.divIcon({
    className: 'custom-unit-marker',
    html: html,
    iconSize: [80, 50],
    iconAnchor: [40, 25],
    popupAnchor: [0, -10],
  })
}
