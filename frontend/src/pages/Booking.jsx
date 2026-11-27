import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Baby, Banknote, CheckCircle2, CreditCard, Loader2, Shield, Smartphone, Tag, Wifi, Wrench, QrCode, X } from 'lucide-react'
import CarImage from '@/components/CarImage'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Checkbox, Input, inputCls, Textarea } from '@/components/ui/Field'
import { Empty } from '@/components/ui/misc'
import { useDocTitle } from '@/components/Guards'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/context/I18nContext'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { CITIES, EXTRAS, licenseFor, PAYMENTS } from '@/data/constants'
import { addDays, cx, fmtDate, money, todayISO } from '@/lib/format'
import { checkCoupon, computeQuote } from '@/lib/pricing'

const extraIcon = { shield: Shield, wrench: Wrench, baby: Baby, wifi: Wifi }
const payIcon = { cash: Banknote, bank: QrCode, vnpay: CreditCard, momo: Smartphone, card: CreditCard }

export default function Booking() {
  const { id } = useParams()
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const { t, l, lang } = useI18n()
  const toast = useToast()
  const { user } = useAuth()
  const { getCar, carState, coupons, createBooking } = useStore()
  const car = getCar(id)
  useDocTitle(t('Đặt xe', 'Book a car'))

  const [from, setFrom] = useState(sp.get('from') || todayISO())
  const [to, setTo] = useState(sp.get('to') || addDays(todayISO(), 2))
  const [withDriver, setWithDriver] = useState(sp.get('driver') === '1')
  const [pickup, setPickup] = useState(car?.city || CITIES[0])
  const [address, setAddress] = useState('')
  const [extras, setExtras] = useState([])
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '', license: user?.license || '', note: '' })
  const [code, setCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [payment, setPayment] = useState('cash')
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState({})
  const [paying, setPaying] = useState(false)
  const [payStep, setPayStep] = useState('wait') // wait | done

  const driver = !!car && (car.driverOnly || withDriver)
  const quote = car ? computeQuote({ car, from, to, withDriver, extras, coupon }) : null

  // Mã giảm giá có thể hết hiệu lực khi đổi ngày/dịch vụ (tổng nhỏ hơn mức tối thiểu)
  useEffect(() => {
    if (coupon && !checkCoupon(coupon, quote.subtotal).ok) {
      setCoupon(null)
      toast(t('Mã giảm giá không còn đủ điều kiện áp dụng', 'Promo code no longer applies'), 'error')
    }
  }, [quote?.subtotal]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!car) return <div className="container-x py-20"><Empty title={t('Không tìm thấy xe', 'Car not found')} action={<Button as={Link} to="/cars">{t('Về danh sách xe', 'Back to cars')}</Button>} /></div>

  const state = carState(car, from, to).state
  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }))

  const applyCoupon = () => {
    const c = coupons.find((x) => x.code.toLowerCase() === code.trim().toLowerCase())
    const res = checkCoupon(c, quote.subtotal)
    if (!res.ok) {
      const msg = {
        invalid: t('Mã không tồn tại', 'Code not found'),
        inactive: t('Mã đã ngừng áp dụng', 'Code is inactive'),
        expired: t('Mã đã hết hạn', 'Code expired'),
        limit: t('Mã đã hết lượt sử dụng', 'Code usage limit reached'),
        min: t(`Đơn tối thiểu ${money(c?.minTotal || 0)} để dùng mã này`, `Minimum order ${money(c?.minTotal || 0)} for this code`),
      }[res.reason]
      return toast(msg, 'error')
    }
    setCoupon(c)
    toast(t('Áp dụng mã thành công', 'Promo code applied'))
  }

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 2) e.name = t('Nhập họ tên', 'Enter your name')
    if (!/^(0|\+84)\d{9,10}$/.test(form.phone.replace(/\s/g, ''))) e.phone = t('Số điện thoại chưa hợp lệ', 'Invalid phone number')
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = t('Email chưa hợp lệ', 'Invalid email')
    if (!driver && !/^\d{9,12}$/.test(form.license.replace(/\s/g, ''))) e.license = t('Nhập số GPLX (9-12 số)', 'Enter licence number (9-12 digits)')
    if (to <= from) e.date = t('Ngày trả phải sau ngày nhận', 'Return date must be after pickup')
    if (state !== 'available') e.date = t('Xe không còn trống trong khoảng ngày này', 'Car not available for these dates')
    if (!agree) e.agree = t('Bạn cần đồng ý điều khoản', 'You must accept the terms')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const finish = (paid) => {
    const b = createBooking({
      carId: car.id, userId: user.id, from, to, withDriver: driver, driverId: null, extras,
      couponCode: coupon?.code || '', pickup: address ? `${address}, ${pickup}` : pickup,
      contact: { name: form.name, phone: form.phone, email: form.email, license: form.license },
      payment, paymentStatus: paid ? 'paid' : 'unpaid', note: form.note, ...quote,
    })
    nav(`/booking/success/${b.code}`, { replace: true })
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) {
      toast(t('Vui lòng kiểm tra lại thông tin', 'Please check your details'), 'error')
      return
    }
    if (PAYMENTS.find((p) => p.id === payment)?.online) {
      setPayStep('wait')
      setPaying(true)
    } else finish(false)
  }

  const confirmPay = () => {
    setPayStep('done')
    setTimeout(() => { setPaying(false); finish(true) }, 1200)
  }

  const section = 'rounded-3xl border border-line bg-surface p-5 sm:p-6'
  const h = 'mb-4 flex items-center gap-2.5 text-lg font-extrabold'
  const num = (n) => <span className="grid size-7 place-items-center rounded-full bg-primary text-sm text-onprimary">{n}</span>

  return (
    <div className="container-x py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">{t('Đặt xe', 'Book your car')}</h1>
      <p className="mt-1 text-muted">{t('Hoàn tất 4 bước: chuyến đi, dịch vụ, thông tin, thanh toán.', 'Complete 4 steps: trip, extras, details, payment.')}</p>

      <form onSubmit={submit} className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_400px]" noValidate>
        <div className="space-y-5">
          <section className={section}>
            <h2 className={h}>{num(1)}{t('Chuyến đi', 'Your trip')}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input type="date" label={t('Ngày nhận xe', 'Pickup date')} min={todayISO()} value={from} onChange={(e) => { setFrom(e.target.value); if (to <= e.target.value) setTo(addDays(e.target.value, 1)) }} />
              <Input type="date" label={t('Ngày trả xe', 'Return date')} min={addDays(from, 1)} value={to} onChange={(e) => setTo(e.target.value)} error={errors.date} />
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold">{t('Thành phố nhận xe', 'Pickup city')}</span>
                <select value={pickup} onChange={(e) => setPickup(e.target.value)} className={inputCls}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select>
              </label>
              <Input label={t('Địa chỉ giao/nhận (tùy chọn)', 'Delivery address (optional)')} placeholder={t('VD: 12 Nguyễn Huệ, Quận 1', 'e.g. 12 Nguyen Hue, District 1')} value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            {!car.driverOnly && (
              <div className="mt-5 grid grid-cols-2 gap-2">
                {[[false, t('Tự lái', 'Self-drive'), t('Bạn tự cầm lái, cần GPLX', 'You drive, licence required')], [true, t('Có tài xế', 'With driver'), t(`+${money(car.driverFee)} / ngày`, `+${money(car.driverFee)} / day`)]].map(([v, title, sub]) => (
                  <button type="button" key={String(v)} onClick={() => setWithDriver(v)} className={cx('cursor-pointer rounded-2xl border-2 p-4 text-left transition', withDriver === v ? 'border-primary bg-primary-soft' : 'border-line hover:border-muted')}>
                    <p className="font-bold">{title}</p><p className="text-xs text-muted">{sub}</p>
                  </button>
                ))}
              </div>
            )}
            {car.driverOnly && <p className="mt-4 rounded-2xl bg-surface2 p-3.5 text-sm text-muted">{t('Xe này được thuê kèm tài xế chuyên nghiệp, đã gồm trong giá.', 'This vehicle is rented with a professional driver, included in the price.')}</p>}
          </section>

          <section className={section}>
            <h2 className={h}>{num(2)}{t('Dịch vụ thêm', 'Extras')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {EXTRAS.map((x) => {
                const I = extraIcon[x.icon]
                const on = extras.includes(x.id)
                return (
                  <button type="button" key={x.id} onClick={() => setExtras((s) => (on ? s.filter((i) => i !== x.id) : [...s, x.id]))} className={cx('flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition', on ? 'border-primary bg-primary-soft' : 'border-line hover:border-muted')}>
                    <span className="grid size-10 place-items-center rounded-xl bg-surface2"><I className="size-5 text-primary" /></span>
                    <span className="flex-1"><span className="block text-sm font-bold">{l(x)}</span><span className="text-xs text-muted">+{money(x.price)} / {t('ngày', 'day')}</span></span>
                    {on && <CheckCircle2 className="size-5 text-primary" />}
                  </button>
                )
              })}
            </div>
          </section>

          <section className={section}>
            <h2 className={h}>{num(3)}{t('Thông tin liên hệ', 'Contact details')}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label={t('Họ và tên', 'Full name')} value={form.name} onChange={set('name')} error={errors.name} />
              <Input label={t('Số điện thoại', 'Phone')} value={form.phone} onChange={set('phone')} error={errors.phone} inputMode="tel" />
              <Input label="Email" value={form.email} onChange={set('email')} error={errors.email} type="email" />
              {!driver && <Input label={`${t('Số GPLX', 'Licence no.')} (${t('hạng', 'class')} ${licenseFor(car.seats)})`} value={form.license} onChange={set('license')} error={errors.license} inputMode="numeric" />}
            </div>
            <Textarea wrapClass="mt-4" label={t('Ghi chú cho chủ xe', 'Notes for the owner')} placeholder={t('Giờ nhận xe mong muốn, lịch trình, yêu cầu thêm...', 'Preferred pickup time, itinerary, special requests...')} value={form.note} onChange={set('note')} />
          </section>

          <section className={section}>
            <h2 className={h}>{num(4)}{t('Thanh toán', 'Payment')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {PAYMENTS.map((p) => {
                const I = payIcon[p.id]
                return (
                  <button type="button" key={p.id} onClick={() => setPayment(p.id)} className={cx('flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition', payment === p.id ? 'border-primary bg-primary-soft' : 'border-line hover:border-muted')}>
                    <span className="grid size-10 place-items-center rounded-xl bg-surface2"><I className="size-5 text-primary" /></span>
                    <span className="flex-1 text-sm font-bold">{l(p)}</span>
                    <span className={cx('grid size-5 place-items-center rounded-full border-2', payment === p.id ? 'border-primary bg-primary' : 'border-line')}>{payment === p.id && <span className="size-2 rounded-full bg-white" />}</span>
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-xs text-muted">{t('Đây là bản demo: cổng thanh toán được mô phỏng, không phát sinh giao dịch thật.', 'Demo only: payment gateways are simulated, no real charge is made.')}</p>
          </section>

          <div>
            <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} label={<>{t('Tôi đã đọc và đồng ý với', 'I agree to the')} <Link to="/faq" className="font-semibold text-primary underline">{t('điều khoản thuê xe', 'rental terms')}</Link></>} />
            {errors.agree && <p className="mt-1 text-xs font-medium text-red-500">{errors.agree}</p>}
          </div>
        </div>

        {/* Tóm tắt */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-[28px] border border-line bg-surface p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-28 shrink-0 rounded-2xl bg-surface2 p-2"><CarImage src={car.image} type={car.type} color={car.color} className="w-full" /></div>
              <div className="min-w-0"><p className="text-xs text-muted">{car.brand}</p><h3 className="truncate font-extrabold">{car.model} {car.year}</h3><p className="text-xs text-muted">{car.seats} {t('chỗ', 'seats')} · {car.city}</p></div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-surface2 p-3 text-sm">
              <div><p className="text-xs text-muted">{t('Nhận', 'Pickup')}</p><p className="font-bold">{fmtDate(from, lang)}</p></div>
              <div><p className="text-xs text-muted">{t('Trả', 'Return')}</p><p className="font-bold">{fmtDate(to, lang)}</p></div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-bold">{t('Mã giảm giá', 'Promo code')}</p>
              {coupon ? (
                <div className="flex items-center justify-between rounded-xl border border-dashed border-emerald-500 bg-emerald-500/10 px-3.5 py-2.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-2"><Tag className="size-4" />{coupon.code}</span>
                  <button type="button" onClick={() => { setCoupon(null); setCode('') }} aria-label="remove" className="cursor-pointer"><X className="size-4" /></button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SINHVIEN15" className={cx(inputCls, 'uppercase')} />
                  <Button type="button" variant="dark" onClick={applyCoupon} disabled={!code.trim()}>{t('Áp dụng', 'Apply')}</Button>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
              <Line label={`${money(car.pricePerDay)} × ${quote.days} ${t('ngày', 'days')}`} value={money(quote.base)} />
              {quote.driverFee > 0 && <Line label={t('Tài xế', 'Driver')} value={money(quote.driverFee)} />}
              {quote.extrasFee > 0 && <Line label={t('Dịch vụ thêm', 'Extras')} value={money(quote.extrasFee)} />}
              {quote.discount > 0 && <Line label={t('Giảm giá', 'Discount')} value={'-' + money(quote.discount)} green />}
              <div className="flex items-center justify-between border-t border-line pt-3 text-lg font-extrabold"><span>{t('Tổng cộng', 'Total')}</span><span className="text-primary">{money(quote.total)}</span></div>
              {quote.deposit > 0 && <Line label={t('Tiền cọc nhận xe (hoàn lại)', 'Deposit at pickup (refundable)')} value={money(quote.deposit)} muted />}
            </div>

            <Button type="submit" size="lg" className="mt-6 w-full" disabled={state !== 'available'}>
              {PAYMENTS.find((p) => p.id === payment)?.online ? t('Thanh toán', 'Pay') : t('Xác nhận đặt xe', 'Confirm booking')} · {money(quote.total)}
            </Button>
            {state !== 'available' && <p className="mt-3 text-center text-xs font-medium text-red-500">{t('Xe không còn trống trong khoảng ngày này', 'Car not available for these dates')}</p>}
          </div>
        </aside>
      </form>

      <Modal open={paying} onClose={() => payStep === 'wait' && setPaying(false)} title={t('Cổng thanh toán (giả lập)', 'Payment gateway (simulated)')} size="sm"
        footer={payStep === 'wait' && <><Button variant="secondary" onClick={() => setPaying(false)}>{t('Hủy', 'Cancel')}</Button><Button onClick={confirmPay}>{t('Tôi đã thanh toán', 'I have paid')}</Button></>}>
        {payStep === 'wait' ? (
          <div className="text-center">
            {payment === 'bank' || payment === 'momo' || payment === 'vnpay' ? (
              <div className="mx-auto grid size-44 place-items-center rounded-2xl border border-line bg-white"><QrCode className="size-32 text-zinc-900" /></div>
            ) : (
              <div className="mx-auto max-w-xs space-y-3 text-left"><Input label={t('Số thẻ', 'Card number')} defaultValue="4111 1111 1111 1111" readOnly /><div className="grid grid-cols-2 gap-3"><Input label="MM/YY" defaultValue="12/30" readOnly /><Input label="CVV" defaultValue="123" readOnly /></div></div>
            )}
            <p className="mt-4 text-sm text-muted">{t('Số tiền cần thanh toán', 'Amount due')}</p>
            <p className="text-2xl font-extrabold text-primary">{money(quote.total)}</p>
          </div>
        ) : (
          <div className="grid place-items-center py-8 text-center"><Loader2 className="size-10 animate-spin text-primary" /><p className="mt-4 font-semibold">{t('Đang xử lý thanh toán...', 'Processing payment...')}</p></div>
        )}
      </Modal>
    </div>
  )
}

function Line({ label, value, green, muted }) {
  return (
    <div className={cx('flex items-center justify-between gap-3', muted && 'text-muted', green && 'font-semibold text-emerald-500')}>
      <span className={green || muted ? '' : 'text-muted'}>{label}</span><span className="font-semibold">{value}</span>
    </div>
  )
}
