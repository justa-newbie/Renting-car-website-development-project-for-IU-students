import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CalendarDays, Check, ChevronRight, Fuel, GitCompareArrows, Heart, IdCard, Info, Settings2, ShieldCheck, Users, Wallet } from 'lucide-react'
import CarCard from '@/components/CarCard'
import CarImage from '@/components/CarImage'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { inputCls, Textarea } from '@/components/ui/Field'
import { Empty, Rating, RatingInput } from '@/components/ui/misc'
import { useDocTitle } from '@/components/Guards'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/context/I18nContext'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { COLORS, FEATURES, FUELS, licenseFor, TRANSMISSIONS } from '@/data/constants'
import { addDays, cx, daysBetween, fmtDate, money, seatGroup, todayISO } from '@/lib/format'
import { computeQuote } from '@/lib/pricing'

export default function CarDetail() {
  const { id } = useParams()
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const { t, l, lang } = useI18n()
  const toast = useToast()
  const { user } = useAuth()
  const { cars, getCar, carState, busyRanges, ratingOf, reviews, addReview, favorites, toggleFav, compare, toggleCompare } = useStore()
  const car = getCar(id)

  const [from, setFrom] = useState(sp.get('from') || todayISO())
  const [to, setTo] = useState(sp.get('to') || addDays(sp.get('from') || todayISO(), 2))
  const [withDriver, setWithDriver] = useState(sp.get('driver') === '1')
  const [stars, setStars] = useState(5)
  const [comment, setComment] = useState('')
  useDocTitle(car ? `${car.brand} ${car.model}` : '')

  if (!car) {
    return (
      <div className="container-x py-20">
        <Empty title={t('Không tìm thấy xe', 'Car not found')} action={<Button as={Link} to="/cars">{t('Về danh sách xe', 'Back to cars')}</Button>} />
      </div>
    )
  }

  const rating = ratingOf(car.id)
  const st = carState(car, from, to)
  const busy = busyRanges(car.id)
  const carReviews = reviews.filter((r) => r.carId === car.id).sort((a, b) => b.date.localeCompare(a.date))
  const driver = car.driverOnly || withDriver
  const q = computeQuote({ car, from, to, withDriver })
  const fav = favorites.includes(car.id)
  const cmp = compare.includes(car.id)
  const related = cars.filter((c) => c.id !== car.id && seatGroup(c.seats) === seatGroup(car.seats)).slice(0, 3)
  const colorName = l(COLORS.find((c) => c.id === car.color))

  const book = () => {
    if (st.state !== 'available') return toast(t('Xe không còn trống trong khoảng ngày này', 'This car is not available for these dates'), 'error')
    nav(`/booking/${car.id}?from=${from}&to=${to}${withDriver ? '&driver=1' : ''}`)
  }

  const submitReview = (e) => {
    e.preventDefault()
    if (!user) return nav('/login', { state: { from: `/cars/${car.id}` } })
    if (comment.trim().length < 5) return toast(t('Nhận xét cần ít nhất 5 ký tự', 'Please write at least 5 characters'), 'error')
    addReview({ carId: car.id, userId: user.id, userName: user.name, rating: stars, comment: comment.trim() })
    setComment('')
    toast(t('Cảm ơn bạn đã đánh giá!', 'Thanks for your review!'))
  }

  const spec = (Icon, label, value) => (
    <div className="rounded-2xl bg-surface2 p-4">
      <Icon className="size-5 text-primary" />
      <p className="mt-2 text-xs text-muted">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  )

  return (
    <div className="container-x py-8">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted">
        <Link to="/" className="hover:text-primary">{t('Trang chủ', 'Home')}</Link><ChevronRight className="size-4" />
        <Link to="/cars" className="hover:text-primary">{t('Thuê xe', 'Cars')}</Link><ChevronRight className="size-4" />
        <span className="font-semibold text-fg">{car.brand} {car.model}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0">
          {/* Ảnh */}
          <div className="relative overflow-hidden rounded-[32px] border border-line bg-gradient-to-br from-surface2 to-surface p-6 sm:p-10">
            <div className="absolute left-5 top-5 flex flex-wrap gap-1.5">
              {car.isNew && <Badge tone="solidWarm">{t('Mới', 'New')}</Badge>}
              {st.state === 'available' && <Badge tone="solidSuccess">{t('Còn trống', 'Available')}</Badge>}
              {st.state === 'booked' && <Badge tone="solidMuted">{t('Kín lịch', 'Booked')}</Badge>}
              {st.state === 'maintenance' && <Badge tone="warning">{t('Đang bảo dưỡng', 'Maintenance')}</Badge>}
            </div>
            <div className="absolute right-5 top-5 flex gap-2">
              <button onClick={() => toggleCompare(car.id)} aria-label="compare" className={cx('grid size-10 cursor-pointer place-items-center rounded-full border border-line', cmp ? 'bg-primary text-onprimary' : 'bg-surface')}><GitCompareArrows className="size-[18px]" /></button>
              <button onClick={() => toggleFav(car.id)} aria-label="favorite" className="grid size-10 cursor-pointer place-items-center rounded-full border border-line bg-surface"><Heart className={cx('size-[18px]', fav && 'fill-primary text-primary')} /></button>
            </div>
            <CarImage src={car.image} type={car.type} color={car.color} className="mx-auto mt-6 w-full max-w-[560px] drop-shadow-2xl" />
          </div>

          {/* Tiêu đề */}
          <div className="mt-8 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary">{car.brand}</p>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{car.model} {car.year}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
                <Rating value={rating.avg} count={rating.count} />
                <span>·</span><span>{car.city}</span><span>·</span><span>{t('Biển số', 'Plate')} {car.plate.slice(0, 3)}***</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {spec(Users, t('Số chỗ', 'Seats'), `${car.seats} ${t('chỗ', 'seats')}`)}
            {spec(Settings2, t('Hộp số', 'Transmission'), l(TRANSMISSIONS[car.transmission]))}
            {spec(Fuel, t('Nhiên liệu', 'Fuel'), l(FUELS[car.fuel]))}
            {spec(CalendarDays, t('Đời xe · Màu', 'Year · Color'), `${car.year} · ${colorName}`)}
          </div>

          <section className="mt-10">
            <h2 className="text-xl font-extrabold">{t('Mô tả', 'Description')}</h2>
            <p className="mt-3 leading-relaxed text-muted">
              {t(
                `${car.brand} ${car.model} đời ${car.year}, ${car.seats} chỗ, ${l(TRANSMISSIONS[car.transmission]).toLowerCase()}, chạy ${l(FUELS[car.fuel]).toLowerCase()}. Xe được bảo dưỡng định kỳ, vệ sinh sạch sẽ trước mỗi chuyến, phù hợp ${car.seats <= 7 ? 'di chuyển gia đình, công tác và du lịch' : 'đoàn du lịch, sự kiện, đưa đón nhân viên và đám cưới'}.`,
                `${car.year} ${car.brand} ${car.model}, ${car.seats} seats, ${l(TRANSMISSIONS[car.transmission]).toLowerCase()}, ${l(FUELS[car.fuel]).toLowerCase()}. Regularly serviced and cleaned before every trip, ideal for ${car.seats <= 7 ? 'family travel, business and tourism' : 'tour groups, events, staff shuttles and weddings'}.`,
              )}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-extrabold">{t('Tiện nghi', 'Features')}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {car.features.map((f) => (
                <span key={f} className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-3.5 py-3 text-sm font-medium">
                  <Check className="size-4 text-emerald-500" />{l(FEATURES[f])}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-extrabold">{t('Điều kiện thuê', 'Rental terms')}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {car.driverOnly ? (
                <li className="flex gap-3 rounded-2xl border border-line bg-surface p-4 text-sm"><IdCard className="size-5 shrink-0 text-primary" /><span>{t('Thuê kèm tài xế chuyên nghiệp, bạn không cần bằng lái.', 'Rented with a professional driver; no licence needed.')}</span></li>
              ) : (
                <>
                  <li className="flex gap-3 rounded-2xl border border-line bg-surface p-4 text-sm"><IdCard className="size-5 shrink-0 text-primary" /><span>{t('Tự lái: cần CCCD và bằng lái hạng', 'Self-drive: ID and licence class')} <b>{licenseFor(car.seats)}</b>.</span></li>
                  <li className="flex gap-3 rounded-2xl border border-line bg-surface p-4 text-sm"><Wallet className="size-5 shrink-0 text-primary" /><span>{t('Đặt cọc', 'Deposit')} <b>{money(car.deposit)}</b> ({t('hoàn trong 24 giờ', 'refunded in 24h')}).</span></li>
                  <li className="flex gap-3 rounded-2xl border border-line bg-surface p-4 text-sm"><Info className="size-5 shrink-0 text-primary" /><span>{t('Giới hạn', 'Limit')} <b>{car.kmLimit} km/{t('ngày', 'day')}</b>, {t('vượt tính 3.000đ/km', 'extra 3,000đ/km')}.</span></li>
                </>
              )}
              <li className="flex gap-3 rounded-2xl border border-line bg-surface p-4 text-sm"><ShieldCheck className="size-5 shrink-0 text-primary" /><span>{t('Hủy miễn phí trước 24 giờ nhận xe.', 'Free cancellation up to 24h before pickup.')}</span></li>
            </ul>
          </section>

          {/* Lịch bận */}
          <section className="mt-10">
            <h2 className="text-xl font-extrabold">{t('Lịch xe đã được đặt', 'Booked dates')}</h2>
            {busy.length === 0 ? (
              <p className="mt-3 text-sm text-muted">{t('Xe chưa có lịch đặt nào sắp tới.', 'No upcoming bookings for this car.')}</p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {busy.map((b) => <span key={b.id} className="rounded-full bg-surface2 px-3.5 py-2 text-sm font-medium">{fmtDate(b.from, lang)} → {fmtDate(b.to, lang)}</span>)}
              </div>
            )}
          </section>

          {/* Đánh giá */}
          <section className="mt-10">
            <div className="flex items-end justify-between">
              <h2 className="text-xl font-extrabold">{t('Đánh giá', 'Reviews')} ({carReviews.length})</h2>
              {rating.count > 0 && <div className="text-right"><p className="text-3xl font-extrabold">{rating.avg.toFixed(1)}</p><Rating value={rating.avg} showNumber={false} /></div>}
            </div>
            <form onSubmit={submitReview} className="mt-5 rounded-3xl border border-line bg-surface p-5">
              <p className="mb-2 text-sm font-bold">{t('Viết đánh giá của bạn', 'Write a review')}</p>
              <RatingInput value={stars} onChange={setStars} />
              <Textarea className="mt-3" placeholder={t('Chia sẻ trải nghiệm của bạn với chiếc xe này...', 'Share your experience with this car...')} value={comment} onChange={(e) => setComment(e.target.value)} />
              <Button type="submit" size="sm" className="mt-3">{user ? t('Gửi đánh giá', 'Submit') : t('Đăng nhập để đánh giá', 'Log in to review')}</Button>
            </form>
            <div className="mt-5 space-y-3">
              {carReviews.slice(0, 6).map((r) => (
                <div key={r.id} className="rounded-2xl border border-line bg-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">{r.userName.split(' ').slice(-1)[0][0]}</span>
                      <div><p className="text-sm font-bold">{r.userName}</p><p className="text-xs text-muted">{fmtDate(r.date, lang)}</p></div>
                    </div>
                    <Rating value={r.rating} showNumber={false} size="size-3.5" />
                  </div>
                  <p className="mt-3 text-sm text-muted">{r.comment}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Thẻ đặt xe */}
        <aside className="self-start lg:sticky lg:top-24">
          <div className="rounded-[28px] border border-line bg-surface p-6 shadow-soft">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-extrabold">{money(car.pricePerDay)}</p>
                <p className="text-sm text-muted">/ {t('ngày', 'day')}{car.driverOnly && ` · ${t('đã gồm tài xế', 'driver included')}`}</p>
              </div>
              <Rating value={rating.avg} showNumber size="size-3.5" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <label><span className="mb-1 block text-xs font-semibold text-muted">{t('Ngày nhận', 'Pickup')}</span>
                <input type="date" min={todayISO()} value={from} onChange={(e) => { setFrom(e.target.value); if (to <= e.target.value) setTo(addDays(e.target.value, 1)) }} className={inputCls} /></label>
              <label><span className="mb-1 block text-xs font-semibold text-muted">{t('Ngày trả', 'Return')}</span>
                <input type="date" min={addDays(from, 1)} value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} /></label>
            </div>

            {!car.driverOnly && (
              <div className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-surface2 p-1">
                {[[false, t('Tự lái', 'Self-drive')], [true, t('Có tài xế', 'Chauffeur')]].map(([v, label]) => (
                  <button key={String(v)} onClick={() => setWithDriver(v)} className={cx('cursor-pointer rounded-full py-2 text-sm font-semibold transition', withDriver === v ? 'bg-bg shadow' : 'text-muted')}>{label}</button>
                ))}
              </div>
            )}

            <div className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
              <Row label={`${money(car.pricePerDay)} × ${q.days} ${t('ngày', 'days')}`} value={money(q.base)} />
              {q.driverFee > 0 && <Row label={`${t('Tài xế', 'Driver')} ${money(car.driverFee)} × ${q.days}`} value={money(q.driverFee)} />}
              <Row label={t('Tổng tạm tính', 'Estimated total')} value={money(q.total)} bold />
              {!driver && <Row label={t('Tiền cọc (hoàn lại)', 'Deposit (refundable)')} value={money(q.deposit)} muted />}
            </div>

            {st.state === 'booked' && <p className="mt-4 rounded-xl bg-amber-500/15 p-3 text-xs font-medium text-amber-700 dark:text-amber-400">{t('Xe đã có người đặt trong khoảng ngày này. Hãy chọn ngày khác.', 'Already booked for these dates. Please pick other dates.')}</p>}
            {st.state === 'maintenance' && <p className="mt-4 rounded-xl bg-amber-500/15 p-3 text-xs font-medium text-amber-700 dark:text-amber-400">{t('Xe đang bảo dưỡng, tạm thời chưa nhận đặt.', 'Under maintenance, not bookable right now.')}</p>}

            <Button onClick={book} size="lg" className="mt-5 w-full" disabled={st.state !== 'available'}>{t('Đặt xe ngay', 'Book now')}</Button>
            <p className="mt-3 text-center text-xs text-muted">{t('Chưa bị trừ tiền. Hủy miễn phí trước 24 giờ.', 'You will not be charged yet. Free cancellation within 24h.')}</p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-extrabold">{t('Xe cùng loại', 'Similar cars')}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((c) => <CarCard key={c.id} car={c} />)}</div>
        </section>
      )}
    </div>
  )
}

function Row({ label, value, bold, muted }) {
  return (
    <div className={cx('flex items-center justify-between gap-3', bold && 'text-base font-extrabold', muted && 'text-muted')}>
      <span className={bold ? '' : 'text-muted'}>{label}</span><span>{value}</span>
    </div>
  )
}
