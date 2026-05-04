import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 1. Definisikan asal dan tujuan
const MBTILES_PATH = path.resolve(__dirname, '..', 'selatan.mbtiles')
const OUTPUT_DIR = path.resolve(__dirname, '..', 'tiles_extracted', 'selatan')

console.log('Membaca database MBTiles...', MBTILES_PATH)
const db = new Database(MBTILES_PATH, { fileMustExist: true })

// 2. Query seluruh tile
const tiles = db.prepare('SELECT zoom_level, tile_column, tile_row, tile_data FROM tiles').all()
console.log(`Ditemukan ${tiles.length} keping gambar tile! Memulai ekstraksi...`)

let count = 0
tiles.forEach((row) => {
  const z = row.zoom_level
  const x = row.tile_column

  // Konversi TMS (MBTiles) ke XYZ (Web Standar format Leaflet)
  const y = Math.pow(2, z) - 1 - row.tile_row

  // 3. Buat struktur folder /z/x/
  const dirPath = path.join(OUTPUT_DIR, z.toString(), x.toString())
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }

  // 4. Simpan gambar .png
  const filePath = path.join(dirPath, `${y}.png`)
  fs.writeFileSync(filePath, row.tile_data)
  count++

  // Tampilkan progress setiap 1000 file agar tidak macet
  if (count % 1000 === 0) console.log(`Berhasil mengekstrak ${count} tiles...`)
})

console.log(`\n✅ EKSTRAKSI SELESAI!!`)
console.log(`Semua ${count} keping gambar berhasil disimpan di folder: \n=> ${OUTPUT_DIR}`)
console.log(`Folder inilah yang siap di-upload ke Cloudflare R2!`)
