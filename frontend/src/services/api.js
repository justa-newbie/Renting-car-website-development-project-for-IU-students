// Danh sách API mà FE cần. Chi tiết dữ liệu: frontend/docs/API.md
// LƯU Ý: các trang hiện vẫn dùng dữ liệu giả (StoreContext). File này sẽ được nối vào khi BE sẵn sàng.
import { http, token } from './http'

export const authApi = {
  async login(email, password) {
    const r = await http.post('/auth/login', { email, password })
    token.set(r.token)
    return r.user
  },
  async register(data) {
    const r = await http.post('/auth/register', data)
    token.set(r.token)
    return r.user
  },
  logout: () => token.set(null),
  me: () => http.get('/users/me'),
  updateMe: (data) => http.patch('/users/me', data),
  changePassword: (oldPassword, newPassword) => http.put('/users/me/password', { oldPassword, newPassword }),
}

export const carApi = {
  list: (filters) => http.get('/cars', filters),
  get: (id) => http.get(`/cars/${id}`),
  busyDates: (id) => http.get(`/cars/${id}/busy-dates`),
  reviews: (id) => http.get(`/cars/${id}/reviews`),
  addReview: (id, data) => http.post(`/cars/${id}/reviews`, data),
}

export const bookingApi = {
  create: (data) => http.post('/bookings', data),
  mine: () => http.get('/bookings/me'),
  get: (code) => http.get(`/bookings/${code}`),
  cancel: (id) => http.post(`/bookings/${id}/cancel`),
}

export const couponApi = {
  active: () => http.get('/coupons'),
  check: (code, subtotal) => http.post('/coupons/check', { code, subtotal }),
}

export const contactApi = {
  send: (data) => http.post('/contact', data),
  subscribe: (email) => http.post('/subscribers', { email }),
}

// Chỉ tài khoản admin
const crud = (base) => ({
  list: (params) => http.get(base, params),
  create: (data) => http.post(base, data),
  update: (id, data) => http.put(`${base}/${id}`, data),
  remove: (id) => http.delete(`${base}/${id}`),
})

export const adminApi = {
  stats: () => http.get('/admin/stats'),
  cars: crud('/admin/cars'),
  drivers: crud('/admin/drivers'),
  coupons: crud('/admin/coupons'),
  bookings: {
    list: (params) => http.get('/admin/bookings', params),
    setStatus: (id, status) => http.patch(`/admin/bookings/${id}/status`, { status }),
    assignDriver: (id, driverId) => http.patch(`/admin/bookings/${id}/driver`, { driverId }),
  },
  customers: {
    list: (params) => http.get('/admin/customers', params),
    setBlocked: (id, blocked) => http.patch(`/admin/customers/${id}/blocked`, { blocked }),
  },
}
