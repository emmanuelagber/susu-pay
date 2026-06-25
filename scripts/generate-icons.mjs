#!/usr/bin/env node
/**
 * Generates PWA icons for Susu Circle using only Node built-ins (no extra packages).
 * Run: node scripts/generate-icons.mjs
 */
import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dir, '..', 'public')

// ─── Minimal PNG encoder ────────────────────────────────────────
const CRC = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  CRC[n] = c
}
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const l = Buffer.allocUnsafe(4); l.writeUInt32BE(data.length, 0)
  const cc = Buffer.allocUnsafe(4); cc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0)
  return Buffer.concat([l, t, data, cc])
}
function writePNG(path, w, h, pixels) {
  const bpp = 4
  const raw = Buffer.allocUnsafe(h * (1 + w * bpp))
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * bpp)] = 0
    for (let x = 0; x < w; x++) {
      const si = (y * w + x) * bpp
      const di = y * (1 + w * bpp) + 1 + x * bpp
      raw[di] = pixels[si]; raw[di+1] = pixels[si+1]
      raw[di+2] = pixels[si+2]; raw[di+3] = pixels[si+3]
    }
  }
  const ihdr = Buffer.allocUnsafe(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4)
  ihdr[8]=8; ihdr[9]=6; ihdr[10]=ihdr[11]=ihdr[12]=0
  const png = Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
  writeFileSync(path, png)
  console.log(`  ✓  ${path.split(/[\\/]/).slice(-2).join('/')}  (${(png.length/1024).toFixed(1)} KB)`)
}

// ─── Icon renderer ──────────────────────────────────────────────
function inRR(px, py, rx, ry, rw, rh, r) {
  if (px<rx||py<ry||px>rx+rw||py>ry+rh) return false
  const nL=px<rx+r, nR=px>rx+rw-r, nT=py<ry+r, nB=py>ry+rh-r
  if (nL&&nT) return (px-rx-r)**2+(py-ry-r)**2<=r*r
  if (nR&&nT) return (px-rx-rw+r)**2+(py-ry-r)**2<=r*r
  if (nL&&nB) return (px-rx-r)**2+(py-ry-rh+r)**2<=r*r
  if (nR&&nB) return (px-rx-rw+r)**2+(py-ry-rh+r)**2<=r*r
  return true
}

function renderIcon(size) {
  const N = 4 // NxN supersampling
  const pix = new Uint8Array(size * size * 4)
  const cx = size/2, cy = size/2
  const mg = size*0.08, rr = size*0.20
  const ringR = size*0.29, ringW = size*0.046
  const dotR  = size*0.10
  // arc decorations
  const arcR  = size*0.18, arcW = size*0.035

  for (let y=0; y<size; y++) {
    for (let x=0; x<size; x++) {
      let rs=0,gs=0,bs=0
      for (let sy=0; sy<N; sy++) {
        for (let sx=0; sx<N; sx++) {
          const px=x+(sx+0.5)/N, py=y+(sy+0.5)/N
          const d=Math.sqrt((px-cx)**2+(py-cy)**2)
          let r=11,g=25,b=41        // bg #0B1929

          // Blue rounded rect
          if (inRR(px,py,mg,mg,size-2*mg,size-2*mg,rr)) { r=75;g=124;b=243 } // #4B7CF3

          // White outer ring
          if (Math.abs(d-ringR)<ringW) { r=239;g=244;b=249 }

          // White arc (top-left, visible through a gap — makes it the circle-arrow logo)
          const angle = Math.atan2(py-cy, px-cx) // -π to π
          const inArc = Math.abs(d-arcR)<arcW
          // Show arc from ~135° to ~315° (bottom-right gap)
          const a = ((angle * 180/Math.PI) + 360) % 360
          if (inArc && (a < 130 || a > 320)) { r=239;g=244;b=249 }

          // White center dot
          if (d<dotR) { r=239;g=244;b=249 }

          rs+=r; gs+=g; bs+=b
        }
      }
      const i=(y*size+x)*4
      pix[i]=Math.round(rs/(N*N)); pix[i+1]=Math.round(gs/(N*N))
      pix[i+2]=Math.round(bs/(N*N)); pix[i+3]=255
    }
  }
  return pix
}

// ─── Generate ───────────────────────────────────────────────────
mkdirSync(PUBLIC, { recursive: true })
console.log('\nGenerating PWA icons…')
writePNG(join(PUBLIC,'icon-192.png'),  192, 192, renderIcon(192))
writePNG(join(PUBLIC,'icon-512.png'),  512, 512, renderIcon(512))
writePNG(join(PUBLIC,'apple-touch-icon.png'), 180, 180, renderIcon(180))
console.log('\nDone. Drop these into public/ — they are already there.\n')
