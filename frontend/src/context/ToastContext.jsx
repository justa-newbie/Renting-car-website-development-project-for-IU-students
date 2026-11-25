import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, Info, XCircle } from 'lucide-react'

const Ctx = createContext(null)

/** toast('Đã lưu') hoặc toast('Có lỗi', 'error') */
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])

  const toast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setItems((s) => [...s, { id, message, type }])
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 3600)
  }, [])

  const value = useMemo(() => toast, [toast])
  const Icon = { success: CheckCircle2, error: XCircle, info: Info }
  const color = { success: 'text-emerald-500', error: 'text-red-500', info: 'text-sky-500' }

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[min(92vw,360px)] flex-col gap-2">
        {items.map((i) => {
          const I = Icon[i.type] || Info
          return (
            <div key={i.id} className="animate-slide-in pointer-events-auto flex items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-soft">
              <I className={`mt-0.5 size-5 shrink-0 ${color[i.type]}`} />
              <p className="text-sm font-medium">{i.message}</p>
            </div>
          )
        })}
      </div>
    </Ctx.Provider>
  )
}
