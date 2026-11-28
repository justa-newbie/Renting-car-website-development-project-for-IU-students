import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, MapPin, Search, Users } from 'lucide-react'
import Button from './ui/Button'
import { useI18n } from '@/context/I18nContext'
import { CITIES, SEAT_GROUPS } from '@/data/constants'
import { addDays, todayISO } from '@/lib/format'
import { inputCls } from './ui/Field'

const Box = ({ icon: Icon, label, children }) => (
  <label className="block min-w-0">
    <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted"><Icon className="size-3.5 text-primary" />{label}</span>
    {children}
  </label>
)

/** Ô tìm xe ở trang chủ: địa điểm, ngày nhận/trả, loại xe */
export default function SearchBar() {
  const { t, l } = useI18n()
  const nav = useNavigate()
  const [city, setCity] = useState('')
  const [from, setFrom] = useState(todayISO())
  const [to, setTo] = useState(addDays(todayISO(), 2))
  const [seats, setSeats] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const q = new URLSearchParams()
    if (city) q.set('city', city)
    if (from) q.set('from', from)
    if (to) q.set('to', to)
    if (seats) q.set('seats', seats)
    nav('/cars?' + q.toString())
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-[28px] border border-line bg-surface p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto] lg:items-end lg:p-5">
      <Box icon={MapPin} label={t('Địa điểm nhận xe', 'Pickup city')}>
        <select value={city} onChange={(e) => setCity(e.target.value)} className={inputCls}>
          <option value="">{t('Tất cả thành phố', 'All cities')}</option>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </Box>
      <Box icon={CalendarDays} label={t('Ngày nhận', 'Pickup date')}>
        <input type="date" min={todayISO()} value={from} onChange={(e) => { setFrom(e.target.value); if (to <= e.target.value) setTo(addDays(e.target.value, 1)) }} className={inputCls} />
      </Box>
      <Box icon={CalendarDays} label={t('Ngày trả', 'Return date')}>
        <input type="date" min={addDays(from, 1)} value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
      </Box>
      <Box icon={Users} label={t('Loại xe', 'Vehicle type')}>
        <select value={seats} onChange={(e) => setSeats(e.target.value)} className={inputCls}>
          <option value="">{t('Tất cả loại xe', 'All types')}</option>
          {SEAT_GROUPS.map((g) => <option key={g.key} value={g.key}>{l(g)}</option>)}
        </select>
      </Box>
      <Button type="submit" size="lg" className="h-11 sm:col-span-2 lg:col-span-1"><Search className="size-4" />{t('Tìm xe', 'Search')}</Button>
    </form>
  )
}
