import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Field'
import { Confirm, Empty, Rating } from '@/components/ui/misc'
import { DriverBadge } from '@/components/StatusBadges'
import { IconBtn, PageHead, Table, Td } from '@/components/admin/parts'
import { useDocTitle } from '@/components/Guards'
import { useI18n } from '@/context/I18nContext'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { DRIVER_STATUS } from '@/data/constants'
import { initials } from '@/lib/format'

const blank = () => ({ name: '', phone: '', licenseClass: 'D', years: 3, status: 'available', rating: 5 })

export default function AdminDrivers() {
  const { t, l } = useI18n()
  const toast = useToast()
  const { drivers, bookings, saveDriver, deleteDriver } = useStore()
  const [edit, setEdit] = useState(null)
  const [err, setErr] = useState({})
  const [del, setDel] = useState(null)
  useDocTitle(t('Tài xế', 'Drivers'))

  const trips = (id) => bookings.filter((b) => b.driverId === id).length
  const submit = (e) => {
    e.preventDefault()
    const x = {}
    if (edit.name.trim().length < 2) x.name = t('Nhập họ tên', 'Enter a name')
    if (!/^(0|\+84)\d{9,10}$/.test(edit.phone.replace(/\s/g, ''))) x.phone = t('Số điện thoại chưa hợp lệ', 'Invalid phone number')
    if (!(edit.years >= 0 && edit.years <= 50)) x.years = t('0 - 50 năm', '0 - 50 years')
    setErr(x)
    if (Object.keys(x).length) return
    saveDriver({ ...edit, years: +edit.years, rating: +edit.rating })
    toast(edit.id ? t('Đã cập nhật tài xế', 'Driver updated') : t('Đã thêm tài xế', 'Driver added'))
    setEdit(null)
  }
  const tryDelete = (d) => {
    if (bookings.some((b) => b.driverId === d.id && ['confirmed', 'ongoing'].includes(b.status))) return toast(t('Tài xế đang được phân công, không thể xóa', 'Driver is assigned to an active booking'), 'error')
    setDel(d)
  }

  return (
    <div>
      <PageHead title={t('Tài xế', 'Drivers')} subtitle={`${drivers.length} ${t('tài xế', 'drivers')} · ${drivers.filter((d) => d.status === 'available').length} ${t('sẵn sàng', 'available')}`} action={<Button onClick={() => { setErr({}); setEdit(blank()) }}><Plus className="size-4" />{t('Thêm tài xế', 'Add driver')}</Button>} />
      <Table head={[t('Tài xế', 'Driver'), t('Điện thoại', 'Phone'), t('Bằng lái', 'Licence'), t('Kinh nghiệm', 'Experience'), t('Số chuyến', 'Trips'), t('Đánh giá', 'Rating'), t('Trạng thái', 'Status'), { label: '', right: true }]}
        empty={drivers.length === 0 && <div className="p-6"><Empty title={t('Chưa có tài xế', 'No drivers')} /></div>}>
        {drivers.map((d) => (
          <tr key={d.id} className="hover:bg-surface2/40">
            <Td><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">{initials(d.name)}</span><span className="font-bold">{d.name}</span></div></Td>
            <Td>{d.phone}</Td>
            <Td>{t('Hạng', 'Class')} {d.licenseClass}</Td>
            <Td>{d.years} {t('năm', 'yrs')}</Td>
            <Td>{trips(d.id)}</Td>
            <Td><Rating value={d.rating} size="size-3.5" /></Td>
            <Td><DriverBadge value={d.status} /></Td>
            <Td right><div className="flex justify-end gap-1"><IconBtn icon={Pencil} label={t('Sửa', 'Edit')} onClick={() => { setErr({}); setEdit({ ...d }) }} /><IconBtn icon={Trash2} tone="danger" label={t('Xóa', 'Delete')} onClick={() => tryDelete(d)} /></div></Td>
          </tr>
        ))}
      </Table>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? t('Sửa tài xế', 'Edit driver') : t('Thêm tài xế', 'Add driver')} size="md"
        footer={<><Button variant="secondary" onClick={() => setEdit(null)}>{t('Hủy', 'Cancel')}</Button><Button type="submit" form="driver-form">{t('Lưu', 'Save')}</Button></>}>
        {edit && (
          <form id="driver-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
            <Input wrapClass="sm:col-span-2" label={t('Họ và tên', 'Full name')} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} error={err.name} />
            <Input label={t('Số điện thoại', 'Phone')} value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} error={err.phone} />
            <Select label={t('Hạng bằng lái', 'Licence class')} value={edit.licenseClass} onChange={(e) => setEdit({ ...edit, licenseClass: e.target.value })}>{['B2', 'D', 'E', 'FC'].map((c) => <option key={c}>{c}</option>)}</Select>
            <Input label={t('Số năm kinh nghiệm', 'Years of experience')} type="number" value={edit.years} onChange={(e) => setEdit({ ...edit, years: e.target.value })} error={err.years} />
            <Select label={t('Trạng thái', 'Status')} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>{Object.entries(DRIVER_STATUS).map(([k, v]) => <option key={k} value={k}>{l(v)}</option>)}</Select>
          </form>
        )}
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} onConfirm={() => { deleteDriver(del.id); toast(t('Đã xóa tài xế', 'Driver deleted'), 'info') }} title={t('Xóa tài xế?', 'Delete driver?')} text={del ? `${del.name} ${t('sẽ bị xóa khỏi hệ thống.', 'will be removed.')}` : ''} confirmLabel={t('Xóa', 'Delete')} cancelLabel={t('Hủy', 'Cancel')} />
    </div>
  )
}
