import { Link } from 'react-router-dom'
import { Fuel, GitCompareArrows, Heart, Settings2, Users } from 'lucide-react'
import CarImage from './CarImage'
import Badge from './ui/Badge'
import { Rating } from './ui/misc'
import { useStore } from '@/context/StoreContext'
import { useI18n } from '@/context/I18nContext'
import { FUELS, TRANSMISSIONS } from '@/data/constants'
import { cx, fmtDate, money } from '@/lib/format'

/** Thẻ xe theo phong cách Starcar: huy hiệu trạng thái, tim yêu thích, ảnh, tên + giá */
export default function CarCard({ car, from, to, highlight = false, search = '' }) {
  const { t, l, lang } = useI18n()
  const { carState, favorites, toggleFav, compare, toggleCompare, ratingOf } = useStore()
  const st = carState(car, from, to)
  const fav = favorites.includes(car.id)
  const cmp = compare.includes(car.id)
  const rating = ratingOf(car.id)

  return (
    <article
      className={cx(
        'group relative flex flex-col rounded-3xl border p-4 transition duration-300 hover:-translate-y-1 hover:shadow-soft',
        highlight ? 'border-primary bg-primary text-onprimary' : 'border-line bg-surface',
      )}
    >
      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {car.isNew && <Badge tone="solidWarm">{t('Mới', 'New')}</Badge>}
          {st.state === 'available' && <Badge tone="solidSuccess">{t('Còn trống', 'Available')}</Badge>}
          {st.state === 'booked' && <Badge tone="solidMuted">{t('Kín lịch đến ', 'Booked till ')}{fmtDate(st.until, lang).slice(0, 5)}</Badge>}
          {st.state === 'maintenance' && <Badge tone="warning">{t('Đang bảo dưỡng', 'Maintenance')}</Badge>}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => toggleCompare(car.id)}
            aria-label={t('So sánh', 'Compare')}
            title={t('So sánh', 'Compare')}
            className={cx('grid size-8 cursor-pointer place-items-center rounded-full transition', cmp ? 'bg-primary text-onprimary' : highlight ? 'bg-white/20 hover:bg-white/30' : 'bg-surface2 text-muted hover:text-fg')}
          >
            <GitCompareArrows className="size-4" />
          </button>
          <button
            onClick={() => toggleFav(car.id)}
            aria-label={t('Yêu thích', 'Favorite')}
            className={cx('grid size-8 cursor-pointer place-items-center rounded-full transition', highlight ? 'bg-white/20 hover:bg-white/30' : 'bg-surface2 hover:scale-110')}
          >
            <Heart className={cx('size-4', fav ? 'fill-primary text-primary' : highlight ? 'text-white' : 'text-muted')} />
          </button>
        </div>
      </div>

      <Link to={`/cars/${car.id}${search}`} className="block">
        <div className={cx('my-2 grid min-h-36 place-items-center', st.state === 'maintenance' && 'opacity-60 grayscale')}>
          <CarImage src={car.image} type={car.type} color={car.color} className="w-full max-w-[290px] drop-shadow-xl transition duration-500 group-hover:scale-105" />
        </div>

        <div className={cx('flex items-center gap-3 text-xs', highlight ? 'text-white/85' : 'text-muted')}>
          <span className="inline-flex items-center gap-1"><Users className="size-3.5" />{car.seats} {t('chỗ', 'seats')}</span>
          <span className="inline-flex items-center gap-1"><Settings2 className="size-3.5" />{l(TRANSMISSIONS[car.transmission])}</span>
          <span className="inline-flex items-center gap-1"><Fuel className="size-3.5" />{l(FUELS[car.fuel])}</span>
        </div>

        <div className="mt-2.5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className={cx('truncate text-xs', highlight ? 'text-white/80' : 'text-muted')}>{car.brand} · {car.city}</p>
            <h3 className="truncate text-base font-bold leading-tight">{car.model}, {car.year}</h3>
            {rating.count > 0 && <div className="mt-1"><Rating value={rating.avg} count={rating.count} size="size-3.5" /></div>}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-extrabold leading-none">{money(car.pricePerDay)}</p>
            <p className={cx('mt-1 text-[11px]', highlight ? 'text-white/80' : 'text-muted')}>
              / {t('ngày', 'day')}{car.driverOnly ? ` · ${t('gồm tài xế', 'with driver')}` : ''}
            </p>
          </div>
        </div>
      </Link>
    </article>
  )
}
