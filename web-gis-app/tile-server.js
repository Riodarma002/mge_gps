import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import process from 'process'

const app = express()
app.use(cors())

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Folder dimana SEMUA file .mbtiles disimpan
// Berada di dalam folder web-gis-app/tiles
const TILES_DIR = path.resolve(__dirname, 'tiles')
const PORT = 8080

// Dictionary untuk menyimpan instance DB
// Format: { 'selatan': { db: Database, meta: {...} } }
const tileDatabases = {}

// Pastikan folder tiles ada
if (!fs.existsSync(TILES_DIR)) {
  fs.mkdirSync(TILES_DIR, { recursive: true })
}

// 1. Scan /tiles folder untuk file .mbtiles
function scanMBTiles() {
  // Tutup koneksi DB yang mungkin sudah terbuka sebelum diatur ulang (mencegah memory leak)
  Object.values(tileDatabases).forEach(layer => {
    try { layer.db.close() } catch (e) {}
  })

  // Bersihkan memori daftar tile
  for (let key in tileDatabases) {
    delete tileDatabases[key]
  }

  const files = fs.readdirSync(TILES_DIR).filter(f => f.endsWith('.mbtiles'))
  console.log(`\n🔍 Memindai folder ${TILES_DIR}... Ditemukan: ${files.length} file.`)

  files.forEach(file => {
    const filePath = path.join(TILES_DIR, file)
    const layerId = file.replace('.mbtiles', '')

    try {
      const db = new Database(filePath, { readonly: true }) // Gunakan readonly supaya lebih aman jika file dipindahkan/diedit
      
      // Ambil metadata standar Mbtiles
      const metadataRows = db.prepare('SELECT name, value FROM metadata').all()
      const metaMap = {}
      metadataRows.forEach(row => { metaMap[row.name] = row.value })

      // Parsing bounds: format asli = "minLng, minLat, maxLng, maxLat"
      // Diubah ke format [ [minLat, minLng], [maxLat, maxLng] ] untuk mempermudah Leaflet
      let parsedBounds = null
      if (metaMap.bounds) {
        const b = metaMap.bounds.split(',').map(Number)
        if (b.length === 4) {
          parsedBounds = [
            [b[1], b[0]], // South, West (minLat, minLng)
            [b[3], b[2]]  // North, East (maxLat, maxLng)
          ]
        }
      }

      // Siapkan DB Get Statement untuk performance cepat
      const getTileStmt = db.prepare('SELECT tile_data FROM tiles WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?')

      tileDatabases[layerId] = {
        id: layerId,
        db: db,
        getTile: getTileStmt,
        meta: {
          name: metaMap.name || layerId,
          description: metaMap.description || '',
          minZoom: parseInt(metaMap.minzoom || 0, 10),
          maxZoom: parseInt(metaMap.maxzoom || 22, 10),
          bounds: parsedBounds
        }
      }

      console.log(`✅ Berhasil memuat: [${layerId}] (Zoom ${metaMap.minzoom}-${metaMap.maxzoom})`)
    } catch (e) {
      console.error(`❌ Gagal membaca ${file}:`, e.message)
    }
  })
}

// Jalankan scann saat boot
scanMBTiles()

// Hot-reload: Pantau terus menerus isi folder secara realtime
let debounceTimer;
fs.watch(TILES_DIR, (eventType, filename) => {
  if (filename && filename.endsWith('.mbtiles')) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`\n🔄 Perubahan file terdeteksi: ${filename}. Melakukan rescan...`);
      scanMBTiles();
    }, 1000); // Tunggu delay 1 detik setelah file selesai dicopy
  }
})

// Endpoint 1: Mengambil daftar layer yang tersedia (API metadata)
app.get('/api/layers', (req, res) => {
  const layers = Object.values(tileDatabases).map(entry => ({
    id: entry.id,
    ...entry.meta,
    // Provide a template URL for easy use in frontend
    url: `http://localhost:${PORT}/${entry.id}/{z}/{x}/{y}.png`
  }))
  res.json(layers)
})

// Endpoint 2: Mengambil tile gambar Z/X/Y spesifik per layer
app.get('/:layerId/:z/:x/:y.png', (req, res) => {
  const { layerId } = req.params
  let { z, x, y } = req.params
  
  const layer = tileDatabases[layerId]
  if (!layer) return res.status(404).send('Layer not found')

  z = parseInt(z, 10)
  x = parseInt(x, 10)
  y = parseInt(y, 10)

  // Konversi TMS (MBTiles) ke XYZ
  const tmsY = Math.pow(2, z) - 1 - y

  try {
    const row = layer.getTile.get(z, x, tmsY)
    if (row && row.tile_data) {
      res.set('Content-Type', 'image/png')
      res.set('Cache-Control', 'public, max-age=604800') // cache 7 hari
      res.send(row.tile_data)
      return
    }
  } catch (error) {
    if (error.code !== 'SQLITE_ERROR') {
      console.error(`Error baca tile ${z}/${x}/${y}:`, error.message)
    }
  }

  // Jika tak ada data, kembalikan 404 transparent
  res.status(404).send('Not Found')
})

app.listen(PORT, () => {
  console.log(`\n===============================================`)
  console.log(`🗺️  Multi-MBTiles Server Berjalan (Port ${PORT})`)
  console.log(`📍 Endpoint API Layer : http://localhost:${PORT}/api/layers`)
  console.log(`===============================================`)
})
