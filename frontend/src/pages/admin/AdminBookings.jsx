import { useMemo, useState } from 'react'
import { Ban, Check, Eye, Flag, Play } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Select } from '@/components/ui/Field'
import { Confirm, Empty, Pagination } from '@/components/ui/misc'
import { BookingBadge, PaymentBadge } from '@/components/StatusBadges'
import { IconBtn, PageHead, SearchInput, Table, Td } from '@/components/admin/parts'
import { useDocTitle } from '@/components/Guards'
import { useI18n } from '@/context/I18nContext'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { BOOKING_STATUS, DRIVER_STATUS, EXTRAS, PAYMENTS } from '@/data/constants'
import { cx, fmtDate, money } from '@/lib/format'

export default function AdminBookings() {
  const { t, l, lang } = useI18n()
  const toast = useToast()
  const { bookings, getCar, drivers, updateBooking, saveDriver } = useStore()
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState(null)
  const [cancel, setCancel] = useState(null)
  useDocTitle(t('Đơn thuê', 'Bookings'))

  const sorted = useMemo(() => [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.code.localeCompare(a.code)), [bookings])
  const list = sorted.filter((b) => {
    if (tab !== 'all' && b.status !== tab) return false
    if (q) {
      const car = getCar(b.carId)
      return `${b.code} ${b.contact.name} ${b.contact.phone} ${car?.brand} ${car?.model}`.toLowerCase().includes(q.toLowerCase())
    }
    return true
  })
  const PAGE = 10
  const pages = Math.max(1, Math.ceil(list.length / PAGE))
  const cur = Math.min(page, pages)
  const rows = list.slice((cur - 1) * PAGE, cur * PAGE)
  const count = (k) => (k === 'all' ? bookings.length : bookings.filter((b) => b.status === k).length)

  const confirm = (b) => { updateBooking(b.id, { status: 'confirmed' }); toast(`${b.code}: ${t('đã xác nhận', 'confirmed')}`) }
  const start = (b) => { updateBooking(b.id, { status: 'ongoing' }); toast(`${b.code}: ${t('bắt đầu cho thuê', 'rental started')}`) }
  const complete = (b) => {
    updateBooking(b.id, { status: 'completed', paymentStatus: 'paid' })
    if (b.driverId) { const d = drivers.find((x) => x.id === b.driverId); d && saveDriver({ id: d.id, status: 'available' }) }
    toast(`${b.code}: ${t('đã hoàn thành', 'completed')}`)
  }
  const doCancel = (b) => {
    updateBooking(b.id, { status: 'cancelled', paymentStatus: b.paymentStatus === 'paid' ? 'refunded' : b.paymentStatus })
    toast(`${b.code}: ${t('đã hủy', 'cancelled')}`, 'info')
  }
  const assign = (b, driverId) => {
    updateBooking(b.id, { driverId: driverId || null })
    setDetail((d) => (d ? { ...d, driverId: driverId || null } : d))
    toast(t('Đã phân công tài xế', 'Driver assigned'))
  }

  const actions = (b) => (
    <div className="flex justify-end gap-1">
      <IconBtn icon={Eye} label={t('Chi tiết', 'Details')} onClick={() => setDetail(b)} />
      {b.status === 'pending' && <IconBtn icon={Check} tone="success" label={t('Xác nhận', 'Confirm')} onClick={() => confirm(b)} />}
      {b.status === 'confirmed' && <IconBtn icon={Play} tone="success" label={t('Bắt đầu thuê', 'Start rental')} onClick={() => start(b)} />}
      {b.status === 'ongoing' && <IconBtn icon={Flag} tone="success" label={t('Hoàn thành', 'Complete')} onClick={() => complete(b)} />}
      {['pending', 'confirmed'].includes(b.status) && <IconBtn icon={Ban} tone="danger" label={t('Hủy', 'Cancel')} onClick={() => setCancel(b)} />}
    </div>
  )

  const cur2 = detail && bookings.find((x) => x.id === detail.id)
  const car2 = cur2 && getCar(cur2.carId)
  const eligible = car2 ? drivers.filter((d) => d.status !== 'off' || d.id === cur2.driverId) : []

  return (
    <div>
      <PageHead title={t('Quản lý đơn thuê', 'Bookings')} subtitle={`${bookings.length} ${t('đơn thuê', 'bookings')}`} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {['all', ...Object.keys(BOOKING_STATUS)].map((k) => (
            <button key={k} onClick={() => { setTab(k); setPage(1) }} className={cx('shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition', tab === k ? 'bg-fg text-bg' : 'bg-surface text-muted hover:text-fg border border-line')}>
              {k === 'all' ? t('Tất cả', 'All') : l(BOOKING_STATUS[k])} <span className="opacity-60">{count(k)}</span>
            </button>
          ))}
        </div>
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1) }} placeholder={t('Mã đơn, khách, xe...', 'Code, customer, car...')} className="ml-auto w-full sm:w-64" />
      </div>

      <Table head={[t('Mã đơn', 'Code'), t('Khách hàng', 'Customer'), t('Xe', 'Car'), t('Thời gian', 'Period'), t('Tổng tiền', 'Total'), t('Trạng thái', 'Status'), t('Thanh toán', 'Payment'), { label: '', right: true }]}
        empty={rows.length === 0 && <div className="p-6"><Empty title={t('Không có đơn nào', 'No bookings')} /></div>}>
        {rows.map((b) => {
          const car = getCar(b.carId)
          return (
            <tr key={b.id} className="hover:bg-surface2/40">
              <Td className="font-extrabold text-primary">{b.code}</Td>
              <Td><p className="font-semibold">{b.contact.name}</p><p className="text-xs text-muted">{b.contact.phone}</p></Td>
              <Td>{car ? `${car.brand} ${car.model}` : '—'}<p className="text-xs text-muted">{b.withDriver ? t('Có tài xế', 'Chauffeur') : t('Tự lái', 'Self-drive')}</p></Td>
              <Td className="whitespace-nowrap">{fmtDate(b.from, lang).slice(0, 5)} → {fmtDate(b.to, lang).slice(0, 5)}<p className="text-xs text-muted">{b.days} {t('ngày', 'days')}</p></Td>
              <Td className="font-bold">{money(b.total)}</Td>
              <Td><BookingBadge value={b.status} /></Td>
              <Td><PaymentBadge value={b.paymentStatus} /></Td>
              <Td right>{actions(b)}</Td>
            </tr>
          )
        })}
      </Table>
      <Pagination page={cur} pages={pages} onChange={setPage} className="mt-6" />

      <Modal open={!!cur2} onClose={() => setDetail(null)} size="md" title={cur2 ? `${t('Đơn', 'Booking')} ${cur2.code}` : ''}
        footer={cur2 && <>
          {['pending', 'confirmed'].includes(cur2.status) && <Button variant="danger" size="sm" onClick={() => { setCancel(cur2); setDetail(null) }}>{t('Hủy đơn', 'Cancel')}</Button>}
          {cur2.status === 'pending' && <Button size="sm" onClick={() => confirm(cur2)}>{t('Xác nhận', 'Confirm')}</Button>}
          {cur2.status === 'confirmed' && <Button size="sm" onClick={() => start(cur2)}>{t('Bắt đầu thuê', 'Start rental')}</Button>}
          {cur2.status === 'ongoing' && <Button size="sm" onClick={() => complete(cur2)}>{t('Hoàn thành', 'Complete')}</Button>}
        </>}>
        {cur2 && (
          <div>
            <div className="mb-3 flex gap-2"><BookingBadge value={cur2.status} /><PaymentBadge value={cur2.paymentStatus} /></div>
            <div className="divide-y divide-line text-sm">
              {[
                [t('Khách hàng', 'Customer'), `${cur2.contact.name} · ${cur2.contact.phone}`],
                ['Email', cur2.contact.email],
                ...(cur2.contact.license ? [[t('Số GPLX', 'Licence'), cur2.contact.license]] : []),
                [t('Xe', 'Car'), car2 ? `${car2.brand} ${car2.model} (${car2.plate})` : '—'],
                [t('Thời gian', 'Period'), `${fmtDate(cur2.from, lang)} → ${fmtDate(cur2.to, lang)} (${cur2.days} ${t('ngày', 'days')})`],
                [t('Nhận xe tại', 'Pickup'), cur2.pickup],
                [t('Dịch vụ thêm', 'Extras'), cur2.extras.length ? cur2.extras.map((id) => l(EXTRAS.find((e) => e.id === id))).join(', ') : '—'],
                [t('Thanh toán', 'Payment'), l(PAYMENTS.find((p) => p.id === cur2.payment))],
                ...(cur2.note ? [[t('Ghi chú', 'Note'), cur2.note]] : []),
                ...(cur2.discount ? [[`${t('Giảm giá', 'Discount')} ${cur2.couponCode}`, '-' + money(cur2.discount)]] : []),
                [t('Tổng cộng', 'Total'), <b key="t" className="text-base text-primary">{money(cur2.total)}</b>],
              ].map(([a, b], i) => <div key={i} className="flex justify-between gap-4 py-2.5"><span className="text-muted">{a}</span><span className="text-right font-semibold">{b}</span></div>)}
            </div>
            {cur2.withDriver && cur2.status !== 'cancelled' && cur2.status !== 'completed' && (
              <div className="mt-4 rounded-2xl bg-surface2 p-4">
                <Select label={t('Phân công tài xế', 'Assign driver')} value={cur2.driverId || ''} onChange={(e) => assign(cur2, e.target.value)}>
                  <option value="">{t('Chưa phân công', 'Unassigned')}</option>
                  {eligible.map((d) => <option key={d.id} value={d.id}>{d.name} · {t('hạng', 'class')} {d.licenseClass} · {l(DRIVER_STATUS[d.status])}</option>)}
                </Select>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Confirm open={!!cancel} onClose={() => setCancel(null)} onConfirm={() => doCancel(cancel)} title={t('Hủy đơn thuê?', 'Cancel booking?')}
        text={cancel ? `${t('Đơn', 'Booking')} ${cancel.code} ${t('sẽ bị hủy. Nếu đã thanh toán, đơn chuyển sang trạng thái hoàn tiền.', 'will be cancelled. If paid, it will be marked as refunded.')}` : ''}
        confirmLabel={t('Hủy đơn', 'Cancel booking')} cancelLabel={t('Giữ lại', 'Keep')} />
    </div>
  )
}
