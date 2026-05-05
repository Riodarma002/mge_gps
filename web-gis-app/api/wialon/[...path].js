// Vercel Serverless Proxy untuk Wialon API
// Menangani semua request ke /api/wialon/* dan meneruskannya ke hst-api.wialon.eu
// Contoh: POST /api/wialon/wialon/ajax.html → POST https://hst-api.wialon.eu/wialon/ajax.html

export const config = {
  api: {
    bodyParser: false, // Nonaktifkan body parser otomatis agar raw body bisa diforward
  },
}

// Helper: baca raw body dari request stream
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString()))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  // Izinkan CORS dari semua origin (karena ini proxy internal kita)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight (browser CORS check)
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Strip prefix /api/wialon dari req.url, teruskan sisanya ke Wialon
  // Contoh: req.url = /api/wialon/wialon/ajax.html → /wialon/ajax.html
  const stripped = req.url.replace(/^\/api\/wialon/, '') || '/'
  const upstreamUrl = `https://hst-api.wialon.eu${stripped}`

  try {
    const rawBody = req.method !== 'GET' ? await getRawBody(req) : undefined

    const upstreamResponse = await fetch(upstreamUrl, {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
      },
      body: rawBody || undefined,
    })

    const responseText = await upstreamResponse.text()

    res.setHeader('Content-Type', 'application/json')
    res.status(upstreamResponse.status).send(responseText)
  } catch (err) {
    console.error('Proxy error:', err)
    res.status(500).json({ error: 'Proxy error', message: err.message })
  }
}
