// Hằng số dùng chung. Mọi nhãn đều có 2 ngôn ngữ { vi, en }; dùng l(obj) từ useI18n() để hiển thị.

export const SEAT_GROUPS = [
  { key: 4, vi: '4 chỗ', en: '4 seats', hintVi: 'Gia đình nhỏ, đi phố', hintEn: 'Small family, city trips', type: 'sedan' },
  { key: 7, vi: '7 chỗ', en: '7 seats', hintVi: 'Gia đình, đi tỉnh', hintEn: 'Family, intercity', type: 'suv' },
  { key: 16, vi: '16 chỗ', en: '16 seats', hintVi: 'Nhóm bạn, công ty', hintEn: 'Groups, companies', type: 'van' },
  { key: 30, vi: '29-30 chỗ', en: '29-30 seats', hintVi: 'Đoàn, sự kiện, du lịch', hintEn: 'Tours and events', type: 'minibus' },
  { key: 50, vi: '45-50 chỗ', en: '45-50 seats', hintVi: 'Đoàn lớn, đám cưới', hintEn: 'Large groups, weddings', type: 'bus' },
]

export const BRANDS = ['Toyota', 'Hyundai', 'Kia', 'Mazda', 'Honda', 'VinFast', 'Mitsubishi', 'Ford', 'Mercedes-Benz', 'Samco', 'Thaco']

export const CITIES = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Nha Trang']

export const FUELS = {
  gasoline: { vi: 'Xăng', en: 'Gasoline' },
  diesel: { vi: 'Dầu', en: 'Diesel' },
  electric: { vi: 'Điện', en: 'Electric' },
}

export const TRANSMISSIONS = {
  auto: { vi: 'Số tự động', en: 'Automatic' },
  manual: { vi: 'Số sàn', en: 'Manual' },
}

export const COLORS = [
  { id: 'white', hex: '#f2f2f4', vi: 'Trắng', en: 'White' },
  { id: 'black', hex: '#1f2128', vi: 'Đen', en: 'Black' },
  { id: 'silver', hex: '#b9bdc7', vi: 'Bạc', en: 'Silver' },
  { id: 'grey', hex: '#7d8290', vi: 'Xám', en: 'Grey' },
  { id: 'red', hex: '#d4202c', vi: 'Đỏ', en: 'Red' },
  { id: 'blue', hex: '#2557e0', vi: 'Xanh dương', en: 'Blue' },
  { id: 'navy', hex: '#18306c', vi: 'Xanh navy', en: 'Navy' },
  { id: 'brown', hex: '#6d4b34', vi: 'Nâu', en: 'Brown' },
]

export const FEATURES = {
  bluetooth: { vi: 'Bluetooth', en: 'Bluetooth' },
  camera: { vi: 'Camera lùi', en: 'Rear camera' },
  sunroof: { vi: 'Cửa sổ trời', en: 'Sunroof' },
  gps: { vi: 'Định vị GPS', en: 'GPS' },
  airbag: { vi: 'Túi khí an toàn', en: 'Airbags' },
  usb: { vi: 'Cổng sạc USB', en: 'USB charging' },
  cruise: { vi: 'Ga tự động', en: 'Cruise control' },
  dashcam: { vi: 'Camera hành trình', en: 'Dash cam' },
  sensor: { vi: 'Cảm biến va chạm', en: 'Parking sensors' },
  ac_rear: { vi: 'Điều hòa hàng sau', en: 'Rear A/C' },
  tv: { vi: 'Màn hình TV', en: 'TV screen' },
  mic: { vi: 'Micro karaoke', en: 'Karaoke mic' },
  recline: { vi: 'Ghế ngả', en: 'Reclining seats' },
  luggage: { vi: 'Khoang hành lý lớn', en: 'Large luggage bay' },
  wifi: { vi: 'Wifi trên xe', en: 'On-board wifi' },
}

// Dịch vụ thêm, tính theo ngày
export const EXTRAS = [
  { id: 'insurance', price: 80000, vi: 'Bảo hiểm thân vỏ', en: 'Collision damage waiver', icon: 'shield' },
  { id: 'roadside', price: 40000, vi: 'Cứu hộ 24/7', en: '24/7 roadside assistance', icon: 'wrench' },
  { id: 'childseat', price: 50000, vi: 'Ghế trẻ em', en: 'Child seat', icon: 'baby' },
  { id: 'wifi', price: 40000, vi: 'Wifi di động', en: 'Pocket wifi', icon: 'wifi' },
]

export const PAYMENTS = [
  { id: 'cash', vi: 'Tiền mặt khi nhận xe', en: 'Cash at pickup', online: false },
  { id: 'bank', vi: 'Chuyển khoản ngân hàng', en: 'Bank transfer', online: true },
  { id: 'vnpay', vi: 'VNPay', en: 'VNPay', online: true },
  { id: 'momo', vi: 'Ví MoMo', en: 'MoMo wallet', online: true },
  { id: 'card', vi: 'Thẻ ATM / Visa / Mastercard', en: 'ATM / Visa / Mastercard', online: true },
]

export const BOOKING_STATUS = {
  pending: { vi: 'Chờ xác nhận', en: 'Pending', tone: 'warning' },
  confirmed: { vi: 'Đã xác nhận', en: 'Confirmed', tone: 'info' },
  ongoing: { vi: 'Đang thuê', en: 'In progress', tone: 'primary' },
  completed: { vi: 'Hoàn thành', en: 'Completed', tone: 'success' },
  cancelled: { vi: 'Đã hủy', en: 'Cancelled', tone: 'danger' },
}

export const PAYMENT_STATUS = {
  unpaid: { vi: 'Chưa thanh toán', en: 'Unpaid', tone: 'warning' },
  paid: { vi: 'Đã thanh toán', en: 'Paid', tone: 'success' },
  refunded: { vi: 'Đã hoàn tiền', en: 'Refunded', tone: 'neutral' },
}

export const DRIVER_STATUS = {
  available: { vi: 'Sẵn sàng', en: 'Available', tone: 'success' },
  busy: { vi: 'Đang chạy', en: 'On a trip', tone: 'primary' },
  off: { vi: 'Nghỉ', en: 'Off duty', tone: 'neutral' },
}

export const CAR_STATUS = {
  active: { vi: 'Hoạt động', en: 'Active', tone: 'success' },
  maintenance: { vi: 'Bảo dưỡng', en: 'Maintenance', tone: 'warning' },
}

// Điều kiện bằng lái theo số chỗ (khi tự lái)
export const licenseFor = (seats) => (seats <= 9 ? 'B1 / B2' : seats <= 30 ? 'D' : 'E')

export const CONTACT = {
  hotline: '1900 6868',
  email: 'hotro@iudrive.vn',
  address: { vi: 'Khu đô thị Đại học Quốc tế, TP. Thủ Đức, TP. HCM', en: 'International University campus, Thu Duc, Ho Chi Minh City' },
}
