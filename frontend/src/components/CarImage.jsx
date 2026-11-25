import { useEffect, useId, useState } from 'react'
import { COLORS } from '@/data/constants'

// Tăng/giảm độ sáng của màu hex
const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16)
  const c = (v) => Math.max(0, Math.min(255, v))
  const r = c((n >> 16) + amt), g = c(((n >> 8) & 255) + amt), b = c((n & 255) + amt)
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

// Thân xe nhìn nghiêng, đầu xe quay sang phải. Mặt đất ở y = 156.
const BODY = {
  sedan: 'M52 130 L52 106 Q52 94 66 92 L100 88 Q112 60 142 48 Q152 42 176 42 L228 42 Q252 42 268 58 L296 86 L326 92 Q352 96 354 112 L354 130 Z',
  suv: 'M50 132 L50 104 Q50 92 64 90 L96 86 L116 52 Q122 40 138 40 L282 40 Q300 40 312 56 L330 84 L342 88 Q358 92 360 110 L360 132 Z',
  mpv: 'M50 132 L50 102 Q50 92 64 90 L96 86 Q108 56 130 48 Q138 44 150 44 L286 44 Q304 46 314 60 L336 86 L346 90 Q360 94 362 110 L362 132 Z',
  van: 'M44 132 L44 50 Q44 36 58 36 L292 36 Q310 36 322 54 L346 90 Q362 94 366 112 L366 132 Z',
  minibus: 'M32 132 L32 46 Q32 30 48 30 L300 30 Q320 30 332 52 L352 92 Q368 96 372 114 L372 132 Z',
  bus: 'M20 132 L20 42 Q20 28 36 28 L318 28 Q338 28 350 48 L372 92 Q384 96 388 114 L388 132 Z',
}

const row = (n, x0, step, w, y, h) =>
  [...Array(n)].map((_, i) => `M${x0 + i * step} ${y} h${w} q4 0 4 4 v${h - 4} h-${w + 8} v-${h - 4} q0 -4 4 -4 z`)

const GLASS = {
  sedan: ['M122 84 Q130 66 150 56 L182 54 L182 84 Z', 'M190 54 L226 54 Q244 55 256 68 L276 84 L190 84 Z'],
  suv: ['M104 84 L124 52 L168 50 L168 84 Z', 'M176 50 L236 50 L236 84 L176 84 Z', 'M244 50 L282 50 Q296 52 304 66 L316 84 L244 84 Z'],
  mpv: ['M104 82 Q114 60 132 52 L168 50 L168 82 Z', 'M176 50 L236 50 L236 82 L176 82 Z', 'M244 50 L286 50 Q300 52 308 66 L320 82 L244 82 Z'],
  van: [...row(5, 56, 46, 34, 48, 30), 'M298 48 L312 48 Q320 60 332 80 L298 80 Z'],
  minibus: [...row(6, 44, 42, 30, 42, 36), 'M308 42 L324 42 Q332 60 346 84 L308 84 Z'],
  bus: [...row(7, 32, 43, 31, 40, 42), 'M322 40 L338 40 Q346 58 362 90 L322 90 Z'],
}

const WHEELS = {
  sedan: [116, 300], suv: [112, 304], mpv: [112, 304], van: [108, 300], minibus: [96, 312], bus: [84, 126, 322],
}
const RADIUS = { sedan: 24, suv: 26, mpv: 25, van: 25, minibus: 25, bus: 25 }

