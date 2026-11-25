import { Link, useParams } from 'react-router-dom'
import { CalendarCheck, CheckCircle2, Printer } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Empty } from '@/components/ui/misc'
import CarImage from '@/components/CarImage'
import { useDocTitle } from '@/components/Guards'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/context/I18nContext'
import { useStore } from '@/context/StoreContext'
import { EXTRAS, PAYMENTS } from '@/data/constants'
import { fmtDate, money } from '@/lib/format'

export default function BookingSuccess() {
  const { code } = useParams()
  const { t, l, lang } = useI18n()
  const { user } = useAuth()
  const { bookings, getCar } = useStore()
  useDocTitle(t('Đặt xe thành công', 'Booking confirmed'))
  const b = bookings.find((x) => x.code === code && (x.userId === user?.id || user?.role === 'admin'))
  if (!b) return <div className="container-x py-20"><Empty title={t('Không tìm thấy đơn thuê', 'Booking not found')} action={<Button as={Link} to="/account/bookings">{t('Đơn thuê của tôi', 'My bookings')}</Button>} /></div>
  const car = getCar(b.carId)

  const row = (label, value) => (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm"><span className="text-muted">{label}</span><span className="text-right font-semibold">{value}</span></div>
  )

  return (
    <div className="container-x py-12">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-500/15 text-emerald-500"><CheckCircle2 className="size-11" /></span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight">{t('Đặt xe thành công!', 'Booking received!')}</h1>
          <p className="mt-2 text-muted">{t('Chúng tôi sẽ gọi xác nhận trong vòng 15 phút. Mã đơn của bạn:', 'We will call to confirm within 15 minutes. Your booking code:')}</p>
          <p className="mt-3 inline-block rounded-full bg-primary-soft px-6 py-2 text-2xl font-extrabold tracking-widest text-primary">{b.code}</p>
        </div>

        <div className="mt-8 rounded-[28px] border border-line bg-surface p-6 shadow-soft">
          {car && (
            <div className="flex items-center gap-4 border-b border-line pb-5">
              <div className="w-32 rounded-2xl bg-surface2 p-2"><CarImage src={car.image} type={car.type} color={car.color} className="w-full" /></div>
              <div><p className="text-xs text-muted">{car.brand}</p><h2 className="text-lg font-extrabold">{car.model} {car.year}</h2><p className="text-sm text-muted">{car.seats} {t('chỗ', 'seats')}</p></div>
            </div>
          )}
          <div className="divide-y divide-line">
            {row(t('Thời gian thuê', 'Rental period'), `${fmtDate(b.from, lang)} → ${fmtDate(b.to, lang)} (${b.days} ${t('ngày', 'days')})`)}
            {row(t('Địa điểm nhận xe', 'Pickup'), b.pickup)}
            {row(t('Hình thức', 'Type'), b.withDriver ? t('Có tài xế', 'With driver') : t('Tự lái', 'Self-drive'))}
            {b.extras.length > 0 && row(t('Dịch vụ thêm', 'Extras'), b.extras.map((id) => l(EXTRAS.find((e) => e.id === id))).join(', '))}
            {row(t('Người đặt', 'Customer'), `${b.contact.name} · ${b.contact.phone}`)}
            {row(t('Thanh toán', 'Payment'), `${l(PAYMENTS.find((p) => p.id === b.payment))} · ${b.paymentStatus === 'paid' ? t('Đã thanh toán', 'Paid') : t('Chưa thanh toán', 'Unpaid')}`)}
            {b.discount > 0 && row(t('Giảm giá', 'Discount'), '-' + money(b.discount))}
            {row(t('Tổng cộng', 'Total'), <span className="text-lg font-extrabold text-primary">{money(b.total)}</span>)}
            {b.deposit > 0 && row(t('Tiền cọc khi nhận xe', 'Deposit at pickup'), money(b.deposit))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button as={Link} to="/account/bookings"><CalendarCheck className="size-4" />{t('Xem đơn thuê của tôi', 'View my bookings')}</Button>
          <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" />{t('In phiếu', 'Print')}</Button>
          <Button as={Link} to="/cars" variant="ghost">{t('Tiếp tục xem xe', 'Keep browsing')}</Button>
        </div>
      </div>
    </div>
  )
}
