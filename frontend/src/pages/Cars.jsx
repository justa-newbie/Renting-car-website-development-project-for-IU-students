import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Handshake, Search, SlidersHorizontal, X } from 'lucide-react'
import CarCard from '@/components/CarCard'
import Button from '@/components/ui/Button'
import { Checkbox, inputCls } from '@/components/ui/Field'
import { Empty, Pagination, RangeSlider, Switch } from '@/components/ui/misc'
import { useDocTitle } from '@/components/Guards'
import { useI18n } from '@/context/I18nContext'
import { useStore } from '@/context/StoreContext'
import { BRANDS, CITIES, COLORS, FUELS, SEAT_GROUPS, TRANSMISSIONS } from '@/data/constants'
import { cx, money, seatGroup, todayISO, addDays } from '@/lib/format'

const PAGE = 9
const MIN = 400000
const MAX = 7500000

const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

export default function Cars() {
  const { t, l } = useI18n()
  const { cars, carState, ratingOf } = useStore()
  const [sp] = useSearchParams()
  useDocTitle(t('Thuê xe', 'Rent a car'))

  const initial = () => ({
    q: sp.get('q') || '',
    city: sp.get('city') || '',
    brand: sp.get('brand') || '',
    seats: sp.get('seats') ? [Number(sp.get('seats'))] : [],
    fuel: [], trans: [], colors: [],
    rental: sp.get('driver') === '1' ? 'driver' : 'any',
    price: [MIN, MAX],
    from: sp.get('from') || '',
    to: sp.get('to') || '',
    availableOnly: !!(sp.get('from') && sp.get('to')),
  })
  const [f, setF] = useState(initial)
  const [sort, setSort] = useState('popular')
  const [page, setPage] = useState(1)
  const [drawer, setDrawer] = useState(false)
  const set = (patch) => { setF((s) => ({ ...s, ...patch })); setPage(1) }

  // Khi bấm link từ Home/Footer sang với tham số mới
  useEffect(() => { setF(initial()); setPage(1) }, [sp.toString()]) // eslint-disable-line react-hooks/exhaustive-deps

  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase()
    let r = cars.filter((c) => {
      if (q && !`${c.brand} ${c.model}`.toLowerCase().includes(q)) return false
      if (f.city && c.city !== f.city) return false
      if (f.brand && c.brand !== f.brand) return false
      if (f.seats.length && !f.seats.includes(seatGroup(c.seats))) return false
      if (f.fuel.length && !f.fuel.includes(c.fuel)) return false
      if (f.trans.length && !f.trans.includes(c.transmission)) return false
      if (f.colors.length && !f.colors.includes(c.color)) return false
      if (f.rental === 'self' && c.driverOnly) return false
      if (c.pricePerDay < f.price[0] || c.pricePerDay > f.price[1]) return false
      if (f.availableOnly && carState(c, f.from, f.to).state !== 'available') return false
      return true
    })
    const rate = (c) => ratingOf(c.id).avg
    if (sort === 'popular') r = [...r].sort((a, b) => rate(b) - rate(a))
    if (sort === 'priceAsc') r = [...r].sort((a, b) => a.pricePerDay - b.pricePerDay)
    if (sort === 'priceDesc') r = [...r].sort((a, b) => b.pricePerDay - a.pricePerDay)
    if (sort === 'newest') r = [...r].sort((a, b) => b.year - a.year)
    return r
  }, [cars, f, sort, carState, ratingOf])

  const pages = Math.max(1, Math.ceil(list.length / PAGE))
  const cur = Math.min(page, pages)
  const slice = list.slice((cur - 1) * PAGE, cur * PAGE)
  const search = f.from && f.to ? `?from=${f.from}&to=${f.to}${f.rental === 'driver' ? '&driver=1' : ''}` : ''
  const reset = () => { setF({ ...initial(), q: '', city: '', brand: '', seats: [], rental: 'any', from: '', to: '', availableOnly: false }); setPage(1) }

  const label = 'mb-2.5 mt-6 text-sm font-bold'
  const panel = (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold">{t('Bộ lọc', 'Filters')}</h2>
        <button onClick={reset} className="cursor-pointer text-sm font-semibold text-primary hover:underline">{t('Đặt lại', 'Reset')}</button>
      </div>

      <div className="relative mt-5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder={t('Tìm hãng, mẫu xe...', 'Search brand, model...')} className={cx(inputCls, 'pl-10')} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <select value={f.brand} onChange={(e) => set({ brand: e.target.value })} className={inputCls} aria-label="brand">
          <option value="">{t('Mọi hãng', 'All brands')}</option>
          {BRANDS.map((b) => <option key={b}>{b}</option>)}
        </select>
        <select value={f.city} onChange={(e) => set({ city: e.target.value })} className={inputCls} aria-label="city">
          <option value="">{t('Mọi thành phố', 'All cities')}</option>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <p className={label}>{t('Ngày thuê', 'Rental dates')}</p>
      <div className="grid grid-cols-2 gap-2">
        <input type="date" min={todayISO()} value={f.from} onChange={(e) => set({ from: e.target.value, to: f.to && f.to <= e.target.value ? addDays(e.target.value, 1) : f.to })} className={inputCls} aria-label="from" />
        <input type="date" min={f.from ? addDays(f.from, 1) : todayISO()} value={f.to} onChange={(e) => set({ to: e.target.value })} className={inputCls} aria-label="to" />
      </div>

      <p className={label}>{t('Giá thuê mỗi ngày', 'Price per day')}</p>
      <div className="mb-1 flex justify-between text-xs font-bold">
        <span className="rounded-lg bg-primary px-2 py-1 text-onprimary">{money(f.price[0])}</span>
        <span className="rounded-lg bg-primary px-2 py-1 text-onprimary">{money(f.price[1])}</span>
      </div>
      <RangeSlider min={MIN} max={MAX} step={50000} value={f.price} onChange={(price) => set({ price })} />

      <p className={label}>{t('Số chỗ', 'Seats')}</p>
      <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
        {SEAT_GROUPS.map((g) => <Checkbox key={g.key} label={l(g)} checked={f.seats.includes(g.key)} onChange={() => set({ seats: toggleIn(f.seats, g.key) })} />)}
      </div>

      <p className={label}>{t('Nhiên liệu', 'Fuel')}</p>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(FUELS).map(([k, v]) => <Checkbox key={k} label={l(v)} checked={f.fuel.includes(k)} onChange={() => set({ fuel: toggleIn(f.fuel, k) })} />)}
      </div>

      <p className={label}>{t('Hộp số', 'Transmission')}</p>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(TRANSMISSIONS).map(([k, v]) => <Checkbox key={k} label={l(v)} checked={f.trans.includes(k)} onChange={() => set({ trans: toggleIn(f.trans, k) })} />)}
      </div>

      <p className={label}>{t('Màu xe', 'Color')}</p>
      <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
        {COLORS.map((c) => (
          <button key={c.id} onClick={() => set({ colors: toggleIn(f.colors, c.id) })} className="flex cursor-pointer items-center gap-2 text-left text-sm">
            <span className={cx('size-5 rounded-full border-2', f.colors.includes(c.id) ? 'border-primary ring-2 ring-primary/30' : 'border-line')} style={{ background: c.hex }} />
            <span className={f.colors.includes(c.id) ? 'font-bold' : ''}>{l(c)}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <Switch checked={f.availableOnly} onChange={(v) => set({ availableOnly: v })} label={t('Chỉ xe còn trống', 'Available only')} />
      </div>

      <p className={label}>{t('Hình thức thuê', 'Rental type')}</p>
      <div className="flex gap-1.5">
        {[['any', t('Tất cả', 'Any')], ['self', t('Tự lái', 'Self-drive')], ['driver', t('Có tài xế', 'Chauffeur')]].map(([k, v]) => (
          <button key={k} onClick={() => set({ rental: k })} className={cx('cursor-pointer rounded-full px-3.5 py-2 text-xs font-bold transition', f.rental === k ? 'bg-primary text-onprimary' : 'bg-surface text-fg hover:bg-line')}>{v}</button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="container-x py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{list.length} {t('xe cho thuê', 'cars to rent')}</h1>
          <p className="mt-1 text-sm text-muted">{t('Giá đã gồm VAT. Xe 16 chỗ trở lên đã bao gồm tài xế.', 'Prices include VAT. 16+ seat vehicles include a driver.')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setDrawer(true)}><SlidersHorizontal className="size-4" />{t('Bộ lọc', 'Filters')}</Button>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={cx(inputCls, 'h-10 w-auto rounded-full')} aria-label="sort">
            <option value="popular">{t('Phổ biến nhất', 'Most popular')}</option>
            <option value="priceAsc">{t('Giá thấp đến cao', 'Price: low to high')}</option>
            <option value="priceDesc">{t('Giá cao đến thấp', 'Price: high to low')}</option>
            <option value="newest">{t('Đời xe mới nhất', 'Newest')}</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="hidden self-start rounded-3xl bg-surface2 p-5 lg:sticky lg:top-24 lg:block">{panel}</aside>

        <div>
          {list.length === 0 ? (
            <Empty icon={Search} title={t('Không tìm thấy xe phù hợp', 'No matching cars')} text={t('Thử bỏ bớt bộ lọc hoặc chọn ngày khác.', 'Try removing filters or choosing other dates.')} action={<Button onClick={reset}>{t('Xóa bộ lọc', 'Clear filters')}</Button>} />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {slice.map((c, i) => (
                <div key={c.id} className="contents">
                  <CarCard car={c} from={f.from} to={f.to} search={search} />
                  {i === 2 && cur === 1 && (
                    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-slate-900 to-blue-950 p-6 text-white md:col-span-2 xl:col-span-1">
                      <Handshake className="absolute -right-4 -top-4 size-28 text-white/10" />
                      <div>
                        <h3 className="text-2xl font-extrabold">{t('Cùng làm đối tác!', 'We are a team!')}</h3>
                        <p className="mt-2 max-w-[220px] text-sm text-white/75">{t('Có xe nhàn rỗi? Cho thuê qua IUDrive và bắt đầu có thu nhập.', 'Got an idle car? List it on IUDrive and start earning.')}</p>
                      </div>
                      <Button as={Link} to="/contact" className="mt-6 self-start !bg-blue-500 hover:!bg-blue-400">{t('Tìm hiểu thêm', 'Read more')}<ArrowRight className="size-4" /></Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <Pagination page={cur} pages={pages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="mt-10" />
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
          <div className="animate-slide-in absolute right-0 top-0 h-full w-[min(92vw,380px)] overflow-y-auto bg-bg p-5">
            <button onClick={() => setDrawer(false)} aria-label="Close" className="absolute right-4 top-4 grid size-9 cursor-pointer place-items-center rounded-full hover:bg-surface2"><X className="size-5" /></button>
            <div className="mt-8">{panel}</div>
            <Button className="mt-6 w-full" onClick={() => setDrawer(false)}>{t('Xem', 'Show')} {list.length} {t('xe', 'cars')}</Button>
          </div>
        </div>
      )}
    </div>
  )
}
