import L from 'leaflet'
import { getUnitIconUrl } from '../api/wialonApi'

/**
 * Create custom Leaflet divIcon
 * - Unit icon size: 40x40 (larger)
 * - Label: white background box ABOVE the icon
 * - Font color: dark navy (not red)
 */
export function createUnitIcon(unit) {
  const iconUrl = getUnitIconUrl(unit.id) || '';
  const isMoving = unit.status === 'online' && unit.speed > 2;
  const course = unit.course || 0;

  // Course arrow (green direction indicator, shown only if moving)
  const arrowHtml = isMoving ? `
    <div style="position: absolute; top: -5px; left: -5px; width: 14px; height: 14px; transform: rotate(${course}deg); transform-origin: center;">
      <svg viewBox="0 0 100 100" width="14" height="14">
        <polygon points="50,10 90,90 50,70 10,90" fill="#26d97f" stroke="#fff" stroke-width="8" />
      </svg>
    </div>
  ` : '';

  // Label box ABOVE the icon — dark text, white pill background
  const textHtml = `
    <div style="
      position: absolute;
      bottom: 44px;
      left: 50%;
      transform: translateX(-50%);
      color: #1a1a2e;
      background-color: rgba(255, 255, 255, 0.95);
      padding: 2px 7px;
      border-radius: 4px;
      border: 1px solid rgba(0, 0, 0, 0.15);
      box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.35);
      font-family: 'Inter', 'Roboto', Arial, sans-serif;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      pointer-events: none;
      z-index: 1000;
    ">
      ${unit.name}
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
