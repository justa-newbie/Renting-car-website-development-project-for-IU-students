import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

// Chưa đăng nhập -> chuyển tới /login và quay lại trang cũ sau khi đăng nhập
export function RequireAuth({ children }) {
  const { user } = useAuth()
  const loc = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />
  return children
}

// Chỉ admin mới vào được trang quản trị
export function RequireAdmin({ children }) {
  const { user, isAdmin } = useAuth()
  const loc = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function useDocTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · IUDrive` : 'IUDrive - Thuê xe nhanh, giá minh bạch'
  }, [title])
}
