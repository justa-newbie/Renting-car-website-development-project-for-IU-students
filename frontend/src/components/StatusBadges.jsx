import Badge from './ui/Badge'
import { useI18n } from '@/context/I18nContext'
import { BOOKING_STATUS, CAR_STATUS, DRIVER_STATUS, PAYMENT_STATUS } from '@/data/constants'

const make = (map) =>
  function StatusBadge({ value }) {
    const { l } = useI18n()
    const s = map[value]
    return s ? <Badge tone={s.tone}>{l(s)}</Badge> : null
  }

export const BookingBadge = make(BOOKING_STATUS)
export const PaymentBadge = make(PAYMENT_STATUS)
export const DriverBadge = make(DRIVER_STATUS)
export const CarStatusBadge = make(CAR_STATUS)
