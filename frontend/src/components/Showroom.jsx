import { useEffect, useRef, useState } from 'react'
import { cx } from '@/lib/format'

// Ảnh xe đã tách nền, dùng chung cho các trang có phong cách "showroom"
export const CUTOUTS = {
  vf8: '/hero/vf8.webp?v=2',
  fortuner: '/hero/fortuner.webp?v=2',
  carnival: '/hero/carnival.webp?v=2',
}

/** Nền sân khấu tối: ánh đỏ, lưới mờ, chữ viền khổng lồ, vệt sáng. Thẻ cha cần: relative overflow-hidden */
export function ShowroomBackdrop({ ghost = 'IUDRIVE', ghostClass = 'top-8' }) {
  return (
    <div className="pointer-events-none absolute inset-0 bg-[#0f1015]" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(65%_60%_at_65%_55%,rgba(229,35,47,0.55),transparent_70%),radial-gradient(45%_45%_at_0%_100%,rgba(255,120,60,0.22),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(75%_80%_at_50%_60%,#000,transparent)]" />
      <p className={cx('absolute inset-x-0 select-none whitespace-nowrap text-center text-[clamp(4rem,11vw,9rem)] font-extrabold leading-none tracking-tighter text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.13)]', ghostClass)}>
        {ghost}
      </p>
      {[24, 48].map((top, k) => (
        <span key={top} className="hero-streak absolute h-px w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{ top: `${top}%`, animationDelay: `${k * 1.3}s` }} />
      ))}
    </div>
  )
}

/** Xe tách nền lơ lửng, có quầng sáng và phản chiếu xuống sàn */
export function CarCutout({ car = 'vf8', alt = '', className }) {
  const src = CUTOUTS[car] || car
  return (
    <div className={cx('relative', className)}>
      <div className="absolute bottom-0 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-full bg-primary/70 blur-2xl" />
      <div className="hero-float relative">
        <img src={src} alt={alt} draggable="false" className="relative w-full drop-shadow-[0_28px_30px_rgba(0,0,0,0.55)]" />
        <img src={src} alt="" aria-hidden="true" draggable="false" className="pointer-events-none absolute inset-x-0 top-[98%] w-full -scale-y-100 opacity-25 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.9),transparent_40%)]" />
      </div>
    </div>
  )
}

/** Số đếm tăng dần, bắt đầu khi cuộn tới */
export function CountUp({ to, decimals = 0, suffix = '', ms = 1400 }) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(typeof IntersectionObserver === 'undefined')
  const [v, setV] = useState(0)

  useEffect(() => {
    if (seen || !ref.current) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true))
    io.observe(ref.current)
    return () => io.disconnect()
  }, [seen])

  useEffect(() => {
    if (!seen) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setV(to)
      return
    }
    let raf
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, Math.max(0, (now - t0) / ms))
      setV(to * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, to, ms])

  return <span ref={ref}>{v.toFixed(decimals)}{suffix}</span>
}
