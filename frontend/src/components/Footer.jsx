import { Link } from 'react-router-dom'
import { Globe, Mail, MapPin, MessageCircle, Phone, Send, Share2 } from 'lucide-react'
import Logo from './Logo'
import { useI18n } from '@/context/I18nContext'
import { useToast } from '@/context/ToastContext'
import { CONTACT, SEAT_GROUPS } from '@/data/constants'
import { useState } from 'react'

export default function Footer() {
  const { t, l } = useI18n()
  const toast = useToast()
  const [email, setEmail] = useState('')

  const subscribe = (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast(t('Email chưa hợp lệ', 'Invalid email'), 'error')
    toast(t('Đã đăng ký nhận ưu đãi. Cảm ơn bạn!', 'Subscribed. Thank you!'))
    setEmail('')
  }

  const col = 'text-sm text-muted transition hover:text-primary'
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">
            {t('Nền tảng thuê xe tự lái và có tài xế dành cho sinh viên, gia đình và doanh nghiệp. Minh bạch giá, đặt xe trong 2 phút.', 'Self-drive and chauffeur car rental for students, families and businesses. Transparent pricing, book in 2 minutes.')}
          </p>
          <div className="mt-5 flex gap-2">
            {[Globe, Share2, MessageCircle].map((I, i) => (
              <a key={i} href="#" onClick={(e) => e.preventDefault()} aria-label="social" className="grid size-10 place-items-center rounded-full border border-line text-muted transition hover:border-primary hover:text-primary">
                <I className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-bold">{t('Loại xe', 'Vehicles')}</h4>
          <ul className="space-y-2.5">
            {SEAT_GROUPS.map((g) => (
              <li key={g.key}><Link className={col} to={`/cars?seats=${g.key}`}>{t('Thuê xe ', 'Rent ')}{l(g)}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-bold">{t('Hỗ trợ', 'Support')}</h4>
          <ul className="space-y-2.5">
            <li><Link className={col} to="/about">{t('Về IUDrive', 'About IUDrive')}</Link></li>
            <li><Link className={col} to="/faq">{t('Câu hỏi thường gặp', 'FAQ')}</Link></li>
            <li><Link className={col} to="/contact">{t('Liên hệ', 'Contact')}</Link></li>
            <li><Link className={col} to="/account/bookings">{t('Tra cứu đơn thuê', 'My bookings')}</Link></li>
            <li><Link className={col} to="/contact">{t('Trở thành đối tác', 'Become a partner')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-bold">{t('Nhận ưu đãi', 'Get offers')}</h4>
          <form onSubmit={subscribe} className="flex gap-2">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" className="h-11 min-w-0 flex-1 rounded-full border border-line bg-bg px-4 text-sm outline-none focus:border-primary" />
            <button className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-primary text-onprimary hover:bg-primary-hover" aria-label="Subscribe"><Send className="size-4" /></button>
          </form>
          <ul className="mt-5 space-y-2.5 text-sm text-muted">
            <li className="flex items-center gap-2"><Phone className="size-4 text-primary" />{CONTACT.hotline}</li>
            <li className="flex items-center gap-2"><Mail className="size-4 text-primary" />{CONTACT.email}</li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-primary" />{l(CONTACT.address)}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} IUDrive. {t('Đồ án môn học - Sinh viên Đại học Quốc tế.', 'Course project - International University students.')}</p>
          <p>{t('Điều khoản sử dụng · Chính sách bảo mật', 'Terms · Privacy policy')} · <Link to="/credits" className="hover:text-primary">{t('Nguồn ảnh', 'Photo credits')}</Link></p>
        </div>
      </div>
    </footer>
  )
}
