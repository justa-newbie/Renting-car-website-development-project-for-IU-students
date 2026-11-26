import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Fuel, Settings2, Star, Users } from 'lucide-react'
import { useI18n } from '@/context/I18nContext'
import { useStore } from '@/context/StoreContext'
import { FUELS, TRANSMISSIONS } from '@/data/constants'
import { cx, money } from '@/lib/format'

// Ảnh xe đã tách nền (public/hero/*.webp). carId liên kết tới xe trong dữ liệu để lấy giá và đường dẫn.
const SLIDES = [
  { carId: 'c12', img: '/hero/vf8.webp?v=2', w: 82, tagVi: 'Xe điện thế hệ mới', tagEn: 'Next-gen electric' },
  { carId: 'c11', img: '/hero/fortuner.webp?v=2', w: 64, tagVi: 'SUV địa hình bền bỉ', tagEn: 'Rugged family SUV' },
  { carId: 'c13', img: '/hero/carnival.webp?v=2', w: 70, tagVi: 'MPV cho cả gia đình', tagEn: 'MPV for the whole family' },
]

/** Sân khấu showroom: xe tách nền, ánh sáng, chữ nền, phản chiếu, nghiêng theo chuột, tự chuyển cảnh */
export default function HeroShowcase() {
  const { t, l } = useI18n()
  const { cars, ratingOf } = useStore()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const stage = useRef(null)

  const next = useCallback((d = 1) => setI((x) => (x + d + SLIDES.length) % SLIDES.length), [])

  useEffect(() => {
    if (paused || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => next(1), 5200)
    return () => clearInterval(id)
  }, [paused, next])

  // Nghiêng 3D nhẹ theo vị trí chuột (cập nhật biến CSS, không render lại React)
  const onMove = (e) => {
    const el = stage.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
    el.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
  }
  const onLeave = () => {
    setPaused(false)
    stage.current?.style.setProperty('--mx', 0)
    stage.current?.style.setProperty('--my', 0)
  }

  const cur = SLIDES[i]
  const car = cars.find((c) => c.id === cur.carId)
  const rating = car ? ratingOf(car.id) : { avg: 0, count: 0 }

  return (
    <div
      ref={stage}
      onMouseMove={onMove}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={onLeave}
      style={{ '--mx': 0, '--my': 0 }}
      className="relative mx-auto w-full max-w-[680px] select-none lg:max-w-none"
    >
      {/* Nền sân khấu */}
      <div className="absolute inset-x-0 bottom-0 top-14 overflow-hidden rounded-[40px] bg-[#0f1015] shadow-[0_40px_80px_-30px_rgba(229,35,47,0.45)] ring-1 ring-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_62%_45%,rgba(229,35,47,0.6),transparent_70%),radial-gradient(40%_50%_at_10%_100%,rgba(255,120,60,0.25),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(70%_80%_at_50%_60%,#000,transparent)]" />
        <p
          className="absolute inset-x-0 top-8 select-none text-center text-[clamp(4.5rem,15vw,10.5rem)] font-extrabold leading-none tracking-tighter text-transparent transition-transform duration-300 [-webkit-text-stroke:1.5px_rgba(255,255,255,0.16)]"
          style={{ transform: 'translate(calc(var(--mx) * -14px), calc(var(--my) * -8px))' }}
          aria-hidden="true"
        >
          IUDRIVE
        </p>
        {[18, 36, 54].map((top, k) => (
          <span key={k} className="hero-streak absolute h-px w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent" style={{ top: `${top}%`, animationDelay: `${k * 0.9}s` }} />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      {/* Xe */}
      <div className="relative h-[330px] sm:h-[400px] lg:h-[470px]" style={{ perspective: '1200px', clipPath: 'inset(-400px -60px 0 -60px)' }}>
        <div className="absolute bottom-[19%] left-[56%] h-8 w-[66%] -translate-x-1/2 rounded-full bg-primary/70 blur-2xl" />
        {SLIDES.map((s, k) => (
          <div
            key={s.img}
            aria-hidden={k !== i}
            className={cx(
              'absolute inset-x-[-2%] bottom-[22%] transition-all duration-[900ms] ease-out',
              k === i ? 'translate-x-0 scale-100 opacity-100 blur-0' : k < i || (i === 0 && k === SLIDES.length - 1) ? '-translate-x-24 scale-95 opacity-0 blur-md' : 'translate-x-24 scale-95 opacity-0 blur-md',
            )}
          >
            <div
              className="transition-transform duration-200 ease-out"
              style={{ transform: 'rotateY(calc(var(--mx) * 7deg)) rotateX(calc(var(--my) * -3deg)) translate(calc(var(--mx) * 8px), calc(var(--my) * 4px))' }}
            >
              <div className="hero-float relative">
                <img src={s.img} alt={car ? `${car.brand} ${car.model}` : ''} loading={k === 0 ? 'eager' : 'lazy'} draggable="false" style={{ width: `${s.w}%` }} className="ml-auto mr-[6%] drop-shadow-[0_30px_35px_rgba(0,0,0,0.55)]" />
                {/* Phản chiếu xuống sàn (đặt tuyệt đối, không đẩy xe lên) */}
                <img src={s.img} alt="" aria-hidden="true" draggable="false" style={{ width: `${s.w}%` }} className="pointer-events-none absolute right-[6%] top-[98%] -scale-y-100 opacity-30 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.9),transparent_40%)]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Thẻ thông tin kính mờ */}
      {car && (
        <div key={car.id} className="animate-fade-up absolute bottom-14 left-3 z-10 hidden w-[min(58%,240px)] rounded-3xl sm:block border border-white/15 bg-white/10 p-4 text-white shadow-2xl backdrop-blur-xl sm:bottom-16 sm:left-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-soft/90 [color:#ff8a92]">{t(cur.tagVi, cur.tagEn)}</p>
          <h3 className="mt-1 text-lg font-extrabold leading-tight sm:text-xl">{car.brand} {car.model}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-white/85">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1"><Users className="size-3" />{car.seats} {t('chỗ', 'seats')}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1"><Fuel className="size-3" />{l(FUELS[car.fuel])}</span>
            <span className="hidden items-center gap-1 rounded-full bg-white/10 px-2 py-1 sm:inline-flex"><Settings2 className="size-3" />{l(TRANSMISSIONS[car.transmission])}</span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-2">
            <p className="text-lg font-extrabold leading-none">{money(car.pricePerDay)}<span className="text-[11px] font-medium text-white/70"> / {t('ngày', 'day')}</span></p>
            <Link to={`/cars/${car.id}`} aria-label={t('Xem xe', 'View car')} className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-onprimary shadow-[0_8px_20px_-6px_var(--primary)] transition hover:scale-110"><ArrowRight className="size-4" /></Link>
          </div>
        </div>
      )}

      {/* Thanh thông tin gọn cho điện thoại */}
      {car && (
        <Link key={'m' + car.id} to={`/cars/${car.id}`} className="animate-fade-up absolute inset-x-4 bottom-14 z-10 flex items-center justify-between gap-3 rounded-full border border-white/15 bg-white/10 py-2 pl-4 pr-2 text-white backdrop-blur-xl sm:hidden">
          <span className="min-w-0 leading-tight"><span className="block truncate text-sm font-extrabold">{car.brand} {car.model}</span><span className="text-[11px] text-white/75">{money(car.pricePerDay)} / {t('ngày', 'day')}</span></span>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-onprimary"><ArrowRight className="size-4" /></span>
        </Link>
      )}

      {/* Chip đánh giá */}
      <div className="absolute right-3 top-20 z-10 hidden items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 p-2.5 pr-4 text-white backdrop-blur-xl sm:flex">
        <span className="grid size-9 place-items-center rounded-full bg-amber-400/25 text-amber-300"><Star className="size-4 fill-current" /></span>
        <div className="leading-tight"><p className="text-sm font-bold">{rating.count ? rating.avg.toFixed(1) : '4.9'} / 5</p><p className="text-[11px] text-white/70">{t('Khách đánh giá', 'Guest rating')}</p></div>
      </div>

      {/* Điều khiển */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
        <button onClick={() => next(-1)} aria-label="Previous" className="grid size-8 cursor-pointer place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25"><ChevronLeft className="size-4" /></button>
        <div className="flex gap-1.5">
          {SLIDES.map((_, k) => (
            <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={cx('h-1.5 cursor-pointer rounded-full transition-all', k === i ? 'w-7 bg-primary' : 'w-1.5 bg-white/40 hover:bg-white/70')} />
          ))}
        </div>
        <button onClick={() => next(1)} aria-label="Next" className="grid size-8 cursor-pointer place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25"><ChevronRight className="size-4" /></button>
      </div>
    </div>
  )
}
