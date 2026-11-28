import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { CalendarCheck, ChevronDown, Heart, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react'
import Logo from './Logo'
import Button from './ui/Button'
import { LangSwitch, ThemeToggle } from './Toggles'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/context/I18nContext'
import { useStore } from '@/context/StoreContext'
import { cx, initials } from '@/lib/format'

export default function Navbar() {
  const { t } = useI18n()
  const { user, isAdmin, logout } = useAuth()
  const { favorites } = useStore()
  const nav = useNavigate()
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    setOpen(false)
    setMenu(false)
  }, [loc.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setMenu(false)
    document.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('mousedown', onClick)
    }
  }, [])

  const links = [
    { to: '/', label: t('Trang chủ', 'Home'), end: true },
    { to: '/cars', label: t('Thuê xe', 'Rent a car') },
    { to: '/about', label: t('Giới thiệu', 'About') },
    { to: '/faq', label: t('Hỏi đáp', 'FAQ') },
    { to: '/contact', label: t('Liên hệ', 'Contact') },
  ]
  const linkCls = ({ isActive }) =>
    cx('rounded-full px-4 py-2 text-sm font-semibold transition', isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:text-fg')

  return (
    <header className={cx('sticky top-0 z-50 border-b transition', scrolled ? 'border-line bg-bg/85 backdrop-blur-xl' : 'border-transparent bg-bg')}>
      <div className="container-x flex h-[72px] items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>{l.label}</NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle compact />
            <LangSwitch />
          </div>
          <Link to="/account/favorites" aria-label={t('Yêu thích', 'Favorites')} className="relative grid size-10 place-items-center rounded-full border border-line bg-surface hover:border-primary">
            <Heart className="size-[18px]" />
            {favorites.length > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-onprimary">{favorites.length}</span>}
          </Link>

          {user ? (
            <div className="relative" ref={ref}>
              <button onClick={() => setMenu((v) => !v)} className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 hover:border-primary">
                <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-bold text-onprimary">{initials(user.name)}</span>
                <span className="hidden max-w-28 truncate text-sm font-semibold sm:block">{user.name}</span>
                <ChevronDown className="size-4 text-muted" />
              </button>
              {menu && (
                <div className="animate-pop absolute right-0 mt-2 w-56 rounded-2xl border border-line bg-surface p-2 shadow-soft">
                  {isAdmin && <MenuItem to="/admin" icon={LayoutDashboard} label={t('Trang quản trị', 'Admin panel')} />}
                  <MenuItem to="/account" icon={User} label={t('Hồ sơ của tôi', 'My profile')} />
                  <MenuItem to="/account/bookings" icon={CalendarCheck} label={t('Đơn thuê của tôi', 'My bookings')} />
                  <MenuItem to="/account/favorites" icon={Heart} label={t('Xe yêu thích', 'Favorites')} />
                  <button onClick={() => { logout(); nav('/') }} className="mt-1 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-surface2">
                    <LogOut className="size-4" />{t('Đăng xuất', 'Log out')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button as={Link} to="/login" variant="ghost" size="sm">{t('Đăng nhập', 'Log in')}</Button>
              <Button as={Link} to="/register" size="sm">{t('Đăng ký', 'Sign up')}</Button>
            </div>
          )}
          <button onClick={() => setOpen(true)} aria-label="Menu" className="grid size-10 cursor-pointer place-items-center rounded-full border border-line bg-surface lg:hidden">
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="animate-slide-in absolute right-0 top-0 flex h-full w-[min(86vw,340px)] flex-col gap-2 bg-surface p-5 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <Logo />
              <button onClick={() => setOpen(false)} aria-label="Close" className="grid size-10 cursor-pointer place-items-center rounded-full hover:bg-surface2"><X className="size-5" /></button>
            </div>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => cx('rounded-2xl px-4 py-3 font-semibold', isActive ? 'bg-primary-soft text-primary' : 'hover:bg-surface2')}>{l.label}</NavLink>
            ))}
            <div className="mt-auto space-y-3 border-t border-line pt-4">
              <div className="flex flex-wrap gap-2"><ThemeToggle /><LangSwitch /></div>
              {!user && (
                <div className="flex gap-2">
                  <Button as={Link} to="/login" variant="outline" className="flex-1">{t('Đăng nhập', 'Log in')}</Button>
                  <Button as={Link} to="/register" className="flex-1">{t('Đăng ký', 'Sign up')}</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function MenuItem({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-surface2">
      <Icon className="size-4 text-muted" />{label}
    </Link>
  )
}
