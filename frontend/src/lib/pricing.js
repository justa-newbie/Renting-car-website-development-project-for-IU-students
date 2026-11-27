import { EXTRAS } from '@/data/constants'
import { daysBetween, todayISO } from './format'

// Kiểm tra mã giảm giá. Trả về { ok, reason } (reason: 'invalid' | 'expired' | 'min' | 'limit' | 'inactive')
export function checkCoupon(coupon, subtotal) {
  if (!coupon) return { ok: false, reason: 'invalid' }
  if (!coupon.active) return { ok: false, reason: 'inactive' }
  if (coupon.expiresAt && coupon.expiresAt < todayISO()) return { ok: false, reason: 'expired' }
  if (coupon.usageLimit && coupon.used >= coupon.usageLimit) return { ok: false, reason: 'limit' }
  if (coupon.minTotal && subtotal < coupon.minTotal) return { ok: false, reason: 'min' }
  return { ok: true }
}

// Tính tiền thuê xe
export function computeQuote({ car, from, to, withDriver = false, extras = [], coupon = null }) {
  const days = daysBetween(from, to)
  const base = car.pricePerDay * days
  const driverFee = withDriver && !car.driverOnly ? car.driverFee * days : 0
  const extrasFee = extras.reduce((s, id) => s + (EXTRAS.find((e) => e.id === id)?.price || 0) * days, 0)
  const subtotal = base + driverFee + extrasFee

  let discount = 0
  if (coupon && checkCoupon(coupon, subtotal).ok) {
    discount = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
    discount = Math.min(discount, subtotal)
  }
  const total = subtotal - discount
  const isDriver = car.driverOnly || withDriver
  return { days, base, driverFee, extrasFee, subtotal, discount, total, deposit: isDriver ? 0 : car.deposit }
}
