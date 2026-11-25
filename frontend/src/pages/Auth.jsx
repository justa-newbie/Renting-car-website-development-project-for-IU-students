import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import CarImage from '@/components/CarImage'
import Logo from '@/components/Logo'
import { useDocTitle } from '@/components/Guards'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/context/I18nContext'
import { useToast } from '@/context/ToastContext'

function Shell({ title, subtitle, children, footer }) {
  const { t } = useI18n()
  return (
    <div className="container-x py-10">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[32px] border border-line bg-surface shadow-soft lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between bg-primary p-10 text-onprimary lg:flex">
          <Logo className="[&_span]:!text-white [&>span:first-child]:!bg-white/20" />
          <div>
            <h2 className="text-3xl font-extrabold leading-tight">{t('Thuê xe nhanh, giá minh bạch.', 'Fast rentals, transparent prices.')}</h2>
            <p className="mt-3 max-w-xs text-white/80">{t('Đăng nhập để đặt xe, theo dõi đơn thuê và nhận ưu đãi sinh viên.', 'Log in to book, track your rentals and unlock student deals.')}</p>
          </div>
          <CarImage type="suv" color="white" className="w-full drop-shadow-2xl" />
        </div>
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
          <div className="mt-7">{children}</div>
          <p className="mt-6 text-center text-sm text-muted">{footer}</p>
        </div>
      </div>
    </div>
  )
}

const PasswordInput = ({ label, error, value, onChange, autoComplete }) => {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input label={label} error={error} icon={Lock} type={show ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} className="pr-11" />
      <button type="button" onClick={() => setShow((v) => !v)} aria-label="toggle" className={`absolute right-3 cursor-pointer text-muted hover:text-fg ${error ? 'top-[38px]' : 'top-[38px]'}`}>
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

export function Login() {
  const { t } = useI18n()
  const { user, login } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const loc = useLocation()
  const [f, setF] = useState({ email: '', password: '' })
  const [err, setErr] = useState({})
  useDocTitle(t('Đăng nhập', 'Log in'))

  if (user) return <Navigate to={loc.state?.from || (user.role === 'admin' ? '/admin' : '/')} replace />

  const submit = (e) => {
    e.preventDefault()
    const x = {}
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = t('Email chưa hợp lệ', 'Invalid email')
    if (!f.password) x.password = t('Nhập mật khẩu', 'Enter your password')
    setErr(x)
    if (Object.keys(x).length) return
    const r = login(f.email, f.password)
    if (!r.ok) {
      setErr({ password: r.error === 'blocked' ? t('Tài khoản đã bị khóa. Liên hệ hỗ trợ.', 'Account is blocked. Contact support.') : t('Email hoặc mật khẩu không đúng', 'Wrong email or password') })
      return
    }
    toast(t(`Xin chào, ${r.user.name}!`, `Welcome, ${r.user.name}!`))
    nav(loc.state?.from || (r.user.role === 'admin' ? '/admin' : '/'), { replace: true })
  }

  const fill = (email, password) => setF({ email, password })

  return (
    <Shell title={t('Đăng nhập', 'Log in')} subtitle={t('Chào mừng bạn quay lại IUDrive.', 'Welcome back to IUDrive.')} footer={<>{t('Chưa có tài khoản?', 'No account yet?')} <Link to="/register" className="font-bold text-primary hover:underline">{t('Đăng ký ngay', 'Sign up')}</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input label="Email" icon={Mail} type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={err.email} />
        <PasswordInput label={t('Mật khẩu', 'Password')} autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} error={err.password} />
        <Button type="submit" size="lg" className="w-full">{t('Đăng nhập', 'Log in')}</Button>
      </form>
      <div className="mt-6 rounded-2xl bg-surface2 p-4 text-xs text-muted">
        <p className="mb-2 font-bold text-fg">{t('Tài khoản dùng thử (dữ liệu giả lập)', 'Demo accounts (mock data)')}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => fill('user@demo.com', 'user123')} className="cursor-pointer rounded-full bg-surface px-3 py-1.5 font-semibold hover:text-primary">{t('Khách hàng', 'Customer')}: user@demo.com</button>
          <button type="button" onClick={() => fill('admin@iudrive.vn', 'admin123')} className="cursor-pointer rounded-full bg-surface px-3 py-1.5 font-semibold hover:text-primary">Admin: admin@iudrive.vn</button>
        </div>
      </div>
    </Shell>
  )
}

export function Register() {
  const { t } = useI18n()
  const { user, register } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [err, setErr] = useState({})
  useDocTitle(t('Đăng ký', 'Sign up'))
  if (user) return <Navigate to="/" replace />
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const x = {}
    if (f.name.trim().length < 2) x.name = t('Nhập họ tên', 'Enter your name')
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = t('Email chưa hợp lệ', 'Invalid email')
    if (!/^(0|\+84)\d{9,10}$/.test(f.phone.replace(/\s/g, ''))) x.phone = t('Số điện thoại chưa hợp lệ', 'Invalid phone number')
    if (f.password.length < 6) x.password = t('Mật khẩu ít nhất 6 ký tự', 'At least 6 characters')
    if (f.confirm !== f.password) x.confirm = t('Mật khẩu nhập lại không khớp', 'Passwords do not match')
    setErr(x)
    if (Object.keys(x).length) return
    const r = register(f)
    if (!r.ok) return setErr({ email: t('Email này đã được đăng ký', 'This email is already registered') })
    toast(t('Tạo tài khoản thành công!', 'Account created!'))
    nav('/', { replace: true })
  }

  return (
    <Shell title={t('Tạo tài khoản', 'Create account')} subtitle={t('Đăng ký miễn phí và nhận mã giảm giá cho lần thuê đầu tiên.', 'Sign up free and get a promo for your first rental.')} footer={<>{t('Đã có tài khoản?', 'Already have an account?')} <Link to="/login" className="font-bold text-primary hover:underline">{t('Đăng nhập', 'Log in')}</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input label={t('Họ và tên', 'Full name')} icon={User} value={f.name} onChange={set('name')} error={err.name} autoComplete="name" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Email" icon={Mail} type="email" value={f.email} onChange={set('email')} error={err.email} autoComplete="email" />
          <Input label={t('Số điện thoại', 'Phone')} icon={Phone} value={f.phone} onChange={set('phone')} error={err.phone} autoComplete="tel" />
        </div>
        <PasswordInput label={t('Mật khẩu', 'Password')} value={f.password} onChange={set('password')} error={err.password} autoComplete="new-password" />
        <PasswordInput label={t('Nhập lại mật khẩu', 'Confirm password')} value={f.confirm} onChange={set('confirm')} error={err.confirm} autoComplete="new-password" />
        <Button type="submit" size="lg" className="w-full">{t('Đăng ký', 'Sign up')}</Button>
      </form>
    </Shell>
  )
}
