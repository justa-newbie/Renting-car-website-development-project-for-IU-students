import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { buildSeed } from '@/data/seed'
import { addDays, todayISO } from '@/lib/format'

/**
 * "Cơ sở dữ liệu" giả lập lưu trong localStorage.
 * Khi nối BE thật: thay các hàm bên dưới bằng lời gọi axios/fetch tới /api/...
 * (các trang chỉ dùng useStore() nên không phải sửa giao diện).
 */
const KEY = 'rc_db_v2'
const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

const load = () => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* dữ liệu hỏng -> tạo lại */
  }
  return buildSeed()
}

const uid = (p) => p + Math.random().toString(36).slice(2, 9)
const ACTIVE = ['pending', 'confirmed', 'ongoing']
const overlap = (aFrom, aTo, bFrom, bTo) => aFrom < bTo && aTo > bFrom

const upsert = (list, item, prefix) => {
  if (item.id && list.some((x) => x.id === item.id)) return list.map((x) => (x.id === item.id ? { ...x, ...item } : x))
  return [{ ...item, id: item.id || uid(prefix) }, ...list]
}

export function StoreProvider({ children }) {
  const [db, setDb] = useState(load)
  const dbRef = useRef(db)
  dbRef.current = db

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(db))
    } catch {
      /* bỏ qua */
    }
  }, [db])

  const patch = useCallback((key, fn) => setDb((d) => ({ ...d, [key]: fn(d[key]) })), [])

  // ---------- Truy vấn ----------
  const getCar = useCallback((id) => db.cars.find((c) => c.id === id), [db.cars])
  const getUser = useCallback((id) => db.users.find((u) => u.id === id), [db.users])

  const ratings = useMemo(() => {
    const m = {}
    db.reviews.forEach((r) => {
      const x = (m[r.carId] ||= { sum: 0, count: 0 })
      x.sum += r.rating
      x.count += 1
    })
    return m
  }, [db.reviews])
  const ratingOf = useCallback((id) => {
    const x = ratings[id]
    return x ? { avg: x.sum / x.count, count: x.count } : { avg: 0, count: 0 }
  }, [ratings])

  const busyRanges = useCallback(
    (carId) => db.bookings.filter((b) => b.carId === carId && ACTIVE.includes(b.status)).sort((a, b) => a.from.localeCompare(b.from)),
    [db.bookings],
  )

  // Trạng thái xe trong khoảng ngày: available | booked | maintenance
  const carState = useCallback(
    (car, from, to) => {
      if (car.status === 'maintenance') return { state: 'maintenance' }
      const f = from || todayISO()
      const t = to && to > f ? to : addDays(f, 1)
      const hit = db.bookings.find((b) => b.carId === car.id && ACTIVE.includes(b.status) && overlap(f, t, b.from, b.to))
      return hit ? { state: 'booked', until: hit.to } : { state: 'available' }
    },
    [db.bookings],
  )

  // ---------- Thao tác ----------
  const saveCar = useCallback((car) => patch('cars', (l) => upsert(l, car, 'c')), [patch])
  const deleteCar = useCallback((id) => patch('cars', (l) => l.filter((c) => c.id !== id)), [patch])

  const createBooking = useCallback((data) => {
    const cur = dbRef.current
    const maxNo = cur.bookings.reduce((m, b) => Math.max(m, parseInt(b.code.replace(/\D/g, ''), 10) || 0), 1000)
    const created = { ...data, id: uid('b'), code: 'IU' + (maxNo + 1), status: 'pending', createdAt: todayISO() }
    setDb((d) => ({
      ...d,
      bookings: [created, ...d.bookings],
      coupons: data.couponCode ? d.coupons.map((c) => (c.code === data.couponCode ? { ...c, used: c.used + 1 } : c)) : d.coupons,
    }))
    return created
  }, [])
  const updateBooking = useCallback((id, p) => patch('bookings', (l) => l.map((b) => (b.id === id ? { ...b, ...p } : b))), [patch])

  const saveUser = useCallback((u) => patch('users', (l) => upsert(l, u, 'u')), [patch])
  const saveDriver = useCallback((x) => patch('drivers', (l) => upsert(l, x, 'd')), [patch])
  const deleteDriver = useCallback((id) => patch('drivers', (l) => l.filter((x) => x.id !== id)), [patch])
  const saveCoupon = useCallback((x) => patch('coupons', (l) => upsert(l, x, 'p')), [patch])
  const deleteCoupon = useCallback((id) => patch('coupons', (l) => l.filter((x) => x.id !== id)), [patch])

  const addReview = useCallback(
    (r) => patch('reviews', (l) => [{ ...r, id: uid('r'), date: todayISO() }, ...l]),
    [patch],
  )

  const toggleFav = useCallback(
    (id) => patch('favorites', (l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id])),
    [patch],
  )
  const toggleCompare = useCallback(
    (id) => patch('compare', (l) => (l.includes(id) ? l.filter((x) => x !== id) : l.length >= 3 ? l : [...l, id])),
    [patch],
  )
  const clearCompare = useCallback(() => patch('compare', () => []), [patch])
  const resetDemo = useCallback(() => setDb(buildSeed()), [])

  const value = useMemo(
    () => ({
      ...db,
      getCar, getUser, ratingOf, busyRanges, carState,
      saveCar, deleteCar, createBooking, updateBooking, saveUser,
      saveDriver, deleteDriver, saveCoupon, deleteCoupon,
      addReview, toggleFav, toggleCompare, clearCompare, resetDemo,
    }),
    [db, getCar, getUser, ratingOf, busyRanges, carState, saveCar, deleteCar, createBooking, updateBooking, saveUser, saveDriver, deleteDriver, saveCoupon, deleteCoupon, addReview, toggleFav, toggleCompare, clearCompare, resetDemo],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
