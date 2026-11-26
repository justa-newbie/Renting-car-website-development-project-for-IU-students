import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Clock, Handshake, Mail, MapPin, Phone, Send, Target, Users2, Award, Heart } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { SectionTitle } from '@/components/ui/misc'
import CarImage from '@/components/CarImage'
import { useDocTitle } from '@/components/Guards'
import { useI18n } from '@/context/I18nContext'
import { useToast } from '@/context/ToastContext'
import { CONTACT } from '@/data/constants'
import imageCredits from '@/data/imageCredits.json'
import { useStore } from '@/context/StoreContext'
import { FAQS } from '@/data/content'
import { cx } from '@/lib/format'

export function About() {
  const { t } = useI18n()
  useDocTitle(t('Giới thiệu', 'About'))
  const values = [
    { icon: Target, title: t('Sứ mệnh', 'Mission'), text: t('Giúp việc thuê xe trở nên đơn giản, minh bạch và an toàn cho mọi người, đặc biệt là sinh viên.', 'Make renting a car simple, transparent and safe for everyone, especially students.') },
    { icon: Award, title: t('Chất lượng', 'Quality'), text: t('Mọi xe đều được kiểm định, bảo dưỡng định kỳ và vệ sinh trước mỗi chuyến.', 'Every car is inspected, serviced and cleaned before each trip.') },
    { icon: Heart, title: t('Tận tâm', 'Care'), text: t('Đội ngũ hỗ trợ 24/7 và tài xế được đào tạo bài bản.', '24/7 support and professionally trained drivers.') },
    { icon: Handshake, title: t('Đối tác', 'Partners'), text: t('Kết nối chủ xe và người thuê, tạo thu nhập cho cộng đồng.', 'Connecting owners and renters to create income for the community.') },
  ]
  const team = [
    ['Nguyễn Minh Anh', t('Trưởng nhóm / Backend', 'Team lead / Backend')],
    ['Trần Quốc Bảo', t('Backend', 'Backend')],
    ['Bạn (Frontend)', t('Frontend / UI-UX', 'Frontend / UI-UX')],
    ['Lê Thị Hạnh', t('Kiểm thử / Tài liệu', 'QA / Docs')],
  ]
  return (
    <div className="container-x py-12">
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">{t('Về chúng tôi', 'About us')}</p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{t('Tiên phong thuê xe thông minh cho sinh viên', 'Pioneering smart car rental for students')}</h1>
          <p className="mt-5 leading-relaxed text-muted">{t('IUDrive bắt đầu từ một đồ án của sinh viên Đại học Quốc tế với mong muốn giải quyết bài toán đi lại: thuê xe nhanh, giá rõ ràng, không phải gọi hỏi nhiều nơi. Từ xe 4 chỗ cho nhóm bạn đến xe 45 chỗ cho cả lớp đi tham quan, chúng tôi có đủ.', 'IUDrive started as a course project by International University students to solve a simple problem: rent a car fast, with clear prices and no endless phone calls. From 4-seaters for friends to 45-seaters for a whole class trip, we have it all.')}</p>
          <div className="mt-7 flex gap-3"><Button as={Link} to="/cars">{t('Khám phá đội xe', 'Explore the fleet')}</Button><Button as={Link} to="/contact" variant="outline">{t('Liên hệ', 'Contact')}</Button></div>
        </div>
        <div className="rounded-[32px] bg-gradient-to-br from-primary-soft to-surface2 p-8">
          <CarImage type="sedan" color="red" className="w-full drop-shadow-2xl" />
        </div>
      </section>

      <section className="mt-20">
        <SectionTitle eyebrow={t('Giá trị cốt lõi', 'Core values')} title={t('Điều chúng tôi theo đuổi', 'What we stand for')} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-3xl border border-line bg-surface p-6">
              <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary"><v.icon className="size-6" /></span>
              <h3 className="mt-4 text-lg font-bold">{v.title}</h3><p className="mt-1.5 text-sm text-muted">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 grid gap-4 rounded-[32px] bg-fg p-8 text-bg sm:grid-cols-2 lg:grid-cols-4">
        {[['24+', t('Dòng xe', 'Vehicles')], ['4', t('Thành phố', 'Cities')], ['12.5K+', t('Khách hàng', 'Customers')], ['4.9/5', t('Đánh giá', 'Rating')]].map(([n, l]) => (
          <div key={l} className="text-center"><p className="text-4xl font-extrabold">{n}</p><p className="mt-1 text-sm opacity-70">{l}</p></div>
        ))}
      </section>

      <section className="mt-20">
        <SectionTitle eyebrow={t('Đội ngũ', 'Team')} title={t('Những người xây dựng IUDrive', 'The people behind IUDrive')} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {team.map(([n, r]) => (
            <div key={n} className="rounded-3xl border border-line bg-surface p-6 text-center">
              <span className="mx-auto grid size-20 place-items-center rounded-full bg-primary text-2xl font-extrabold text-onprimary"><Users2 className="size-8" /></span>
              <p className="mt-4 font-bold">{n}</p><p className="text-sm text-muted">{r}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export function Faq() {
  const { t, l } = useI18n()
  const [open, setOpen] = useState(0)
  useDocTitle(t('Hỏi đáp', 'FAQ'))
  return (
    <div className="container-x py-12">
      <div className="mx-auto max-w-3xl">
        <SectionTitle eyebrow="FAQ" title={t('Câu hỏi thường gặp', 'Frequently asked questions')} text={t('Mọi thứ bạn cần biết trước khi thuê xe.', 'Everything you need to know before renting.')} />
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className="rounded-2xl border border-line bg-surface">
              <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left font-semibold">
                {l(f.q)}<ChevronDown className={cx('size-5 shrink-0 text-muted transition', open === i && 'rotate-180 text-primary')} />
              </button>
              {open === i && <p className="animate-fade-up px-5 pb-5 text-sm leading-relaxed text-muted">{l(f.a)}</p>}
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-3xl bg-primary-soft p-6 text-center">
          <p className="font-bold">{t('Vẫn chưa tìm thấy câu trả lời?', 'Still need help?')}</p>
          <Button as={Link} to="/contact" className="mt-4">{t('Liên hệ chúng tôi', 'Contact us')}</Button>
        </div>
      </div>
    </div>
  )
}

export function Contact() {
  const { t, l } = useI18n()
  const toast = useToast()
  const [f, setF] = useState({ name: '', email: '', phone: '', topic: 'support', message: '' })
  const [err, setErr] = useState({})
  useDocTitle(t('Liên hệ', 'Contact'))
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const x = {}
    if (f.name.trim().length < 2) x.name = t('Nhập họ tên', 'Enter your name')
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = t('Email chưa hợp lệ', 'Invalid email')
    if (f.message.trim().length < 10) x.message = t('Nội dung ít nhất 10 ký tự', 'At least 10 characters')
    setErr(x)
    if (Object.keys(x).length) return
    toast(t('Đã gửi! Chúng tôi sẽ phản hồi trong 24 giờ.', 'Sent! We will reply within 24 hours.'))
    setF({ name: '', email: '', phone: '', topic: 'support', message: '' })
  }

  const info = [
    [Phone, t('Hotline 24/7', '24/7 hotline'), CONTACT.hotline],
    [Mail, 'Email', CONTACT.email],
    [MapPin, t('Địa chỉ', 'Address'), l(CONTACT.address)],
    [Clock, t('Giờ làm việc', 'Opening hours'), t('Thứ 2 - Chủ nhật, 6:00 - 22:00', 'Mon - Sun, 6:00 - 22:00')],
  ]
  return (
    <div className="container-x py-12">
      <SectionTitle eyebrow={t('Liên hệ', 'Contact')} title={t('Chúng tôi luôn sẵn sàng hỗ trợ', 'We are here to help')} text={t('Cần tư vấn thuê xe, báo giá đoàn hay muốn trở thành đối tác? Hãy nhắn cho chúng tôi.', 'Need advice, a group quote, or want to become a partner? Drop us a message.')} />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          {info.map(([I, label, value]) => (
            <div key={label} className="flex items-center gap-4 rounded-3xl border border-line bg-surface p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary"><I className="size-5" /></span>
              <div><p className="text-xs text-muted">{label}</p><p className="font-bold">{value}</p></div>
            </div>
          ))}
          <div className="grid h-44 place-items-center rounded-3xl border border-line bg-surface2 text-center text-sm text-muted"><div><MapPin className="mx-auto mb-2 size-7 text-primary" />{t('Bản đồ (sẽ nhúng Google Maps khi triển khai)', 'Map (Google Maps embed on deployment)')}</div></div>
        </div>

        <form onSubmit={submit} noValidate className="rounded-[28px] border border-line bg-surface p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={t('Họ và tên', 'Full name')} value={f.name} onChange={set('name')} error={err.name} />
            <Input label="Email" type="email" value={f.email} onChange={set('email')} error={err.email} />
            <Input label={t('Số điện thoại', 'Phone')} value={f.phone} onChange={set('phone')} />
            <Select label={t('Chủ đề', 'Topic')} value={f.topic} onChange={set('topic')}>
              <option value="support">{t('Hỗ trợ đơn thuê', 'Booking support')}</option>
              <option value="group">{t('Báo giá đoàn / sự kiện', 'Group / event quote')}</option>
              <option value="partner">{t('Trở thành đối tác', 'Become a partner')}</option>
              <option value="other">{t('Khác', 'Other')}</option>
            </Select>
          </div>
          <Textarea wrapClass="mt-4" label={t('Nội dung', 'Message')} value={f.message} onChange={set('message')} error={err.message} className="min-h-32" />
          <Button type="submit" size="lg" className="mt-5 w-full sm:w-auto"><Send className="size-4" />{t('Gửi tin nhắn', 'Send message')}</Button>
        </form>
      </div>
    </div>
  )
}

export function Credits() {
  const { t } = useI18n()
  const { cars } = useStore()
  useDocTitle(t('Nguồn ảnh', 'Image credits'))
  const rows = Object.entries(imageCredits)
  return (
    <div className="container-x py-12">
      <div className="mx-auto max-w-4xl">
        <SectionTitle eyebrow={t('Nguồn ảnh', 'Credits')} title={t('Ghi nguồn ảnh xe', 'Vehicle photo credits')} text={t('Ảnh minh họa lấy từ Wikimedia Commons theo giấy phép mở (CC BY-SA 4.0 / CC0). Ảnh chỉ mang tính minh họa, có thể không đúng đời xe hoặc xe thực tế cho thuê.', 'Illustrative photos from Wikimedia Commons under open licences (CC BY-SA 4.0 / CC0). They may not match the exact model year or the actual rental vehicle.')} />
        <div className="overflow-x-auto rounded-3xl border border-line bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead><tr className="border-b border-line bg-surface2/60 text-xs uppercase tracking-wider text-muted"><th className="px-4 py-3">{t('Xe', 'Car')}</th><th className="px-4 py-3">{t('Tác giả', 'Author')}</th><th className="px-4 py-3">{t('Giấy phép', 'Licence')}</th><th className="px-4 py-3">{t('Nguồn', 'Source')}</th></tr></thead>
            <tbody className="divide-y divide-line">
              {rows.map(([id, c]) => {
                const car = cars.find((x) => x.id === id)
                const hero = id.startsWith('hero_')
                return (
                  <tr key={id}>
                    <td className="px-4 py-3 font-semibold">{hero ? `${t('Banner', 'Banner')}: ${c.file.split(/[ .]/).slice(0, 3).join(' ')}` : car ? `${car.brand} ${car.model}` : id}{c.edited && <span className="ml-2 rounded-full bg-surface2 px-2 py-0.5 text-[11px] font-medium text-muted">{t('đã tách nền', 'background removed')}</span>}</td>
                    <td className="px-4 py-3">{c.artist}</td>
                    <td className="px-4 py-3">{c.license}</td>
                    <td className="px-4 py-3"><a href={c.page} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">Wikimedia Commons</a></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function NotFound() {
  const { t } = useI18n()
  useDocTitle('404')
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <CarImage type="sedan" color="grey" className="mx-auto w-72 opacity-70 grayscale" />
        <p className="mt-6 text-7xl font-extrabold text-primary">404</p>
        <h1 className="mt-2 text-2xl font-extrabold">{t('Ôi, xe đi lạc đường rồi!', 'Oops, this car took a wrong turn!')}</h1>
        <p className="mt-2 text-muted">{t('Trang bạn tìm không tồn tại hoặc đã được di chuyển.', 'The page you are looking for does not exist.')}</p>
        <Button as={Link} to="/" className="mt-6">{t('Về trang chủ', 'Back home')}</Button>
      </div>
    </div>
  )
}
