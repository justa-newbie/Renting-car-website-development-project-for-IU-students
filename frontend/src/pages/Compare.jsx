import { Link } from 'react-router-dom'
import { GitCompareArrows, X } from 'lucide-react'
import CarImage from '@/components/CarImage'
import Button from '@/components/ui/Button'
import { Empty, Rating } from '@/components/ui/misc'
import { useDocTitle } from '@/components/Guards'
import { useI18n } from '@/context/I18nContext'
import { useStore } from '@/context/StoreContext'
import { COLORS, FUELS, licenseFor, TRANSMISSIONS } from '@/data/constants'
import { money } from '@/lib/format'

export default function Compare() {
  const { t, l } = useI18n()
  const { compare, getCar, toggleCompare, clearCompare, ratingOf, cars } = useStore()
  useDocTitle(t('So sánh xe', 'Compare cars'))
  const list = compare.map(getCar).filter(Boolean)

  if (!list.length) {
    return (
      <div className="container-x py-16">
        <Empty icon={GitCompareArrows} title={t('Chưa có xe để so sánh', 'No cars to compare')} text={t('Bấm biểu tượng so sánh trên thẻ xe để thêm tối đa 3 xe.', 'Tap the compare icon on a car card to add up to 3 cars.')} action={<Button as={Link} to="/cars">{t('Chọn xe', 'Browse cars')}</Button>} />
      </div>
    )
  }

  const best = (fn, mode = 'min') => {
    const v = list.map(fn)
    return mode === 'min' ? Math.min(...v) : Math.max(...v)
  }
  const rows = [
    [t('Giá / ngày', 'Price / day'), (c) => money(c.pricePerDay), (c) => c.pricePerDay === best((x) => x.pricePerDay)],
    [t('Số chỗ', 'Seats'), (c) => c.seats],
    [t('Hộp số', 'Transmission'), (c) => l(TRANSMISSIONS[c.transmission])],
    [t('Nhiên liệu', 'Fuel'), (c) => l(FUELS[c.fuel])],
    [t('Đời xe', 'Year'), (c) => c.year, (c) => c.year === best((x) => x.year, 'max')],
    [t('Màu', 'Color'), (c) => l(COLORS.find((x) => x.id === c.color))],
    [t('Thành phố', 'City'), (c) => c.city],
    [t('Hình thức', 'Rental type'), (c) => (c.driverOnly ? t('Có tài xế', 'Chauffeur only') : t('Tự lái / có tài xế', 'Self-drive / chauffeur'))],
    [t('Tiền cọc', 'Deposit'), (c) => (c.deposit ? money(c.deposit) : '—')],
    [t('Bằng lái (tự lái)', 'Licence (self-drive)'), (c) => (c.driverOnly ? '—' : licenseFor(c.seats))],
    [t('Tiện nghi', 'Features'), (c) => `${c.features.length} ${t('tiện nghi', 'features')}`, (c) => c.features.length === best((x) => x.features.length, 'max')],
    [t('Đánh giá', 'Rating'), (c) => <Rating value={ratingOf(c.id).avg} count={ratingOf(c.id).count} size="size-3.5" />],
  ]
  const slots = 3 - list.length
  const suggestions = cars.filter((c) => !compare.includes(c.id)).slice(0, 4)

  return (
    <div className="container-x py-8">
      <div className="mb-6 flex items-end justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">{t('So sánh xe', 'Compare cars')}</h1>
        <button onClick={clearCompare} className="cursor-pointer text-sm font-semibold text-primary hover:underline">{t('Xóa tất cả', 'Clear all')}</button>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-line bg-surface">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-40 p-4" />
              {list.map((c) => (
                <th key={c.id} className="relative border-l border-line p-4 align-top">
                  <button onClick={() => toggleCompare(c.id)} aria-label="remove" className="absolute right-3 top-3 grid size-7 cursor-pointer place-items-center rounded-full bg-surface2 hover:bg-line"><X className="size-4" /></button>
                  <CarImage src={c.image} type={c.type} color={c.color} className="mx-auto w-44" />
                  <p className="mt-2 text-xs font-medium text-muted">{c.brand}</p>
                  <p className="text-base font-extrabold">{c.model}</p>
                  <Button as={Link} to={`/cars/${c.id}`} size="sm" className="mt-3">{t('Xem & đặt', 'View & book')}</Button>
                </th>
              ))}
              {[...Array(slots)].map((_, i) => (
                <th key={i} className="border-l border-line p-4">
                  <Link to="/cars" className="grid h-40 place-items-center rounded-2xl border border-dashed border-line text-muted hover:border-primary hover:text-primary">+ {t('Thêm xe', 'Add car')}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, fn, isBest], i) => (
              <tr key={label} className={i % 2 ? '' : 'bg-surface2/50'}>
                <td className="p-4 font-semibold text-muted">{label}</td>
                {list.map((c) => (
                  <td key={c.id} className="border-l border-line p-4 text-center font-semibold">
                    <span className={isBest?.(c) && list.length > 1 ? 'rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-600 dark:text-emerald-400' : ''}>{fn(c)}</span>
                  </td>
                ))}
                {[...Array(slots)].map((_, k) => <td key={k} className="border-l border-line" />)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {slots > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-bold">{t('Gợi ý thêm', 'Suggestions')}</h2>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((c) => <button key={c.id} onClick={() => toggleCompare(c.id)} className="cursor-pointer rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary">+ {c.brand} {c.model}</button>)}
          </div>
        </div>
      )}
    </div>
  )
}
