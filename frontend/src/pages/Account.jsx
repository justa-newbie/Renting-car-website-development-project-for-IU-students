import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { CalendarCheck, Heart, KeyRound, MapPin, Phone, User } from 'lucide-react'
import CarCard from '@/components/CarCard'
import CarImage from '@/components/CarImage'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Input } from '@/components/ui/Field'
import { Confirm, Empty } from '@/components/ui/misc'
import { BookingBadge, PaymentBadge } from '@/components/StatusBadges'
import { useDocTitle } from '@/components/Guards'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/context/I18nContext'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { BOOKING_STATUS, EXTRAS, PAYMENTS } from '@/data/constants'
import { addDays, cx, fmtDate, initials, money, todayISO } from '@/lib/format'

export function AccountLayout() {
  const { t } = useI18n()
  const { user } = useAuth()
  const tabs = [
    { to: '/account', end: true, icon: User, label: t('Hồ sơ', 'Profile') },
    { to: '/account/bookings', icon: CalendarCheck, label: t('Đơn thuê', 'Bookings') },
    { to: '/account/favorites', icon: Heart, label: t('Yêu thích', 'Favorites') },
  ]
  return (
    <div className="container-x py-8">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="self-start rounded-3xl border border-line bg-surface p-5 lg:sticky lg:top-24">
          <div className="flex items-center gap-3 border-b border-line pb-5">
            <span className="grid size-14 place-items-center rounded-full bg-primary text-lg font-extrabold text-onprimary">{initials(user.name)}</span>
            <div className="min-w-0"><p className="truncate font-extrabold">{user.name}</p><p className="truncate text-xs text-muted">{user.email}</p></div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto lg:flex-col">
            {tabs.map((x) => (
              <NavLink key={x.to} to={x.to} end={x.end} className={({ isActive }) => cx('flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition', isActive ? 'bg-fg text-bg' : 'text-muted hover:bg-surface2 hover:text-fg')}>
                <x.icon className="size-[18px]" />{x.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="min-w-0"><Outlet /></div>
      </div>
    </div>
  )
}

export function Profile() {
  const { t } = useI18n()
  const { user, updateProfile } = useAuth()
  const toast = useToast()
  const [f, setF] = useState({ name: user.name, phone: user.phone, license: user.license || '' })
  const [pw, setPw] = useState({ old: '', next: '', confirm: '' })
  const [err, setErr] = useState({})
  const [pwErr, setPwErr] = useState({})
  useDocTitle(t('Hồ sơ của tôi', 'My profile'))

  const save = (e) => {
    e.preventDefault()
    const x = {}
    if (f.name.trim().length < 2) x.name = t('Nhập họ tên', 'Enter your name')
    if (!/^(0|\+84)\d{9,10}$/.test(f.phone.replace(/\s/g, ''))) x.phone = t('Số điện thoại chưa hợp lệ', 'Invalid phone number')
    if (f.license && !/^\d{9,12}$/.test(f.license.replace(/\s/g, ''))) x.license = t('GPLX gồm 9-12 số', 'Licence has 9-12 digits')
    setErr(x)
    if (Object.keys(x).length) return
    updateProfile(f)
    toast(t('Đã cập nhật hồ sơ', 'Profile updated'))
  }

  const changePw = (e) => {
    e.preventDefault()
    const x = {}
    if (pw.old !== user.password) x.old = t('Mật khẩu hiện tại không đúng', 'Current password is wrong')
    if (pw.next.length < 6) x.next = t('Ít nhất 6 ký tự', 'At least 6 characters')
    if (pw.confirm !== pw.next) x.confirm = t('Không khớp', 'Does not match')
    setPwErr(x)
    if (Object.keys(x).length) return
    updateProfile({ password: pw.next })
    setPw({ old: '', next: '', confirm: '' })
    toast(t('Đã đổi mật khẩu', 'Password changed'))
  }

  const card = 'rounded-3xl border border-line bg-surface p-6'
  return (
    <div className="space-y-6">
      <form onSubmit={save} noValidate className={card}>
        <h2 className="mb-5 text-xl font-extrabold">{t('Thông tin cá nhân', 'Personal information')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('Họ và tên', 'Full name')} icon={User} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={err.name} />
          <Input label="Email" value={user.email} disabled hint={t('Email không thể thay đổi', 'Email cannot be changed')} />
          <Input label={t('Số điện thoại', 'Phone')} icon={Phone} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} error={err.phone} />
          <Input label={t('Số GPLX (để thuê xe tự lái)', 'Driving licence no. (for self-drive)')} icon={MapPin} value={f.license} onChange={(e) => setF({ ...f, license: e.target.value })} error={err.license} />
        </div>
        <Button type="submit" className="mt-5">{t('Lưu thay đổi', 'Save changes')}</Button>
      </form>

      <form onSubmit={changePw} noValidate className={card}>
        <h2 className="mb-5 text-xl font-extrabold">{t('Đổi mật khẩu', 'Change password')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label={t('Mật khẩu hiện tại', 'Current password')} type="password" icon={KeyRound} value={pw.old} onChange={(e) => setPw({ ...pw, old: e.target.value })} error={pwErr.old} autoComplete="current-password" />
          <Input label={t('Mật khẩu mới', 'New password')} type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} error={pwErr.next} autoComplete="new-password" />
          <Input label={t('Nhập lại', 'Confirm')} type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} error={pwErr.confirm} autoComplete="new-password" />
        </div>
        <Button type="submit" variant="dark" className="mt-5">{t('Đổi mật khẩu', 'Update password')}</Button>
      </form>
    </div>
  )
}

export function MyBookings() {
  const { t, l, lang } = useI18n()
  const { user } = useAuth()
  const toast = useToast()
  const { bookings, getCar, updateBooking } = useStore()
  const [tab, setTab] = useState('all')
  const [detail, setDetail] = useState(null)
  const [cancel, setCancel] = useState(null)
  useDocTitle(t('Đơn thuê của tôi', 'My bookings'))

  const mine = bookings.filter((b) => b.userId === user.id)
  const list = mine.filter((b) => tab === 'all' || b.status === tab)
  const tabs = ['all', ...Object.keys(BOOKING_STATUS)]
  const count = (k) => (k === 'all' ? mine.length : mine.filter((b) => b.status === k).length)

  const doCancel = (b) => {
    // Hủy muộn (< 24h trước ngày nhận) tính phí 20%
    const late = b.from <= addDays(todayISO(), 1)
    updateBooking(b.id, { status: 'cancelled', paymentStatus: b.paymentStatus === 'paid' ? 'refunded' : b.paymentStatus })
    toast(late ? t('Đã hủy đơn. Phí hủy 20% sẽ được trừ khi hoàn tiền.', 'Cancelled. A 20% fee applies to the refund.') : t('Đã hủy đơn miễn phí', 'Cancelled free of charge'), 'info')
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold">{t('Đơn thuê của tôi', 'My bookings')}</h1>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {tabs.map((k) => (
          <button key={k} onClick={() => setTab(k)} className={cx('shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition', tab === k ? 'bg-fg text-bg' : 'bg-surface2 text-muted hover:text-fg')}>
            {k === 'all' ? t('Tất cả', 'All') : l(BOOKING_STATUS[k])} <span className="opacity-60">{count(k)}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {list.length === 0 && <Empty icon={CalendarCheck} title={t('Chưa có đơn thuê nào', 'No bookings yet')} text={t('Hãy chọn một chiếc xe và đặt chuyến đầu tiên của bạn.', 'Pick a car and book your first trip.')} action={<Button as={Link} to="/cars">{t('Tìm xe', 'Find a car')}</Button>} />}
        {list.map((b) => {
          const car = getCar(b.carId)
          return (
            <div key={b.id} className="rounded-3xl border border-line bg-surface p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-32 shrink-0 rounded-2xl bg-surface2 p-2">{car && <CarImage src={car.image} type={car.type} color={car.color} className="w-full" />}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-extrabold text-primary">{b.code}</span><BookingBadge value={b.status} /><PaymentBadge value={b.paymentStatus} /></div>
                  <h3 className="mt-1 truncate text-lg font-extrabold">{car ? `${car.brand} ${car.model}` : t('Xe đã bị xóa', 'Deleted car')}</h3>
                  <p className="text-sm text-muted">{fmtDate(b.from, lang)} → {fmtDate(b.to, lang)} · {b.days} {t('ngày', 'days')} · {b.withDriver ? t('Có tài xế', 'Chauffeur') : t('Tự lái', 'Self-drive')}</p>
                </div>
                <div className="text-right"><p className="text-xs text-muted">{t('Tổng cộng', 'Total')}</p><p className="text-xl font-extrabold">{money(b.total)}</p></div>
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-line pt-4">
                <Button size="sm" variant="outline" onClick={() => setDetail(b)}>{t('Chi tiết', 'Details')}</Button>
                {b.status === 'completed' && car && <Button as={Link} to={`/cars/${car.id}`} size="sm" variant="soft">{t('Đánh giá xe', 'Rate this car')}</Button>}
                {car && ['completed', 'cancelled'].includes(b.status) && <Button as={Link} to={`/cars/${car.id}`} size="sm">{t('Thuê lại', 'Rent again')}</Button>}
                {['pending', 'confirmed'].includes(b.status) && <Button size="sm" variant="danger" onClick={() => setCancel(b)}>{t('Hủy đơn', 'Cancel')}</Button>}
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? `${t('Đơn', 'Booking')} ${detail.code}` : ''}>
        {detail && (
          <div className="divide-y divide-line text-sm">
            {[
              [t('Xe', 'Car'), (() => { const c = getCar(detail.carId); return c ? `${c.brand} ${c.model} ${c.year}` : '—' })()],
              [t('Thời gian', 'Period'), `${fmtDate(detail.from, lang)} → ${fmtDate(detail.to, lang)} (${detail.days} ${t('ngày', 'days')})`],
              [t('Nhận xe tại', 'Pickup'), detail.pickup],
              [t('Hình thức', 'Type'), detail.withDriver ? t('Có tài xế', 'Chauffeur') : t('Tự lái', 'Self-drive')],
              [t('Dịch vụ thêm', 'Extras'), detail.extras.length ? detail.extras.map((id) => l(EXTRAS.find((e) => e.id === id))).join(', ') : '—'],
              [t('Liên hệ', 'Contact'), `${detail.contact.name} · ${detail.contact.phone}`],
              [t('Thanh toán', 'Payment'), l(PAYMENTS.find((p) => p.id === detail.payment))],
              [t('Tiền thuê', 'Rental'), money(detail.base)],
              ...(detail.driverFee ? [[t('Tài xế', 'Driver'), money(detail.driverFee)]] : []),
              ...(detail.extrasFee ? [[t('Dịch vụ thêm', 'Extras'), money(detail.extrasFee)]] : []),
              ...(detail.discount ? [[`${t('Giảm giá', 'Discount')} ${detail.couponCode}`, '-' + money(detail.discount)]] : []),
              [t('Tổng cộng', 'Total'), <b key="t" className="text-base text-primary">{money(detail.total)}</b>],
              ...(detail.deposit ? [[t('Tiền cọc', 'Deposit'), money(detail.deposit)]] : []),
            ].map(([a, b], i) => <div key={i} className="flex justify-between gap-4 py-2.5"><span className="text-muted">{a}</span><span className="text-right font-semibold">{b}</span></div>)}
          </div>
        )}
      </Modal>

      <Confirm open={!!cancel} onClose={() => setCancel(null)} onConfirm={() => doCancel(cancel)} title={t('Hủy đơn thuê?', 'Cancel this booking?')}
        text={t('Hủy trước giờ nhận xe 24 giờ được miễn phí, sau đó tính phí 20%. Bạn chắc chắn muốn hủy?', 'Free up to 24h before pickup, 20% fee afterwards. Are you sure?')}
        confirmLabel={t('Hủy đơn', 'Cancel booking')} cancelLabel={t('Giữ lại', 'Keep it')} />
    </div>
  )
}

export function Favorites() {
  const { t } = useI18n()
  const { favorites, getCar } = useStore()
  useDocTitle(t('Xe yêu thích', 'Favorites'))
  const list = favorites.map(getCar).filter(Boolean)
  return (
    <div>
      <h1 className="text-2xl font-extrabold">{t('Xe yêu thích', 'Favorite cars')} ({list.length})</h1>
      {list.length === 0 ? (
        <div className="mt-5"><Empty icon={Heart} title={t('Chưa có xe yêu thích', 'No favorites yet')} text={t('Bấm biểu tượng trái tim trên thẻ xe để lưu lại.', 'Tap the heart on a car card to save it.')} action={<Button as={Link} to="/cars">{t('Khám phá xe', 'Explore cars')}</Button>} /></div>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{list.map((c) => <CarCard key={c.id} car={c} />)}</div>
      )}
    </div>
  )
}
