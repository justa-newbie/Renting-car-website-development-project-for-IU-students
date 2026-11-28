import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarCheck, CarFront, RotateCcw, Users, Wallet } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Confirm } from '@/components/ui/misc'
import CarImage from '@/components/CarImage'
import { BookingBadge } from '@/components/StatusBadges'
import { Card, PageHead, StatCard } from '@/components/admin/parts'
import { useDocTitle } from '@/components/Guards'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/context/I18nContext'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { BOOKING_STATUS, SEAT_GROUPS } from '@/data/constants'
import { fmtDate, money, moneyShort, seatGroup, todayISO } from '@/lib/format'

const STATUS_COLOR = { pending: '#f59e0b', confirmed: '#0ea5e9', ongoing: '#e5232f', completed: '#10b981', cancelled: '#9ca3af' }
const tip = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, color: 'var(--fg)', fontSize: 12 }

const monthLabel = (key) => `${key.slice(5)}/${key.slice(2, 4)}`
const prevMonths = (n) => {
  const out = []
  const d = new Date()
  d.setDate(1)
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1)
    out.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`)
  }
  return out
}

export default function Dashboard() {
  const { t, l, lang } = useI18n()
  const { user } = useAuth()
  const toast = useToast()
  const { bookings, cars, users, getCar, resetDemo } = useStore()
  const [reset, setReset] = useState(false)
  useDocTitle(t('Tổng quan', 'Dashboard'))

  const data = useMemo(() => {
    const earning = bookings.filter((b) => !['cancelled', 'pending'].includes(b.status))
    const months = prevMonths(6)
    const revenue = months.map((m) => ({ name: monthLabel(m), key: m, value: earning.filter((b) => b.from.startsWith(m)).reduce((s, b) => s + b.total, 0), trips: earning.filter((b) => b.from.startsWith(m)).length }))
    const cur = revenue[5].value, prev = revenue[4].value
    const delta = prev ? Math.round(((cur - prev) / prev) * 100) : 0
    const status = Object.keys(BOOKING_STATUS).map((k) => ({ key: k, name: l(BOOKING_STATUS[k]), value: bookings.filter((b) => b.status === k).length })).filter((x) => x.value)
    const bySeats = SEAT_GROUPS.map((g) => ({ name: l(g), value: earning.filter((b) => { const c = getCar(b.carId); return c && seatGroup(c.seats) === g.key }).length }))
    const counts = {}
    earning.forEach((b) => (counts[b.carId] = (counts[b.carId] || 0) + 1))
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, n]) => ({ car: getCar(id), n })).filter((x) => x.car)
    const today = todayISO()
    return {
      revenue, delta, status, bySeats, top,
      thisMonthTrips: revenue[5].trips,
      rentedNow: bookings.filter((b) => b.status === 'ongoing' && b.from <= today).length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      customers: users.filter((u) => u.role === 'user').length,
    }
  }, [bookings, users, getCar, l])

  const recent = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.code.localeCompare(a.code)).slice(0, 6)

  return (
    <div>
      <PageHead
        title={`${t('Xin chào', 'Hello')}, ${user?.name}`}
        subtitle={t('Tổng quan hoạt động cho thuê xe của bạn.', 'An overview of your rental operations.')}
        action={<Button variant="outline" size="sm" onClick={() => setReset(true)}><RotateCcw className="size-4" />{t('Đặt lại dữ liệu mẫu', 'Reset demo data')}</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wallet} label={t('Doanh thu tháng này', 'Revenue this month')} value={moneyShort(data.revenue[5].value)} delta={data.delta} />
        <StatCard icon={CalendarCheck} tone="blue" label={`${t('Chuyến tháng này', 'Trips this month')} · ${data.pending} ${t('chờ duyệt', 'pending')}`} value={data.thisMonthTrips} />
        <StatCard icon={CarFront} tone="green" label={`${t('Xe đang cho thuê', 'Cars on rent')} / ${cars.length}`} value={data.rentedNow} />
        <StatCard icon={Users} tone="amber" label={t('Khách hàng', 'Customers')} value={data.customers} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card title={t('Doanh thu 6 tháng gần nhất', 'Revenue, last 6 months')}>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={data.revenue} margin={{ left: -10, right: 8, top: 8 }}>
                <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e5232f" stopOpacity={0.35} /><stop offset="1" stopColor="#e5232f" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={moneyShort} tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tip} formatter={(v) => [money(v), t('Doanh thu', 'Revenue')]} />
                <Area type="monotone" dataKey="value" stroke="#e5232f" strokeWidth={3} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={t('Trạng thái đơn thuê', 'Booking status')}>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.status} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                  {data.status.map((s) => <Cell key={s.key} fill={STATUS_COLOR[s.key]} />)}
                </Pie>
                <Tooltip contentStyle={tip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {data.status.map((s) => <li key={s.key} className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: STATUS_COLOR[s.key] }} /><span className="flex-1 text-muted">{s.name}</span><b>{s.value}</b></li>)}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card title={t('Số chuyến theo loại xe', 'Trips by vehicle size')}>
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={data.bySeats} margin={{ left: -20, top: 8 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tip} cursor={{ fill: 'var(--surface2)' }} formatter={(v) => [v, t('Chuyến', 'Trips')]} />
                <Bar dataKey="value" fill="#e5232f" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={t('Xe được thuê nhiều nhất', 'Top rented cars')} className="xl:col-span-1">
          <ul className="space-y-3">
            {data.top.map(({ car, n }, i) => (
              <li key={car.id} className="flex items-center gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface2 text-xs font-bold">{i + 1}</span>
                <div className="w-16 shrink-0"><CarImage src={car.image} type={car.type} color={car.color} className="w-full" /></div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{car.brand} {car.model}</p><p className="text-xs text-muted">{money(car.pricePerDay)} / {t('ngày', 'day')}</p></div>
                <b className="text-sm">{n} {t('chuyến', 'trips')}</b>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t('Đơn thuê gần đây', 'Recent bookings')} action={<Link to="/admin/bookings" className="text-sm font-semibold text-primary hover:underline">{t('Xem tất cả', 'View all')}</Link>}>
          <ul className="space-y-3">
            {recent.map((b) => {
              const car = getCar(b.carId)
              return (
                <li key={b.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0"><p className="truncate text-sm font-bold">{b.code} · {b.contact.name}</p><p className="truncate text-xs text-muted">{car ? `${car.brand} ${car.model}` : ''} · {fmtDate(b.from, lang).slice(0, 5)}</p></div>
                  <div className="text-right"><BookingBadge value={b.status} /><p className="mt-1 text-xs font-bold">{moneyShort(b.total)}</p></div>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      <Confirm open={reset} onClose={() => setReset(false)} onConfirm={() => { resetDemo(); toast(t('Đã khôi phục dữ liệu mẫu', 'Demo data restored'), 'info') }} title={t('Đặt lại dữ liệu mẫu?', 'Reset demo data?')} text={t('Mọi thay đổi (xe, đơn thuê, khách hàng...) sẽ bị xóa và quay về dữ liệu ban đầu.', 'All changes (cars, bookings, customers...) will be lost and replaced with the initial demo data.')} confirmLabel={t('Đặt lại', 'Reset')} cancelLabel={t('Hủy', 'Cancel')} />
    </div>
  )
}
