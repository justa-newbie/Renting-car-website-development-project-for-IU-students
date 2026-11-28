import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import CarImage from '@/components/CarImage'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Checkbox, Input, Select } from '@/components/ui/Field'
import { Confirm, Empty, Pagination, Switch } from '@/components/ui/misc'
import { CarStatusBadge } from '@/components/StatusBadges'
import { IconBtn, PageHead, SearchInput, Table, Td } from '@/components/admin/parts'
import { useDocTitle } from '@/components/Guards'
import { useI18n } from '@/context/I18nContext'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { BRANDS, CAR_STATUS, CITIES, COLORS, FEATURES, FUELS, SEAT_GROUPS, TRANSMISSIONS } from '@/data/constants'
import { cx, money, seatGroup, todayISO } from '@/lib/format'

const TYPES = { sedan: 'Sedan / Hatchback', suv: 'SUV', mpv: 'MPV', van: 'Van 16 chỗ', minibus: 'Minibus', bus: 'Bus' }
const SEAT_OPTIONS = [4, 5, 7, 16, 29, 45]
const typeFor = (s) => (s <= 5 ? 'sedan' : s <= 9 ? 'mpv' : s <= 17 ? 'van' : s <= 32 ? 'minibus' : 'bus')

const blank = () => ({
  brand: 'Toyota', model: '', year: new Date().getFullYear(), seats: 4, type: 'sedan', color: 'white', fuel: 'gasoline', transmission: 'auto',
  pricePerDay: 700000, driverFee: 400000, driverOnly: false, deposit: 3000000, kmLimit: 300, city: CITIES[0], plate: '', status: 'active', features: [], isNew: false,
})

