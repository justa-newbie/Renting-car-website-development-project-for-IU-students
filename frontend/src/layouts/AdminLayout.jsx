import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { CalendarCheck, CarFront, ChevronsLeft, ExternalLink, IdCard, LayoutDashboard, LogOut, Menu, Ticket, Users, X } from 'lucide-react'
import Logo from '@/components/Logo'
import { LangSwitch, ThemeToggle } from '@/components/Toggles'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/context/I18nContext'
import { cx, initials } from '@/lib/format'

export default function AdminLayout() {
  const { t } = useI18n()
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobile, setMobile] = useState(false)

  const items = [
    { to: '/admin', end: true, icon: LayoutDashboard, label: t('Tổng quan', 'Dashboard') },
    { to: '/admin/cars', icon: CarFront, label: t('Quản lý xe', 'Vehicles') },
    { to: '/admin/bookings', icon: CalendarCheck, label: t('Đơn thuê', 'Bookings') },
    { to: '/admin/customers', icon: Users, label: t('Khách hàng', 'Customers') },
    { to: '/admin/drivers', icon: IdCard, label: t('Tài xế', 'Drivers') },
    { to: '/admin/coupons', icon: Ticket, label: t('Mã giảm giá', 'Coupons') },
  ]

  const Side = ({ mini }) => (
    <div className="flex h-full flex-col gap-1 p-4">
      <div className={cx('mb-6 flex items-center', mini ? 'justify-center' : 'justify-between')}>
        {mini ? <Link to="/admin" className="grid size-10 place-items-center rounded-2xl bg-primary text-onprimary"><CarFront className="size-5" /></Link> : <Logo to="/admin" />}
      </div>
      {items.map((i) => (
        <NavLink
          key={i.to}
          to={i.to}
          end={i.end}
          onClick={() => setMobile(false)}
          title={i.label}
          className={({ isActive }) =>
            cx('flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition', mini && 'justify-center px-0', isActive ? 'bg-fg text-bg' : 'text-muted hover:bg-surface2 hover:text-fg')
          }
        >
          <i.icon className="size-5 shrink-0" />
          {!mini && i.label}
        </NavLink>
      ))}
      <div className="mt-auto space-y-1 border-t border-line pt-4">
        <Link to="/" className={cx('flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold text-muted hover:bg-surface2 hover:text-fg', mini && 'justify-center px-0')} title={t('Xem website', 'View site')}>
          <ExternalLink className="size-5 shrink-0" />{!mini && t('Xem website', 'View site')}
        </Link>
        <button onClick={() => { logout(); nav('/') }} className={cx('flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold text-red-500 hover:bg-surface2', mini && 'justify-center px-0')} title={t('Đăng xuất', 'Log out')}>
          <LogOut className="size-5 shrink-0" />{!mini && t('Đăng xuất', 'Log out')}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className={cx('sticky top-0 hidden h-screen shrink-0 border-r border-line bg-surface transition-all lg:block', collapsed ? 'w-[88px]' : 'w-64')}>
        <Side mini={collapsed} />
      </aside>

      {mobile && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobile(false)} />
          <div className="animate-slide-in absolute left-0 top-0 h-full w-64 bg-surface shadow-soft">
            <button onClick={() => setMobile(false)} aria-label="Close" className="absolute right-3 top-4 grid size-9 cursor-pointer place-items-center rounded-full hover:bg-surface2"><X className="size-5" /></button>
            <Side />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobile(true)} aria-label="Menu" className="grid size-10 cursor-pointer place-items-center rounded-full border border-line bg-surface lg:hidden"><Menu className="size-5" /></button>
            <button onClick={() => setCollapsed((v) => !v)} aria-label="Collapse" className="hidden size-10 cursor-pointer place-items-center rounded-full border border-line bg-surface hover:border-primary lg:grid">
              <ChevronsLeft className={cx('size-5 transition', collapsed && 'rotate-180')} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block"><ThemeToggle compact /></div>
            <LangSwitch />
            <div className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3">
              <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-bold text-onprimary">{initials(user?.name)}</span>
              <span className="hidden text-sm font-semibold sm:block">{user?.name}</span>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