/** Ảnh xe vẽ bằng SVG (không cần tải ảnh ngoài). type = sedan | suv | mpv | van | minibus | bus */
export default function CarImage({ src, type = 'sedan', color = 'red', className = '', flip = false }) {
  const id = useId().replace(/:/g, '')
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])

  // Có ảnh thật thì dùng ảnh; lỗi/không có ảnh thì quay về hình vẽ SVG
  if (src && !failed) {
    // Ảnh thật: bỏ giới hạn max-w và đổ bóng của hình vẽ, cắt đều tỷ lệ 16:10 cho đồng nhất
    const cls = className.replace(/drop-shadow\S*/g, '').replace(/max-w-\S+/g, '')
    return <img src={src} alt={type} loading="lazy" onError={() => setFailed(true)} className={`${cls} aspect-[16/10] rounded-2xl object-cover`} style={flip ? { transform: 'scaleX(-1)' } : undefined} />
  }
  const hex = COLORS.find((c) => c.id === color)?.hex || color
  const light = shade(hex, 36), dark = shade(hex, -42), edge = shade(hex, -70)
  const long = type === 'minibus' || type === 'bus' || type === 'van'
  const body = BODY[type] || BODY.sedan
  const wheels = WHEELS[type] || WHEELS.sedan
  const r = RADIUS[type] || 24
  const left = type === 'bus' ? 20 : type === 'minibus' ? 32 : type === 'van' ? 44 : 50
  const right = type === 'bus' ? 388 : type === 'minibus' ? 372 : type === 'van' ? 366 : type === 'sedan' ? 354 : 360

  return (
    <svg viewBox="8 16 392 150" className={className} style={flip ? { transform: 'scaleX(-1)' } : undefined} role="img" aria-label={type}>
      <defs>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="0.5" stopColor={hex} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e4f4fd" />
          <stop offset="1" stopColor="#6f9db9" />
        </linearGradient>
      </defs>
      <ellipse cx="205" cy="157" rx="176" ry="8" fill="#000" opacity="0.2" />
      <path d={body} fill={`url(#b${id})`} stroke={edge} strokeWidth="1.2" strokeLinejoin="round" />
      {(GLASS[type] || GLASS.sedan).map((d, i) => (
        <path key={i} d={d} fill={`url(#g${id})`} stroke={edge} strokeWidth="0.8" />
      ))}
      {/* đường gờ thân xe + tay nắm cửa */}
      <path d={`M${left + 8} ${long ? 104 : 100} L${right - 10} ${long ? 104 : 100}`} stroke={edge} strokeOpacity="0.35" strokeWidth="1.2" />
      {!long && <rect x="196" y="92" width="14" height="3" rx="1.5" fill={edge} opacity="0.6" />}
      {type === 'bus' && <rect x="20" y="112" width="368" height="7" fill={dark} opacity="0.55" />}
      {type === 'minibus' && <rect x="32" y="112" width="340" height="5" fill={dark} opacity="0.5" />}
      {long && <rect x={right - 60} y="90" width="12" height="38" rx="2" fill={dark} opacity="0.3" />}
      {/* đèn trước / sau */}
      <path d={`M${right - 12} 100 L${right} 104 L${right} 114 L${right - 14} 112 Z`} fill="#fff6c2" stroke={edge} strokeWidth="0.6" />
      <rect x={left} y="102" width="7" height="12" rx="2" fill="#ef2d3a" />
      {/* cản trước */}
      <rect x={right - 6} y="120" width="10" height="8" rx="2" fill={dark} />
      {/* viền sáng */}
      <path d={body} fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="1" transform="translate(0 -1)" />
      {/* bánh xe */}
      {wheels.map((x) => (
        <g key={x}>
          <circle cx={x} cy="130" r={r + 5} fill="#0b0c10" opacity="0.5" />
          <circle cx={x} cy="132" r={r} fill="#15161b" />
          <circle cx={x} cy="132" r={r * 0.55} fill="#d2d6de" />
          <circle cx={x} cy="132" r={r * 0.2} fill="#6b707a" />
          {[0, 72, 144, 216, 288].map((a) => (
            <line key={a} x1={x} y1="132" x2={x + r * 0.5 * Math.cos((a * Math.PI) / 180)} y2={132 + r * 0.5 * Math.sin((a * Math.PI) / 180)} stroke="#7a808b" strokeWidth="2" />
          ))}
        </g>
      ))}
    </svg>
  )
}