export default function AdminCars() {
  const { t, l } = useI18n()
  const toast = useToast()
  const { cars, bookings, saveCar, deleteCar, ratingOf } = useStore()
  const [q, setQ] = useState('')
  const [seat, setSeat] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [edit, setEdit] = useState(null) // car đang sửa/tạo
  const [errors, setErrors] = useState({})
  const [del, setDel] = useState(null)
  useDocTitle(t('Quản lý xe', 'Vehicles'))

  const list = useMemo(() => cars.filter((c) => {
    if (q && !`${c.brand} ${c.model} ${c.plate}`.toLowerCase().includes(q.toLowerCase())) return false
    if (seat && seatGroup(c.seats) !== Number(seat)) return false
    if (status && c.status !== status) return false
    return true
  }), [cars, q, seat, status])
  const PAGE = 8
  const pages = Math.max(1, Math.ceil(list.length / PAGE))
  const cur = Math.min(page, pages)
  const rows = list.slice((cur - 1) * PAGE, cur * PAGE)

  const set = (patch) => setEdit((s) => ({ ...s, ...patch }))
  const setSeats = (seats) => set({ seats, type: typeFor(seats), driverOnly: seats >= 16, driverFee: seats >= 16 ? 0 : edit.driverFee || 400000, deposit: seats >= 16 ? 0 : edit.deposit || 3000000, kmLimit: seats >= 16 ? 0 : edit.kmLimit || 300 })

  const submit = (e) => {
    e.preventDefault()
    const x = {}
    if (!edit.model.trim()) x.model = t('Nhập tên mẫu xe', 'Enter the model')
    if (!(edit.year >= 2000 && edit.year <= new Date().getFullYear() + 1)) x.year = t('Năm không hợp lệ', 'Invalid year')
    if (!(edit.pricePerDay >= 100000)) x.price = t('Giá tối thiểu 100.000đ', 'Minimum 100,000đ')
    if (!edit.plate.trim()) x.plate = t('Nhập biển số', 'Enter the plate')
    setErrors(x)
    if (Object.keys(x).length) return
    saveCar({ ...edit, year: +edit.year, pricePerDay: +edit.pricePerDay, driverFee: +edit.driverFee, deposit: +edit.deposit, kmLimit: +edit.kmLimit, createdAt: edit.createdAt || todayISO() })
    toast(edit.id ? t('Đã cập nhật xe', 'Car updated') : t('Đã thêm xe mới', 'Car added'))
    setEdit(null)
  }

  const tryDelete = (c) => {
    if (bookings.some((b) => b.carId === c.id && ['pending', 'confirmed', 'ongoing'].includes(b.status))) {
      return toast(t('Xe đang có đơn thuê chưa hoàn tất, không thể xóa', 'This car has open bookings and cannot be deleted'), 'error')
    }
    setDel(c)
  }

  return (
    <div>
      <PageHead title={t('Quản lý xe', 'Vehicles')} subtitle={`${cars.length} ${t('xe trong hệ thống', 'vehicles in the system')}`} action={<Button onClick={() => { setErrors({}); setEdit(blank()) }}><Plus className="size-4" />{t('Thêm xe', 'Add car')}</Button>} />

      <div className="mb-4 flex flex-wrap gap-3">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1) }} placeholder={t('Tìm hãng, mẫu, biển số...', 'Search brand, model, plate...')} className="w-full sm:w-72" />
        <select value={seat} onChange={(e) => { setSeat(e.target.value); setPage(1) }} className="h-10 cursor-pointer rounded-full border border-line bg-surface px-4 text-sm" aria-label="seats">
          <option value="">{t('Mọi loại xe', 'All sizes')}</option>{SEAT_GROUPS.map((g) => <option key={g.key} value={g.key}>{l(g)}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="h-10 cursor-pointer rounded-full border border-line bg-surface px-4 text-sm" aria-label="status">
          <option value="">{t('Mọi trạng thái', 'All statuses')}</option>{Object.entries(CAR_STATUS).map(([k, v]) => <option key={k} value={k}>{l(v)}</option>)}
        </select>
      </div>

      <Table head={[t('Xe', 'Vehicle'), t('Số chỗ', 'Seats'), t('Thành phố', 'City'), t('Giá / ngày', 'Price / day'), t('Đánh giá', 'Rating'), t('Trạng thái', 'Status'), { label: '', right: true }]}
        empty={rows.length === 0 && <div className="p-6"><Empty title={t('Không có xe nào', 'No cars found')} /></div>}>
        {rows.map((c) => (
          <tr key={c.id} className="hover:bg-surface2/40">
            <Td>
              <div className="flex items-center gap-3">
                <div className="w-20 shrink-0 rounded-xl bg-surface2 p-1.5"><CarImage src={c.image} type={c.type} color={c.color} className="w-full" /></div>
                <div className="min-w-0"><p className="font-bold">{c.brand} {c.model}</p><p className="text-xs text-muted">{c.year} · {c.plate} · {l(FUELS[c.fuel])}</p></div>
              </div>
            </Td>
            <Td>{c.seats}</Td>
            <Td>{c.city}</Td>
            <Td className="font-semibold">{money(c.pricePerDay)}</Td>
            <Td>{ratingOf(c.id).count ? `${ratingOf(c.id).avg.toFixed(1)} (${ratingOf(c.id).count})` : '—'}</Td>
            <Td><CarStatusBadge value={c.status} /></Td>
            <Td right>
              <div className="flex justify-end gap-1">
                <IconBtn icon={Pencil} label={t('Sửa', 'Edit')} onClick={() => { setErrors({}); setEdit({ ...c }) }} />
                <IconBtn icon={Trash2} tone="danger" label={t('Xóa', 'Delete')} onClick={() => tryDelete(c)} />
              </div>
            </Td>
          </tr>
        ))}
      </Table>
      <Pagination page={cur} pages={pages} onChange={setPage} className="mt-6" />

      <Modal open={!!edit} onClose={() => setEdit(null)} size="lg" title={edit?.id ? t('Sửa thông tin xe', 'Edit vehicle') : t('Thêm xe mới', 'Add vehicle')}
        footer={<><Button variant="secondary" onClick={() => setEdit(null)}>{t('Hủy', 'Cancel')}</Button><Button type="submit" form="car-form">{t('Lưu', 'Save')}</Button></>}>
        {edit && (
          <form id="car-form" onSubmit={submit} noValidate className="space-y-5">
            <div className="flex items-center gap-4 rounded-2xl bg-surface2 p-4">
              <CarImage src={edit.image} type={edit.type} color={edit.color} className="w-40 shrink-0" />
              <div className="text-sm text-muted">{t('Ảnh minh họa tự động theo loại xe và màu. Khi có BE, thay bằng ảnh tải lên.', 'Illustration follows type and color. Replace with uploaded photos once the backend is ready.')}</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label={t('Hãng xe', 'Brand')} value={edit.brand} onChange={(e) => set({ brand: e.target.value })}>{BRANDS.map((b) => <option key={b}>{b}</option>)}</Select>
              <Input label={t('Mẫu xe', 'Model')} value={edit.model} onChange={(e) => set({ model: e.target.value })} error={errors.model} />
              <Input label={t('Năm sản xuất', 'Year')} type="number" value={edit.year} onChange={(e) => set({ year: e.target.value })} error={errors.year} />
              <Select label={t('Số chỗ', 'Seats')} value={edit.seats} onChange={(e) => setSeats(+e.target.value)}>{SEAT_OPTIONS.map((s) => <option key={s} value={s}>{s} {t('chỗ', 'seats')}</option>)}</Select>
              <Select label={t('Kiểu thân xe', 'Body type')} value={edit.type} onChange={(e) => set({ type: e.target.value })}>{Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>
              <Select label={t('Thành phố', 'City')} value={edit.city} onChange={(e) => set({ city: e.target.value })}>{CITIES.map((c) => <option key={c}>{c}</option>)}</Select>
              <Select label={t('Nhiên liệu', 'Fuel')} value={edit.fuel} onChange={(e) => set({ fuel: e.target.value })}>{Object.entries(FUELS).map(([k, v]) => <option key={k} value={k}>{l(v)}</option>)}</Select>
              <Select label={t('Hộp số', 'Transmission')} value={edit.transmission} onChange={(e) => set({ transmission: e.target.value })}>{Object.entries(TRANSMISSIONS).map(([k, v]) => <option key={k} value={k}>{l(v)}</option>)}</Select>
              <Input label={t('Giá thuê / ngày (đ)', 'Price / day (VND)')} type="number" step="10000" value={edit.pricePerDay} onChange={(e) => set({ pricePerDay: e.target.value })} error={errors.price} />
              <Input label={t('Biển số', 'Plate')} value={edit.plate} onChange={(e) => set({ plate: e.target.value })} error={errors.plate} placeholder="30A-123.45" />
              {!edit.driverOnly && <Input label={t('Phí tài xế / ngày (đ)', 'Driver fee / day')} type="number" step="10000" value={edit.driverFee} onChange={(e) => set({ driverFee: e.target.value })} />}
              {!edit.driverOnly && <Input label={t('Tiền cọc (đ)', 'Deposit')} type="number" step="100000" value={edit.deposit} onChange={(e) => set({ deposit: e.target.value })} />}
              {!edit.driverOnly && <Input label={t('Giới hạn km / ngày', 'Km limit / day')} type="number" value={edit.kmLimit} onChange={(e) => set({ kmLimit: e.target.value })} />}
              <Input wrapClass="sm:col-span-2" label={t('Ảnh xe (đường dẫn hoặc URL, để trống dùng hình vẽ)', 'Photo (path or URL, empty uses illustration)')} value={edit.image || ''} onChange={(e) => set({ image: e.target.value })} placeholder="/cars/c1.jpg" />
              <Select label={t('Trạng thái', 'Status')} value={edit.status} onChange={(e) => set({ status: e.target.value })}>{Object.entries(CAR_STATUS).map(([k, v]) => <option key={k} value={k}>{l(v)}</option>)}</Select>
            </div>

            <div>
              <p className="mb-2 text-[13px] font-semibold">{t('Màu xe', 'Color')}</p>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button type="button" key={c.id} onClick={() => set({ color: c.id })} className={cx('flex cursor-pointer items-center gap-2 rounded-full border-2 py-1.5 pl-1.5 pr-3 text-xs font-semibold', edit.color === c.id ? 'border-primary' : 'border-line')}>
                    <span className="size-5 rounded-full border border-line" style={{ background: c.hex }} />{l(c)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[13px] font-semibold">{t('Tiện nghi', 'Features')}</p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {Object.entries(FEATURES).map(([k, v]) => <Checkbox key={k} label={l(v)} checked={edit.features.includes(k)} onChange={() => set({ features: edit.features.includes(k) ? edit.features.filter((x) => x !== k) : [...edit.features, k] })} />)}
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <Switch checked={edit.driverOnly} onChange={(v) => set({ driverOnly: v })} label={t('Chỉ thuê kèm tài xế', 'Chauffeur only')} />
              <Switch checked={edit.isNew} onChange={(v) => set({ isNew: v })} label={t('Gắn nhãn "Mới"', 'Mark as "New"')} />
            </div>
          </form>
        )}
      </Modal>

      <Confirm open={!!del} onClose={() => setDel(null)} onConfirm={() => { deleteCar(del.id); toast(t('Đã xóa xe', 'Car deleted'), 'info') }}
        title={t('Xóa xe này?', 'Delete this car?')} text={del ? `${del.brand} ${del.model} (${del.plate}) ${t('sẽ bị xóa vĩnh viễn.', 'will be permanently deleted.')}` : ''}
        confirmLabel={t('Xóa', 'Delete')} cancelLabel={t('Hủy', 'Cancel')} />
    </div>
  )
}
