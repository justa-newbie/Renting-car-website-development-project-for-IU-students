import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgePercent, CalendarCheck, CarFront, ChevronDown, Clock, Copy, Headset, KeyRound, MapPinned, ShieldCheck, Star, Wallet } from 'lucide-react'
import Button from '@/components/ui/Button'
import { SectionTitle } from '@/components/ui/misc'
import CarImage from '@/components/CarImage'
import CarCard from '@/components/CarCard'
import SearchBar from '@/components/SearchBar'
import { useDocTitle } from '@/components/Guards'
import { useI18n } from '@/context/I18nContext'
import { useStore } from '@/context/StoreContext'
import { useToast } from '@/context/ToastContext'
import { BRANDS, SEAT_GROUPS } from '@/data/constants'
import { FAQS, TESTIMONIALS } from '@/data/content'
import { cx, fmtDate, money, moneyShort, seatGroup } from '@/lib/format'

export default function Home() {
  const { t, l, lang } = useI18n()
  const { cars, coupons } = useStore()
  const toast = useToast()
  const [faq, setFaq] = useState(0)
  useDocTitle('')

  const featuredIds = ['c4', 'c12', 'c10', 'c9', 'c16', 'c20']
  const featured = featuredIds.map((id) => cars.find((c) => c.id === id)).filter(Boolean)
  const activeCoupons = coupons.filter((c) => c.active && c.expiresAt >= new Date().toISOString().slice(0, 10)).slice(0, 4)

  const minPrice = (g) => {
    const list = cars.filter((c) => seatGroup(c.seats) === g.key)
    return list.length ? Math.min(...list.map((c) => c.pricePerDay)) : 0
  }

  const steps = [
    { icon: MapPinned, title: t('Chọn xe', 'Pick a car'), text: t('Lọc theo loại xe, hãng, giá và thành phố.', 'Filter by type, brand, price and city.') },
    { icon: CalendarCheck, title: t('Đặt lịch', 'Book'), text: t('Chọn ngày, thêm dịch vụ, áp mã giảm giá.', 'Choose dates, add extras, apply coupons.') },
    { icon: KeyRound, title: t('Nhận xe', 'Pick up'), text: t('Nhận xe tại điểm hẹn hoặc giao tận nơi.', 'Pick up at the hub or get it delivered.') },
    { icon: CarFront, title: t('Lên đường', 'Hit the road'), text: t('Trả xe đúng hạn, hoàn cọc trong 24 giờ.', 'Return on time, deposit back in 24h.') },
  ]
  const why = [
    { icon: Wallet, title: t('Giá minh bạch', 'Transparent pricing'), text: t('Giá hiển thị là giá cuối, không phí ẩn.', 'The shown price is final, no hidden fees.') },
    { icon: ShieldCheck, title: t('Bảo hiểm đầy đủ', 'Full insurance'), text: t('Bảo hiểm thân vỏ và cứu hộ 24/7 tùy chọn.', 'Optional collision cover and 24/7 roadside help.') },
    { icon: Clock, title: t('Đặt xe trong 2 phút', 'Book in 2 minutes'), text: t('Quy trình gọn, xác nhận nhanh qua email.', 'Streamlined flow with fast email confirmation.') },
    { icon: BadgePercent, title: t('Ưu đãi sinh viên', 'Student deals'), text: t('Giảm đến 15% cho sinh viên Đại học Quốc tế.', 'Up to 15% off for IU students.') },
    { icon: CarFront, title: t('Đa dạng 4 - 50 chỗ', 'From 4 to 50 seats'), text: t('Từ sedan đến xe khách, đủ mọi nhu cầu.', 'From sedans to coaches, every need covered.') },
    { icon: Headset, title: t('Hỗ trợ 24/7', '24/7 support'), text: t('Hotline luôn sẵn sàng khi bạn cần.', 'Hotline ready whenever you need it.') },
  ]

  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_30%,color-mix(in_srgb,var(--primary)_16%,transparent),transparent)]" />
        <div className="container-x relative grid items-center gap-6 pb-10 pt-10 lg:grid-cols-[1fr_1.1fr] lg:pb-16 lg:pt-16">
          <div className="animate-fade-up relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold">
              <span className="size-2 rounded-full bg-emerald-500" />{t('Hơn 24 dòng xe sẵn sàng hôm nay', '24+ vehicles ready today')}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl">
              {t('Hành trình của bạn,', 'Your journey,')}<br />
              {t('chiếc xe của bạn,', 'your car,')}<br />
              <span className="text-primary">{t('theo cách của bạn', 'your way')}</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted sm:text-lg">
              {t('Thuê xe tự lái hoặc có tài xế từ 4 đến 50 chỗ. Giá rõ ràng, đặt nhanh, hỗ trợ 24/7 trên khắp Hà Nội, TP.HCM, Đà Nẵng và Nha Trang.', 'Self-drive or chauffeured cars from 4 to 50 seats. Clear prices, quick booking, 24/7 support across Hanoi, HCMC, Da Nang and Nha Trang.')}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button as={Link} to="/cars" size="lg">{t('Thuê xe ngay', 'Rent now')}<ArrowRight className="size-4" /></Button>
              <Button as={Link} to="/about" variant="outline" size="lg">{t('Tìm hiểu thêm', 'Learn more')}</Button>
            </div>
            <div className="mt-9 flex gap-8">
              {[[`${cars.length}+`, t('Dòng xe', 'Vehicles')], ['12.5K+', t('Khách hàng', 'Customers')], ['30K+', t('Chuyến đi', 'Trips')]].map(([n, label]) => (
                <div key={label}>
                  <p className="text-2xl font-extrabold">{n}</p>
                  <p className="text-sm text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <p className="ghost-text pointer-events-none absolute inset-x-0 -top-6 select-none overflow-hidden text-center text-[20vw] font-extrabold leading-none lg:text-[8.5rem]">IUDRIVE</p>
            <div className="animate-float relative">
              <CarImage type="suv" color="red" className="relative mx-auto w-full max-w-[640px] drop-shadow-[0_30px_30px_rgba(0,0,0,0.3)]" />
            </div>
            <div className="absolute right-0 top-4 hidden rounded-2xl border border-line bg-surface/90 p-3.5 shadow-soft backdrop-blur sm:block">
              <p className="text-2xl font-extrabold">50+</p>
              <p className="text-xs text-muted">{t('Loại xe có sẵn', 'Car types available')}</p>
            </div>
            <div className="absolute bottom-2 left-0 hidden items-center gap-3 rounded-2xl border border-line bg-surface/90 p-3 shadow-soft backdrop-blur sm:flex">
              <span className="grid size-10 place-items-center rounded-full bg-amber-400/20 text-amber-500"><Star className="size-5 fill-current" /></span>
              <div><p className="text-sm font-bold">4.9 / 5</p><p className="text-xs text-muted">{t('2.300+ đánh giá', '2,300+ reviews')}</p></div>
            </div>
          </div>
        </div>

        <div className="container-x relative z-10 -mt-2 pb-2"><SearchBar /></div>
      </section>

      {/* ---------- HÃNG XE ---------- */}
      <section className="container-x mt-14">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-3xl border border-line bg-surface px-6 py-6">
          {BRANDS.map((b) => (
            <Link key={b} to={`/cars?brand=${encodeURIComponent(b)}`} className="text-lg font-extrabold tracking-tight text-muted/70 transition hover:text-primary">{b}</Link>
          ))}
        </div>
      </section>

      {/* ---------- LOẠI XE ---------- */}
      <section className="container-x mt-24">
        <SectionTitle eyebrow={t('Đội xe', 'Our fleet')} title={t('Chọn xe theo số chỗ', 'Pick a car by seats')} text={t('Từ chuyến đi phố đến đoàn 50 người, luôn có xe phù hợp.', 'From city trips to groups of 50, there is a fit for everyone.')} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SEAT_GROUPS.map((g) => {
            const sample = cars.find((c) => seatGroup(c.seats) === g.key)
            return (
              <Link key={g.key} to={`/cars?seats=${g.key}`} className="group rounded-3xl border border-line bg-surface p-5 transition hover:-translate-y-1 hover:border-primary hover:shadow-soft">
                <h3 className="text-xl font-extrabold">{l(g)}</h3>
                <p className="mt-1 text-xs text-muted">{t(g.hintVi, g.hintEn)}</p>
                <CarImage src={sample?.image} type={sample?.type || g.type} color={sample?.color || 'white'} className="my-4 w-full transition duration-500 group-hover:scale-105" />
                <p className="text-xs text-muted">{t('Từ', 'From')}</p>
                <p className="font-extrabold text-primary">{moneyShort(minPrice(g))}<span className="text-xs font-medium text-muted"> / {t('ngày', 'day')}</span></p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ---------- XE NỔI BẬT ---------- */}
      <section className="container-x mt-24">
        <SectionTitle eyebrow={t('Nổi bật', 'Featured')} title={t('Những chiếc xe được thuê nhiều nhất', 'Most rented cars')} action={<Button as={Link} to="/cars" variant="outline">{t('Xem tất cả xe', 'View all cars')}<ArrowRight className="size-4" /></Button>} align="left" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c, i) => <CarCard key={c.id} car={c} highlight={i === 1} />)}
        </div>
      </section>

      {/* ---------- QUY TRÌNH ---------- */}
      <section className="container-x mt-24">
        <SectionTitle eyebrow={t('Cách thuê', 'How it works')} title={t('4 bước đơn giản để có xe', '4 simple steps to get your car')} />
        <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-9 hidden border-t-2 border-dashed border-line lg:block" />
          {steps.map((s, i) => (
            <div key={i} className="relative text-center">
              <div className={cx('relative mx-auto grid size-[72px] place-items-center rounded-3xl border', i === 1 ? 'border-primary bg-primary text-onprimary shadow-[0_12px_30px_-10px_var(--primary)]' : 'border-line bg-surface')}>
                <s.icon className="size-7" />
                <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-fg text-xs font-bold text-bg">{i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mx-auto mt-1 max-w-[220px] text-sm text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- VÌ SAO CHỌN ---------- */}
      <section className="container-x mt-24">
        <SectionTitle eyebrow={t('Vì sao chọn IUDrive', 'Why IUDrive')} title={t('Thuê xe an tâm từ đầu đến cuối', 'Worry-free rentals from start to finish')} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {why.map((w) => (
            <div key={w.title} className="rounded-3xl border border-line bg-surface p-6 transition hover:border-primary/60">
              <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary"><w.icon className="size-6" /></span>
              <h3 className="mt-4 text-lg font-bold">{w.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- KHUYẾN MÃI ---------- */}
      {activeCoupons.length > 0 && (
        <section className="container-x mt-24">
          <SectionTitle eyebrow={t('Ưu đãi', 'Offers')} title={t('Mã giảm giá đang áp dụng', 'Active promo codes')} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {activeCoupons.map((c) => (
              <div key={c.id} className="relative overflow-hidden rounded-3xl border border-dashed border-primary/60 bg-primary-soft p-5">
                <BadgePercent className="absolute -right-3 -top-3 size-20 text-primary/10" />
                <p className="text-2xl font-extrabold text-primary">{c.type === 'percent' ? `-${c.value}%` : `-${moneyShort(c.value)}`}</p>
                <p className="mt-1 min-h-10 text-sm">{lang === 'vi' ? c.descVi : c.descEn}</p>
                <p className="mt-2 text-xs text-muted">{t('Hạn dùng', 'Valid until')} {fmtDate(c.expiresAt, lang)}</p>
                <button
                  onClick={() => { navigator.clipboard?.writeText(c.code); toast(t(`Đã sao chép mã ${c.code}`, `Copied code ${c.code}`)) }}
                  className="mt-4 flex w-full cursor-pointer items-center justify-between rounded-full bg-surface px-4 py-2.5 text-sm font-bold tracking-wider hover:bg-bg"
                >
                  {c.code}<Copy className="size-4 text-muted" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- ĐÁNH GIÁ ---------- */}
      <section className="container-x mt-24">
        <SectionTitle eyebrow={t('Khách hàng nói gì', 'Testimonials')} title={t('Được tin tưởng bởi hàng nghìn khách', 'Trusted by thousands of riders')} />
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((x) => (
            <figure key={x.name} className="rounded-3xl border border-line bg-surface p-6">
              <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={cx('size-4', i <= x.rating ? 'fill-amber-400 text-amber-400' : 'text-line')} />)}</div>
              <blockquote className="mt-4 text-[15px] leading-relaxed">“{l(x.text)}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-primary text-sm font-bold text-onprimary">{x.name.split(' ').slice(-1)[0][0]}</span>
                <span><span className="block text-sm font-bold">{x.name}</span><span className="text-xs text-muted">{l(x.role)}</span></span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="container-x mt-24 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">FAQ</p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('Câu hỏi thường gặp', 'Frequently asked questions')}</h2>
          <p className="mt-3 text-muted">{t('Không thấy câu trả lời bạn cần? Liên hệ chúng tôi bất cứ lúc nào.', 'Cannot find your answer? Contact us anytime.')}</p>
          <Button as={Link} to="/faq" variant="outline" className="mt-6">{t('Xem tất cả', 'See all')}<ArrowRight className="size-4" /></Button>
        </div>
        <div className="space-y-3">
          {FAQS.slice(0, 4).map((f, i) => (
            <div key={i} className="rounded-2xl border border-line bg-surface">
              <button onClick={() => setFaq(faq === i ? -1 : i)} className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left font-semibold">
                {l(f.q)}<ChevronDown className={cx('size-5 shrink-0 text-muted transition', faq === i && 'rotate-180 text-primary')} />
              </button>
              {faq === i && <p className="animate-fade-up px-5 pb-5 text-sm leading-relaxed text-muted">{l(f.a)}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="container-x mt-24">
        <div className="relative overflow-hidden rounded-[32px] bg-primary px-6 py-14 text-center text-onprimary sm:px-12">
          <CarImage type="sedan" color="white" className="absolute -bottom-6 -left-10 w-72 opacity-15" />
          <CarImage type="bus" color="white" className="absolute -right-10 -top-4 w-80 opacity-15" flip />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">{t('Sẵn sàng cho chuyến đi tiếp theo?', 'Ready for your next trip?')}</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/85">{t('Khám phá đội xe và đặt chiếc xe mơ ước của bạn ngay hôm nay.', 'Explore the fleet and book your dream car today.')}</p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Button as={Link} to="/cars" variant="dark" size="lg">{t('Xem đội xe', 'Browse cars')}</Button>
            <Button as={Link} to="/contact" size="lg" className="!bg-white/15 !shadow-none hover:!bg-white/25">{t('Liên hệ tư vấn', 'Talk to us')}</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
