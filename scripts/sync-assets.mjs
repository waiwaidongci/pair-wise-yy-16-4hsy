// Syncs read-only source material from outside the app into ./public, so the
// site never imports assets/ design references and always serves the exact
// provided content files:
//   ../assets/fonts/*.woff2  -> public/fonts/
//   ../mock-data/photos/     -> public/photos/
//   ../mock-data/photos.json -> src/data/photos.json (app's single import)
//
// Idempotent: safe to run before every dev/build.
import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const fontsSrc = resolve(root, 'assets', 'fonts')
const photosSrc = resolve(root, 'mock-data', 'photos')
const photosJsonSrc = resolve(root, 'mock-data', 'photos.json')

const publicFonts = resolve(root, 'public', 'fonts')
const publicPhotos = resolve(root, 'public', 'photos')
const dataDestDir = resolve(root, 'src', 'data')

for (const [src, dest] of [
  [fontsSrc, publicFonts],
  [photosSrc, publicPhotos],
]) {
  if (!existsSync(src)) throw new Error(`缺少素材目录：${src}`)
  rmSync(dest, { recursive: true, force: true })
  mkdirSync(dirname(dest), { recursive: true })
  cpSync(src, dest, { recursive: true })
}

mkdirSync(dataDestDir, { recursive: true })
cpSync(photosJsonSrc, resolve(dataDestDir, 'photos.json'))

console.log('[sync-assets] 字体、照片与 photos.json 已同步到 public/ 与 src/data/')
