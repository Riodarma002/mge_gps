// Wialon Remote API Integration
// Platform: PrimeEyes / PTDigital (hst-api.wialon.eu)

const TOKEN = import.meta.env.VITE_WIALON_TOKEN

// Dev: gunakan Vite proxy (/wialon-api)
// Prod (Vercel): gunakan Serverless Function proxy (/api/wialon)
const BASE = import.meta.env.DEV ? '/wialon-api' : '/api/wialon'

let sessionId = null

/**
 * Call Wialon Remote API
 */
async function wialonCall(svc, params = {}) {
  const url = `${BASE}/wialon/ajax.html`
  const body = new URLSearchParams({
    svc,
    params: JSON.stringify(params),
    ...(sessionId ? { sid: sessionId } : {}),
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  const data = await res.json()
  if (data.error) throw new Error(`Wialon error ${data.error}: ${svc}`)
  return data
}

/**
 * Login with Locator Token
 * Returns session id (eid)
 */
export async function wialonLogin() {
  const data = await wialonCall('token/login', {
    token: TOKEN,
    fl: 1,
  })
  sessionId = data.eid
  return data
}

/**
 * Fetch all GPS units with position data
 * AVL_UNIT fields:
 *   1 - id, 2 - name, 4 - phone, 8 - desc
 *   groups: 256 last msg, 512 pos
 */
export async function fetchUnits() {
  if (!sessionId) await wialonLogin()

  // PING avl_evts (tanpa await): Wialon menggunakan long-polling di endpoint ini.
  // Menyematkan await akan menge-blok UI karena request ini sering menunggu puluhan detik jika tidak ada event.
  fetch(`${BASE}/avl_evts?sid=${sessionId}`).catch(e => {
    console.warn('ping avl_evts failed', e)
  })

  const data = await wialonCall('core/search_items', {
    spec: {
      itemsType: 'avl_unit',
      propName: 'sys_name',
      propValueMask: '*',
      sortType: 'sys_name',
    },
    force: 1,
    flags: 0x00000001 | 0x00000100 | 0x00000200 | 0x00000400, // basic + lastmsg + pos + sensors
    from: 0,
    to: 0,
  })

  return (data.items || []).map(parseUnit)
}

/**
 * Parse raw Wialon unit to app-friendly object
 */
function parseUnit(raw) {
  const pos = raw.pos || null
  const lastMsg = raw.lmsg || null

  let lat = null
  let lng = null
  let speed = 0
  let course = 0
  let altitude = 0
  let timestamp = null

  if (pos) {
    lat = pos.y
    lng = pos.x
    speed = pos.s || 0
    course = pos.c || 0
    altitude = pos.z || 0
    timestamp = pos.t ? new Date(pos.t * 1000) : null
  }

  const status = deriveStatus(pos, lastMsg)

  return {
    id: raw.id,
    name: raw.nm || 'Unknown Unit',
    phone: raw.ph || '',
    description: raw.ds || '',
    lat,
    lng,
    speed,       // km/h
    course,      // degrees
    altitude,
    timestamp,
    status,      // 'online' | 'idle' | 'offline' | 'no_signal'
    hasPosition: lat !== null && lng !== null,
  }
}

/**
 * Derive unit status from position & last message
 */
function deriveStatus(pos, lastMsg) {
  if (!pos && !lastMsg) return 'no_signal'

  const nowSeconds = Math.floor(Date.now() / 1000)
  const msgTime = pos?.t || lastMsg?.t || 0
  const ageMinutes = (nowSeconds - msgTime) / 60

  if (ageMinutes > 60) return 'offline'      // no data > 1 jam
  if (ageMinutes > 15) return 'offline'      // no data > 15 menit = offline
  if ((pos?.s || 0) > 2) return 'online'    // bergerak (speed > 2 km/h)
  return 'idle'                               // ada koneksi tapi diam
}

export function clearSession() {
  sessionId = null
}

/**
 * Get internal Wialon unit image URL
 */
export function getUnitIconUrl(unitId) {
  if (!sessionId) return '';
  // Menggunakan URL bawaan Wialon untuk mendapatkan icon
  return `${BASE}/avl_item_image/${unitId}/32/1.png?sid=${sessionId}`;
}
