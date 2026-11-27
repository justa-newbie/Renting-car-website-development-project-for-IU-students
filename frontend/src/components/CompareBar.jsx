import { Link, useLocation } from 'react-router-dom'
import { GitCompareArrows, X } from 'lucide-react'
import CarImage from './CarImage'
import Button from './ui/Button'
import { useStore } from '@/context/StoreContext'
import { useI18n } from '@/context/I18nContext'

/** Thanh nổi ở đáy màn hình khi đã chọn xe để so sánh */
export default function CompareBar() {
  const { compare, getCar, toggleCompare, clearCompare } = useStore()
  const { t } = useI18n()
  const loc = useLocation()
  if (!compare.length || loc.pathname === '/compare') return null
  return (
    <div className="animate-fade-up fixed inset-x-0 bottom-4 z-40 px-4">
      <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-full border border-line bg-surface p-2 pl-4 shadow-soft">
        <GitCompareArrows className="hidden size-5 text-primary sm:block" />
        <div className="flex flex-1 items-center gap-2 overflow-x-auto hide-scrollbar">
          {compare.map((id) => {
            const c = getCar(id)
            if (!c) return null
            return (
              <span key={id} className="flex shrink-0 items-center gap-1 rounded-full bg-surface2 py-1 pl-2 pr-1 text-xs font-semibold">
                <CarImage src={c.image} type={c.type} color={c.color} className="h-5 w-8" />
                {c.model}
                <button onClick={() => toggleCompare(id)} aria-label="remove" className="grid size-5 cursor-pointer place-items-center rounded-full hover:bg-line"><X className="size-3" /></button>
              </span>
            )
          })}
        </div>
        <button onClick={clearCompare} className="hidden cursor-pointer text-xs font-semibold text-muted hover:text-fg sm:block">{t('Xóa', 'Clear')}</button>
        <Button as={Link} to="/compare" size="sm">{t('So sánh', 'Compare')} ({compare.length})</Button>
      </div>
    </div>
  )
}
