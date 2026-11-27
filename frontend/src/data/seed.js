// Dữ liệu mẫu (mock). Khi BE Spring Boot sẵn sàng, thay phần này bằng lời gọi API thật.
import { addDays, todayISO } from '@/lib/format'
import { computeQuote } from '@/lib/pricing'

// Bộ sinh số ngẫu nhiên cố định để dữ liệu mẫu luôn giống nhau
function rng(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// [hãng, mẫu, năm, số chỗ, kiểu thân, màu, nhiên liệu, hộp số, giá/ngày, thành phố, tính năng]
const CAR_ROWS = [
  ['Toyota', 'Vios', 2023, 4, 'sedan', 'white', 'gasoline', 'auto', 650000, 'Hà Nội', ['bluetooth', 'camera', 'airbag', 'usb']],
  ['Hyundai', 'Accent', 2023, 4, 'sedan', 'red', 'gasoline', 'auto', 620000, 'TP. Hồ Chí Minh', ['bluetooth', 'camera', 'airbag', 'usb', 'sensor']],
  ['Kia', 'K3', 2022, 4, 'sedan', 'silver', 'gasoline', 'auto', 720000, 'Đà Nẵng', ['bluetooth', 'camera', 'sunroof', 'cruise', 'airbag']],
  ['Mazda', 'Mazda3', 2023, 4, 'sedan', 'navy', 'gasoline', 'auto', 820000, 'Hà Nội', ['bluetooth', 'camera', 'sunroof', 'cruise', 'sensor', 'airbag']],
  ['Honda', 'City', 2023, 4, 'sedan', 'black', 'gasoline', 'auto', 740000, 'TP. Hồ Chí Minh', ['bluetooth', 'camera', 'cruise', 'airbag', 'usb']],
  ['VinFast', 'VF 5 Plus', 2024, 4, 'suv', 'blue', 'electric', 'auto', 560000, 'Hà Nội', ['bluetooth', 'camera', 'airbag', 'usb', 'gps']],
  ['VinFast', 'VF 6', 2024, 4, 'suv', 'grey', 'electric', 'auto', 850000, 'TP. Hồ Chí Minh', ['bluetooth', 'camera', 'sunroof', 'cruise', 'sensor', 'gps']],
  ['Kia', 'Morning', 2022, 4, 'sedan', 'white', 'gasoline', 'manual', 450000, 'Nha Trang', ['bluetooth', 'usb', 'airbag']],
  ['Mitsubishi', 'Xpander', 2023, 7, 'mpv', 'silver', 'gasoline', 'auto', 920000, 'TP. Hồ Chí Minh', ['bluetooth', 'camera', 'ac_rear', 'airbag', 'usb']],
  ['Toyota', 'Innova Cross', 2023, 7, 'mpv', 'white', 'gasoline', 'auto', 1150000, 'Hà Nội', ['bluetooth', 'camera', 'ac_rear', 'cruise', 'sensor', 'airbag']],
  ['Toyota', 'Fortuner', 2023, 7, 'suv', 'black', 'diesel', 'auto', 1500000, 'TP. Hồ Chí Minh', ['bluetooth', 'camera', 'ac_rear', 'cruise', 'sensor', 'sunroof']],
  ['VinFast', 'VF 8', 2024, 7, 'suv', 'red', 'electric', 'auto', 1250000, 'Hà Nội', ['bluetooth', 'camera', 'sunroof', 'cruise', 'sensor', 'gps', 'dashcam']],
  ['Kia', 'Carnival', 2023, 7, 'mpv', 'navy', 'diesel', 'auto', 2000000, 'Hà Nội', ['bluetooth', 'camera', 'ac_rear', 'sunroof', 'cruise', 'sensor', 'tv']],
  ['Hyundai', 'Santa Fe', 2023, 7, 'suv', 'brown', 'diesel', 'auto', 1400000, 'Đà Nẵng', ['bluetooth', 'camera', 'sunroof', 'cruise', 'sensor', 'ac_rear']],
  ['Ford', 'Transit', 2022, 16, 'van', 'white', 'diesel', 'manual', 1800000, 'Hà Nội', ['bluetooth', 'ac_rear', 'mic', 'luggage', 'usb']],
  ['Hyundai', 'Solati', 2023, 16, 'van', 'silver', 'diesel', 'manual', 2200000, 'TP. Hồ Chí Minh', ['bluetooth', 'ac_rear', 'mic', 'luggage', 'usb', 'camera']],
  ['Mercedes-Benz', 'Sprinter', 2023, 16, 'van', 'black', 'diesel', 'auto', 2800000, 'Đà Nẵng', ['bluetooth', 'ac_rear', 'recline', 'tv', 'wifi', 'luggage', 'camera']],
  ['Hyundai', 'County', 2022, 29, 'minibus', 'white', 'diesel', 'manual', 3500000, 'Hà Nội', ['ac_rear', 'mic', 'luggage', 'tv']],
  ['Samco', 'Felix', 2023, 29, 'minibus', 'silver', 'diesel', 'manual', 3800000, 'TP. Hồ Chí Minh', ['ac_rear', 'mic', 'luggage', 'tv', 'recline']],
  ['Hyundai', 'County Limousine', 2023, 29, 'minibus', 'navy', 'diesel', 'manual', 4500000, 'Đà Nẵng', ['ac_rear', 'recline', 'tv', 'wifi', 'luggage', 'mic']],
  ['Hyundai', 'Universe', 2022, 45, 'bus', 'white', 'diesel', 'manual', 5500000, 'Hà Nội', ['ac_rear', 'mic', 'luggage', 'tv', 'recline']],
  ['Thaco', 'TB120S', 2023, 45, 'bus', 'blue', 'diesel', 'manual', 6000000, 'TP. Hồ Chí Minh', ['ac_rear', 'mic', 'luggage', 'tv', 'recline', 'wifi']],
  ['Samco', 'Primas', 2023, 45, 'bus', 'red', 'diesel', 'manual', 6500000, 'Đà Nẵng', ['ac_rear', 'mic', 'luggage', 'tv', 'recline', 'wifi']],
  ['Hyundai', 'Universe Noble', 2024, 45, 'bus', 'silver', 'diesel', 'auto', 7000000, 'TP. Hồ Chí Minh', ['ac_rear', 'mic', 'luggage', 'tv', 'recline', 'wifi', 'camera']],
]

const PLATE_PREFIX = { 'Hà Nội': ['30A', '29A', '30F'], 'TP. Hồ Chí Minh': ['51A', '51K', '59A'], 'Đà Nẵng': ['43A', '43B'], 'Nha Trang': ['79A', '79C'] }

const VN_NAMES = [
  'Nguyễn Minh Anh', 'Trần Quốc Bảo', 'Lê Thị Hạnh', 'Phạm Gia Huy', 'Võ Thanh Tùng', 'Đặng Ngọc Mai', 'Bùi Hoàng Long', 'Hoàng Khánh Linh',
]

const COMMENTS = [
  'Xe sạch sẽ, chạy êm, chủ xe nhiệt tình. Sẽ thuê lại!',
  'Giá hợp lý, thủ tục nhanh gọn, nhận xe đúng giờ.',
  'Xe mới, điều hòa mát, đi cả nhà rất thoải mái.',
  'Tài xế lái an toàn, đúng giờ, thân thiện.',
  'Xe đúng như mô tả, tiết kiệm nhiên liệu.',
  'Dịch vụ tốt, hỗ trợ 24/7 rất nhanh khi cần.',
  'Đi đoàn 20 người, xe rộng rãi, ghế ngả êm.',
  'Hơi chờ lúc nhận xe nhưng nhìn chung ổn.',
]

export function buildSeed() {
  const rand = rng(20240607)
  const today = todayISO()
  const pick = (arr) => arr[Math.floor(rand() * arr.length)]

  const cars = CAR_ROWS.map((r, i) => {
    const [brand, model, year, seats, type, color, fuel, transmission, pricePerDay, city, features] = r
    const prefix = pick(PLATE_PREFIX[city])
    const plate = `${prefix}-${String(Math.floor(100 + rand() * 899))}.${String(Math.floor(10 + rand() * 89))}`
    return {
      id: 'c' + (i + 1),
      brand, model, year, seats, type, color, fuel, transmission, pricePerDay, city, features, plate,
      driverOnly: seats >= 16,
      driverFee: seats <= 7 ? 400000 : 0,
      deposit: seats <= 7 ? (pricePerDay >= 1000000 ? 5000000 : 3000000) : 0,
      kmLimit: seats <= 7 ? 300 : 0,
      image: `/cars/c${i + 1}.jpg`,
      status: i === 7 ? 'maintenance' : 'active',
      isNew: year >= 2024 || i % 7 === 0,
      createdAt: addDays(today, -200 + i * 3),
    }
  })

  const users = [
    { id: 'u0', name: 'Quản trị viên', email: 'admin@iudrive.vn', phone: '0900000000', password: 'admin123', role: 'admin', blocked: false, license: '', createdAt: addDays(today, -300) },
    { id: 'u1', name: 'Nguyễn Văn Demo', email: 'user@demo.com', phone: '0912345678', password: 'user123', role: 'user', blocked: false, license: '790123456789', createdAt: addDays(today, -120) },
    ...VN_NAMES.map((name, i) => ({
      id: 'u' + (i + 2),
      name,
      email: `khach${i + 1}@example.com`,
      phone: `09${String(10000000 + Math.floor(rand() * 89999999))}`,
      password: '123456',
      role: 'user',
      blocked: i === 6,
      license: i % 2 === 0 ? String(790000000000 + Math.floor(rand() * 99999999)) : '',
      createdAt: addDays(today, -Math.floor(40 + rand() * 200)),
    })),
  ]

  const drivers = [
    { id: 'd1', name: 'Trần Văn Hùng', phone: '0903111222', licenseClass: 'D', years: 12, status: 'available', rating: 4.9 },
    { id: 'd2', name: 'Lê Minh Tuấn', phone: '0903222333', licenseClass: 'D', years: 8, status: 'busy', rating: 4.8 },
    { id: 'd3', name: 'Phạm Quang Vinh', phone: '0903333444', licenseClass: 'E', years: 15, status: 'available', rating: 4.9 },
    { id: 'd4', name: 'Nguyễn Hữu Phước', phone: '0903444555', licenseClass: 'E', years: 10, status: 'available', rating: 4.7 },
    { id: 'd5', name: 'Đỗ Thành Nam', phone: '0903555666', licenseClass: 'B2', years: 6, status: 'off', rating: 4.6 },
    { id: 'd6', name: 'Huỳnh Văn Lợi', phone: '0903666777', licenseClass: 'D', years: 9, status: 'busy', rating: 4.8 },
  ]

  const coupons = [
    { id: 'p1', code: 'SINHVIEN15', type: 'percent', value: 15, maxDiscount: 300000, minTotal: 800000, expiresAt: addDays(today, 120), usageLimit: 500, used: 86, active: true, descVi: 'Giảm 15% cho sinh viên IU, tối đa 300k', descEn: '15% off for IU students, up to 300k' },
    { id: 'p2', code: 'WELCOME10', type: 'percent', value: 10, maxDiscount: 200000, minTotal: 500000, expiresAt: addDays(today, 90), usageLimit: 1000, used: 241, active: true, descVi: 'Giảm 10% cho khách mới, tối đa 200k', descEn: '10% off for new customers, up to 200k' },
    { id: 'p3', code: 'WEEKEND100', type: 'fixed', value: 100000, maxDiscount: 0, minTotal: 1000000, expiresAt: addDays(today, 45), usageLimit: 300, used: 120, active: true, descVi: 'Giảm 100k cho đơn từ 1 triệu', descEn: '100k off orders from 1 million' },
    { id: 'p4', code: 'DOAN500', type: 'fixed', value: 500000, maxDiscount: 0, minTotal: 5000000, expiresAt: addDays(today, 60), usageLimit: 100, used: 14, active: true, descVi: 'Giảm 500k khi thuê xe 16-50 chỗ từ 5 triệu', descEn: '500k off large vehicles over 5 million' },
    { id: 'p5', code: 'TET2024', type: 'percent', value: 20, maxDiscount: 500000, minTotal: 1000000, expiresAt: addDays(today, -30), usageLimit: 200, used: 200, active: false, descVi: 'Khuyến mãi Tết (đã kết thúc)', descEn: 'New Year promotion (ended)' },
  ]

  // Đơn thuê mẫu trải đều 6 tháng gần nhất + vài đơn sắp tới
  const bookings = []
  const customers = users.filter((u) => u.role === 'user')
  for (let i = 0; i < 46; i++) {
    const car = cars[Math.floor(rand() * cars.length)]
    const user = customers[Math.floor(rand() * customers.length)]
    const offset = i > 40 ? Math.floor(1 + rand() * 25) : Math.floor(rand() * 180) - 175
    const from = addDays(today, offset)
    const len = car.seats >= 16 ? 1 + Math.floor(rand() * 3) : 1 + Math.floor(rand() * 5)
    const to = addDays(from, len)
    const withDriver = car.driverOnly || rand() < 0.3
    const extras = rand() < 0.5 ? ['insurance'] : []
    const q = computeQuote({ car, from, to, withDriver, extras })
    let status
    if (to <= today) status = rand() < 0.9 ? 'completed' : 'cancelled'
    else if (from <= today) status = 'ongoing'
    else status = rand() < 0.5 ? 'confirmed' : 'pending'
    const method = pick(['cash', 'bank', 'vnpay', 'momo'])
    const paid = status === 'completed' || status === 'ongoing' || (status === 'confirmed' && method !== 'cash')
    bookings.push({
      id: 'b' + (i + 1),
      code: 'IU' + (1001 + i),
      carId: car.id,
      userId: user.id,
      from, to, withDriver,
      driverId: withDriver && status !== 'pending' && status !== 'cancelled' ? pick(drivers).id : null,
      extras,
      couponCode: '',
      pickup: car.city,
      contact: { name: user.name, phone: user.phone, email: user.email, license: user.license },
      payment: method,
      paymentStatus: status === 'cancelled' ? 'refunded' : paid ? 'paid' : 'unpaid',
      status,
      note: '',
      ...q,
      createdAt: addDays(from, -Math.floor(1 + rand() * 6)),
    })
  }
  bookings.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  bookings.forEach((b, i) => (b.code = 'IU' + (1001 + i)))

  const reviews = []
  cars.forEach((car, ci) => {
    const n = 2 + Math.floor(rand() * 4)
    for (let k = 0; k < n; k++) {
      const u = customers[Math.floor(rand() * customers.length)]
      reviews.push({
        id: `r${ci}_${k}`,
        carId: car.id,
        userId: u.id,
        userName: u.name,
        rating: rand() < 0.75 ? 5 : rand() < 0.7 ? 4 : 3,
        comment: pick(COMMENTS),
        date: addDays(today, -Math.floor(rand() * 150)),
      })
    }
  })

  return { cars, users, drivers, coupons, bookings, reviews, favorites: ['c4', 'c10'], compare: [] }
}
