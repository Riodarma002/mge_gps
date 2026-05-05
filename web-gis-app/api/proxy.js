// Vercel Serverless Proxy — endpoint tunggal untuk semua call ke Wialon API
// Frontend POST ke /api/proxy → diteruskan ke https://hst-api.wialon.eu/wialon/ajax.html

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Ambil endpoint Wialon dari query param 'endpoint', default ke wialon/ajax.html
  const endpoint = req.query.endpoint || 'wialon/ajax.html'
  const upstreamUrl = `https://hst-api.wialon.eu/${endpoint}`

  try {
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
      },
    }

    // Forward body untuk POST request
    if (req.method === 'POST') {
      // Vercel auto-parse body jika Content-Type cocok
      if (req.body && typeof req.body === 'object') {
        options.body = new URLSearchParams(req.body).toString()
      } else if (typeof req.body === 'string') {
        options.body = req.body
      }
    }

    const upstream = await fetch(upstreamUrl, options)
    const text = await upstream.text()

    res.setHeader('Content-Type', 'application/json')
    return res.status(upstream.status).send(text)
  } catch (err) {
    console.error('[proxy] error:', err)
    return res.status(500).json({ error: 'Proxy error', message: err.message })
  }
}
