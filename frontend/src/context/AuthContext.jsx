import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useStore } from './StoreContext'
import { todayISO } from '@/lib/format'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const { users, saveUser } = useStore()
  const [uid, setUid] = useState(() => {
    try {
      return localStorage.getItem('rc_uid')
    } catch {
      return null
    }
  })
  const user = users.find((u) => u.id === uid) || null

  const remember = (id) => {
    setUid(id)
    try {
      id ? localStorage.setItem('rc_uid', id) : localStorage.removeItem('rc_uid')
    } catch {
      /* bỏ qua */
    }
  }

  // Trả về { ok, user } hoặc { ok:false, error: 'invalid' | 'blocked' }
  const login = useCallback(
    (email, password) => {
      const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password)
      if (!u) return { ok: false, error: 'invalid' }
      if (u.blocked) return { ok: false, error: 'blocked' }
      remember(u.id)
      return { ok: true, user: u }
    },
    [users],
  )

  const register = useCallback(
    ({ name, email, phone, password }) => {
      if (users.some((x) => x.email.toLowerCase() === email.trim().toLowerCase())) return { ok: false, error: 'exists' }
      const u = {
        id: 'u' + Math.random().toString(36).slice(2, 8),
        name: name.trim(), email: email.trim(), phone: phone.trim(), password,
        role: 'user', blocked: false, license: '', createdAt: todayISO(),
      }
      saveUser(u)
      remember(u.id)
      return { ok: true, user: u }
    },
    [users, saveUser],
  )

  const logout = useCallback(() => remember(null), [])
  const updateProfile = useCallback((p) => user && saveUser({ id: user.id, ...p }), [user, saveUser])

  const value = useMemo(
    () => ({ user, isAdmin: user?.role === 'admin', login, register, logout, updateProfile }),
    [user, login, register, logout, updateProfile],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
