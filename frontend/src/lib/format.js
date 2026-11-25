// Các hàm tiện ích định dạng dùng chung

export const cx = (...a) => a.filter(Boolean).join(' ')

export const money = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0)) + 'đ'

export const moneyShort = (n) => {
  n = n || 0
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace('.0', '') + ' tỷ'
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.0', '') + 'tr'
  if (n >= 1e3) return Math.round(n / 1e3) + 'k'
  return String(n)
}

const pad = (n) => String(n).padStart(2, '0')

// Ngày dạng YYYY-MM-DD theo giờ máy (không bị lệch múi giờ)
export const toISO = (d) => {
  d = new Date(d)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
export const todayISO = () => toISO(new Date())
export const addDays = (iso, n) => {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export const fmtDate = (iso, lang = 'vi') => {
  if (!iso) return ''
  const d = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso)
  return d.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Số ngày thuê (tối thiểu 1 ngày)
export const daysBetween = (from, to) => {
  if (!from || !to) return 1
  const ms = new Date(to + 'T00:00:00') - new Date(from + 'T00:00:00')
  return Math.max(1, Math.round(ms / 86400000))
}

// Gom số chỗ thực tế về nhóm 4 / 7 / 16 / 30 / 50
export const seatGroup = (seats) => {
  if (seats <= 5) return 4
  if (seats <= 9) return 7
  if (seats <= 17) return 16
  if (seats <= 32) return 30
  return 50
}

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

export const monthKey = (iso) => iso.slice(0, 7)
