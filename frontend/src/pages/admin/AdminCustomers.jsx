import { useState } from 'react'
import { Eye, Lock, Unlock } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { Empty } from '@/components/ui/misc'
import { BookingBadge } from '@/components/StatusBadges'
import { IconBtn, PageHead, SearchInput, Table, Td } from '@/components/admin/parts'
import { useDocTitle } from '@/components/Guards'
import { useI18n } from '@/context/I18nContext'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { fmtDate, initials, money } from '@/lib/format'

export default function AdminCustomers() {
  const { t, lang } = useI18n()
  const toast = useToast()
  const { users, bookings, getCar, saveUser } = useStore()
  const [q, setQ] = useState('')
  const [view, setView] = useState(null)
  useDocTitle(t('Khách hàng', 'Customers'))

  const stats = (id) => {
    const mine = bookings.filter((b) => b.userId === id)
    return { n: mine.length, spent: mine.filter((b) => ['completed', 'ongoing', 'confirmed'].includes(b.status)).reduce((s, b) => s + b.total, 0), list: mine }
  }
  const list = users.filter((u) => u.role === 'user' && (!q || `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q.toLowerCase())))
  const toggle = (u) => {
    saveUser({ id: u.id, blocked: !u.blocked })
    toast(u.blocked ? t('Đã mở khóa tài khoản', 'Account unblocked') : t('Đã khóa tài khoản', 'Account blocked'), 'info')
    setView((v) => (v && v.id === u.id ? { ...v, blocked: !u.blocked } : v))
  }
  const v = view && users.find((u) => u.id === view.id)
  const vs = v && stats(v.id)

  return (
    <div>
      <PageHead title={t('Khách hàng', 'Customers')} subtitle={`${users.filter((u) => u.role === 'user').length} ${t('tài khoản khách hàng', 'customer accounts')}`} />
      <SearchInput value={q} onChange={setQ} placeholder={t('Tìm tên, email, số điện thoại...', 'Search name, email, phone...')} className="mb-4 w-full sm:w-80" />
      <Table head={[t('Khách hàng', 'Customer'), t('Liên hệ', 'Contact'), t('Ngày đăng ký', 'Joined'), t('Số đơn', 'Bookings'), t('Chi tiêu', 'Spent'), t('Trạng thái', 'Status'), { label: '', right: true }]}
        empty={list.length === 0 && <div className="p-6"><Empty title={t('Không có khách hàng', 'No customers')} /></div>}>
        {list.map((u) => {
          const s = stats(u.id)
          return (
            <tr key={u.id} className="hover:bg-surface2/40">
              <Td><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">{initials(u.name)}</span><span className="font-bold">{u.name}</span></div></Td>
              <Td>{u.email}<p className="text-xs text-muted">{u.phone}</p></Td>
              <Td>{fmtDate(u.createdAt, lang)}</Td>
              <Td className="font-semibold">{s.n}</Td>
              <Td className="font-semibold">{money(s.spent)}</Td>
              <Td>{u.blocked ? <Badge tone="danger">{t('Bị khóa', 'Blocked')}</Badge> : <Badge tone="success">{t('Hoạt động', 'Active')}</Badge>}</Td>
              <Td right><div className="flex justify-end gap-1"><IconBtn icon={Eye} label={t('Chi tiết', 'Details')} onClick={() => setView(u)} /><IconBtn icon={u.blocked ? Unlock : Lock} tone={u.blocked ? 'success' : 'danger'} label={u.blocked ? t('Mở khóa', 'Unblock') : t('Khóa', 'Block')} onClick={() => toggle(u)} /></div></Td>
            </tr>
          )
        })}
      </Table>

      <Modal open={!!v} onClose={() => setView(null)} title={v?.name || ''} size="md">
        {v && (
          <div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-surface2 p-4"><p className="text-xs text-muted">Email</p><p className="break-all font-semibold">{v.email}</p></div>
              <div className="rounded-2xl bg-surface2 p-4"><p className="text-xs text-muted">{t('Điện thoại', 'Phone')}</p><p className="font-semibold">{v.phone}</p></div>
              <div className="rounded-2xl bg-surface2 p-4"><p className="text-xs text-muted">{t('Số GPLX', 'Licence')}</p><p className="font-semibold">{v.license || '—'}</p></div>
              <div className="rounded-2xl bg-surface2 p-4"><p className="text-xs text-muted">{t('Tổng chi tiêu', 'Total spent')}</p><p className="font-semibold">{money(vs.spent)}</p></div>
            </div>
            <h3 className="mb-3 mt-6 font-bold">{t('Lịch sử thuê', 'Rental history')} ({vs.n})</h3>
            <ul className="space-y-2">
              {vs.list.length === 0 && <li className="text-sm text-muted">{t('Chưa có đơn nào', 'No bookings yet')}</li>}
              {vs.list.slice(0, 8).map((b) => {
                const c = getCar(b.carId)
                return <li key={b.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3 text-sm"><span><b className="text-primary">{b.code}</b> · {c ? `${c.brand} ${c.model}` : ''}<br /><span className="text-xs text-muted">{fmtDate(b.from, lang)} · {money(b.total)}</span></span><BookingBadge value={b.status} /></li>
              })}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  )
}
