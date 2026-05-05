// Vercel Serverless Function: Proxy ke Wialon API
// File ini menggantikan fungsi Vite proxy server saat di-deploy ke Vercel.
// Route: /api/wialon => https://hst-api.wialon.eu

export default async function handler(req, res) {
  // Ambil path setelah /api/wialon
  const { path: pathParam } = req.query
  const pathStr = Array.isArray(pathParam) ? pathParam.join('/') : (pathParam || '')

  const targetUrl = `https://hst-api.wialon.eu/${pathStr}`

  // Teruskan query string (selain 'path') ke upstream
  const upstreamQuery = new URLSearchParams()
  for (const [key, val] of Object.entries(req.query)) {
    if (key !== 'path') {
      upstreamQuery.set(key, val)
    }
  }
  const queryStr = upstreamQuery.toString()
  const fullUrl = queryStr ? `${targetUrl}?${queryStr}` : targetUrl

  try {
    // Teruskan body jika ada (POST request)
    const upstreamOptions = {
      method: req.method || 'GET',
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/x-www-form-urlencoded',
      },
    }

    if (req.method === 'POST' && req.body) {
      upstreamOptions.body = typeof req.body === 'string'
        ? req.body
        : new URLSearchParams(req.body).toString()
    }

    const upstream = await fetch(fullUrl, upstreamOptions)
    const data = await upstream.text()

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', 'application/json')
    res.status(upstream.status).send(data)
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', message: err.message })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
