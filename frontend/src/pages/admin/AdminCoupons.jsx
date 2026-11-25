import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Field'
import { Confirm, Empty, Switch } from '@/components/ui/misc'
import { IconBtn, PageHead, Table, Td } from '@/components/admin/parts'
import { useDocTitle } from '@/components/Guards'
import { useI18n } from '@/context/I18nContext'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { addDays, fmtDate, money, todayISO } from '@/lib/format'

const blank = () => ({ code: '', type: 'percent', value: 10, maxDiscount: 200000, minTotal: 500000, expiresAt: addDays(todayISO(), 60), usageLimit: 100, used: 0, active: true, descVi: '', descEn: '' })

export default function AdminCoupons() {
  const { t, lang } = useI18n()
  const toast = useToast()
  const { coupons, saveCoupon, deleteCoupon } = useStore()
  const [edit, setEdit] = useState(null)
  const [err, setErr] = useState({})
  const [del, setDel] = useState(null)
  useDocTitle(t('Mã giảm giá', 'Coupons'))

  const submit = (e) => {
    e.preventDefault()
    const x = {}
    const code = edit.code.trim().toUpperCase()
    if (!/^[A-Z0-9]{4,16}$/.test(code)) x.code = t('4-16 ký tự chữ hoa hoặc số', '4-16 uppercase letters or digits')
    else if (coupons.some((c) => c.code === code && c.id !== edit.id)) x.code = t('Mã đã tồn tại', 'Code already exists')
    if (!(+edit.value > 0)) x.value = t('Giá trị phải lớn hơn 0', 'Must be greater than 0')
    if (edit.type === 'percent' && +edit.value > 100) x.value = t('Tối đa 100%', 'Max 100%')
    if (!edit.expiresAt) x.expiresAt = t('Chọn ngày hết hạn', 'Pick an expiry date')
    setErr(x)
    if (Object.keys(x).length) return
    saveCoupon({ ...edit, code, value: +edit.value, maxDiscount: +edit.maxDiscount, minTotal: +edit.minTotal, usageLimit: +edit.usageLimit })
    toast(edit.id ? t('Đã cập nhật mã', 'Coupon updated') : t('Đã tạo mã mới', 'Coupon created'))
    setEdit(null)
  }

  const expired = (c) => c.expiresAt < todayISO()
  return (
    <div>
      <PageHead title={t('Mã giảm giá', 'Coupons')} subtitle={`${coupons.filter((c) => c.active && !expired(c)).length} ${t('mã đang hoạt động', 'active codes')}`} action={<Button onClick={() => { setErr({}); setEdit(blank()) }}><Plus className="size-4" />{t('Tạo mã', 'New coupon')}</Button>} />
      <Table head={[t('Mã', 'Code'), t('Mức giảm', 'Discount'), t('Đơn tối thiểu', 'Min order'), t('Hết hạn', 'Expires'), t('Đã dùng', 'Used'), t('Trạng thái', 'Status'), { label: '', right: true }]}
        empty={coupons.length === 0 && <div className="p-6"><Empty title={t('Chưa có mã giảm giá', 'No coupons')} /></div>}>
        {coupons.map((c) => (
          <tr key={c.id} className="hover:bg-surface2/40">
            <Td><span className="rounded-lg border border-dashed border-primary/60 bg-primary-soft px-2.5 py-1 font-extrabold tracking-wider text-primary">{c.code}</span><p className="mt-1 max-w-56 truncate text-xs text-muted">{lang === 'vi' ? c.descVi : c.descEn}</p></Td>
            <Td className="font-bold">{c.type === 'percent' ? `${c.value}%${c.maxDiscount ? ` (≤ ${money(c.maxDiscount)})` : ''}` : money(c.value)}</Td>
            <Td>{money(c.minTotal)}</Td>
            <Td>{fmtDate(c.expiresAt, lang)}</Td>
            <Td>{c.used}/{c.usageLimit || '∞'}</Td>
            <Td>{expired(c) ? <Badge tone="neutral">{t('Hết hạn', 'Expired')}</Badge> : c.active ? <Badge tone="success">{t('Đang bật', 'Active')}</Badge> : <Badge tone="warning">{t('Đã tắt', 'Disabled')}</Badge>}</Td>
            <Td right><div className="flex justify-end gap-1"><IconBtn icon={Pencil} label={t('Sửa', 'Edit')} onClick={() => { setErr({}); setEdit({ ...c }) }} /><IconBtn icon={Trash2} tone="danger" label={t('Xóa', 'Delete')} onClick={() => setDel(c)} /></div></Td>
          </tr>
        ))}
      </Table>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? t('Sửa mã giảm giá', 'Edit coupon') : t('Tạo mã giảm giá', 'New coupon')} size="md"
        footer={<><Button variant="secondary" onClick={() => setEdit(null)}>{t('Hủy', 'Cancel')}</Button><Button type="submit" form="coupon-form">{t('Lưu', 'Save')}</Button></>}>
        {edit && (
          <form id="coupon-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
            <Input label={t('Mã', 'Code')} value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase() })} error={err.code} className="uppercase" />
            <Select label={t('Loại giảm', 'Type')} value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value })}><option value="percent">{t('Phần trăm (%)', 'Percent (%)')}</option><option value="fixed">{t('Số tiền cố định (đ)', 'Fixed amount (VND)')}</option></Select>
            <Input label={edit.type === 'percent' ? t('Giảm (%)', 'Discount (%)') : t('Giảm (đ)', 'Discount (VND)')} type="number" value={edit.value} onChange={(e) => setEdit({ ...edit, value: e.target.value })} error={err.value} />
            {edit.type === 'percent' && <Input label={t('Giảm tối đa (đ)', 'Max discount (VND)')} type="number" step="10000" value={edit.maxDiscount} onChange={(e) => setEdit({ ...edit, maxDiscount: e.target.value })} />}
            <Input label={t('Đơn tối thiểu (đ)', 'Minimum order (VND)')} type="number" step="50000" value={edit.minTotal} onChange={(e) => setEdit({ ...edit, minTotal: e.target.value })} />
            <Input label={t('Ngày hết hạn', 'Expiry date')} type="date" value={edit.expiresAt} onChange={(e) => setEdit({ ...edit, expiresAt: e.target.value })} error={err.expiresAt} />
            <Input label={t('Số lượt dùng tối đa (0 = không giới hạn)', 'Usage limit (0 = unlimited)')} type="number" value={edit.usageLimit} onChange={(e) => setEdit({ ...edit, usageLimit: e.target.value })} />
            <div className="flex items-end pb-2"><Switch checked={edit.active} onChange={(v) => setEdit({ ...edit, active: v })} label={t('Đang hoạt động', 'Active')} /></div>
            <Input wrapClass="sm:col-span-2" label={t('Mô tả (tiếng Việt)', 'Description (Vietnamese)')} value={edit.descVi} onChange={(e) => setEdit({ ...edit, descVi: e.target.value })} />
            <Input wrapClass="sm:col-span-2" label={t('Mô tả (tiếng Anh)', 'Description (English)')} value={edit.descEn} onChange={(e) => setEdit({ ...edit, descEn: e.target.value })} />
          </form>
        )}
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} onConfirm={() => { deleteCoupon(del.id); toast(t('Đã xóa mã', 'Coupon deleted'), 'info') }} title={t('Xóa mã giảm giá?', 'Delete coupon?')} text={del ? `${del.code}` : ''} confirmLabel={t('Xóa', 'Delete')} cancelLabel={t('Hủy', 'Cancel')} />
    </div>
  )
}
