import L from 'leaflet'
import { getUnitIconUrl } from '../api/wialonApi'

/**
 * Create custom Leaflet divIcon
 * - Unit icon size: 40x40
 * - Label: white box di BAWAH icon
 * - Nama dipersingkat: "MGE-GHT-711" → "GHT 711"
 */
export function createUnitIcon(unit) {
  const iconUrl = getUnitIconUrl(unit.id) || '';
  const isMoving = unit.status === 'online' && unit.speed > 2;
  const course = unit.course || 0;

  // Persingkat nama: "MGE-GHT-711" → "GHT 711"
  const shortName = unit.name
    .replace(/^[A-Z]+-/i, '')  // hapus prefix pertama, contoh: "MGE-"
    .replace(/-/g, ' ')         // ganti sisa tanda "-" jadi spasi

  // Tentukan warna font berdasarkan jenis unit (GHT, GMT, EX)
  let textColor = '#1a1a2e'; // default hitam navy
  if (shortName.includes('GHT')) {
    textColor = '#0055ff'; // Biru terang
  } else if (shortName.includes('GMT')) {
    textColor = '#e60000'; // Merah terang
  } else if (shortName.includes('EX')) {
    textColor = '#009900'; // Hijau tua/terang
  }

  // Course arrow (green direction indicator, shown only if moving)
  const arrowHtml = isMoving ? `
    <div style="position: absolute; top: -5px; left: -5px; width: 14px; height: 14px; transform: rotate(${course}deg); transform-origin: center;">
      <svg viewBox="0 0 100 100" width="14" height="14">
        <polygon points="50,10 90,90 50,70 10,90" fill="#26d97f" stroke="#fff" stroke-width="8" />
      </svg>
    </div>
  ` : '';

  // Label teks saja dengan outline/border putih di BAWAH icon
  const textHtml = `
    <div style="
      position: absolute;
      top: 40px;
      left: 50%;
      transform: translateX(-50%);
      color: ${textColor};
      text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0px 0px 4px #fff;
      font-family: 'Inter', 'Roboto', Arial, sans-serif;
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
      pointer-events: none;
      z-index: 1000;
    ">
      ${shortName}
    </div>
  `;

  const html = `
    <div style="position: relative; width: 40px; height: 40px;">
      <img src="${iconUrl}" style="width: 40px; height: 40px; object-fit: contain; pointer-events: auto;" onerror="this.style.opacity='0'" />
      ${arrowHtml}
      ${textHtml}
    </div>
  `;

  return L.divIcon({
    className: 'custom-unit-marker',
    html: html,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
}
