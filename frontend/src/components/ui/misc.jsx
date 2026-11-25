import { useState } from 'react'
import { ChevronLeft, ChevronRight, Inbox, Star } from 'lucide-react'
import { cx } from '@/lib/format'
import Button from './Button'

// ---- Switch (công tắc bật/tắt) ----
export function Switch({ checked, onChange, label, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx('flex cursor-pointer items-center gap-3 text-sm', className)}
    >
      <span className={cx('relative h-6 w-11 rounded-full transition', checked ? 'bg-primary' : 'bg-line')}>
        <span className={cx('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
      </span>
      {label && <span>{label}</span>}
    </button>
  )
}

// ---- Rating (hiển thị sao) ----
export function Rating({ value = 0, count, size = 'size-4', showNumber = true }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={cx(size, i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-line')} />
        ))}
      </span>
      {showNumber && value > 0 && <span className="text-sm font-semibold">{value.toFixed(1)}</span>}
      {count != null && <span className="text-sm text-muted">({count})</span>}
    </span>
  )
}

export function RatingInput({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => onChange(i)} className="cursor-pointer p-0.5" aria-label={`${i} sao`}>
          <Star className={cx('size-7 transition', i <= (hover || value) ? 'fill-amber-400 text-amber-400' : 'text-line')} />
        </button>
      ))}
    </span>
  )
}

// ---- Phân trang ----
export function Pagination({ page, pages, onChange, className }) {
  if (pages <= 1) return null
  const items = Array.from({ length: pages }, (_, i) => i + 1).filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
  const out = []
  items.forEach((p, i) => {
    if (i && p - items[i - 1] > 1) out.push('gap' + p)
    out.push(p)
  })
  const base = 'grid size-10 place-items-center rounded-full text-sm font-semibold transition cursor-pointer'
  return (
    <nav className={cx('flex items-center justify-center gap-1.5', className)}>
      <button disabled={page === 1} onClick={() => onChange(page - 1)} className={cx(base, 'hover:bg-surface2 disabled:opacity-40')} aria-label="Previous">
        <ChevronLeft className="size-4" />
      </button>
      {out.map((p) =>
        typeof p === 'string' ? (
          <span key={p} className="px-1 text-muted">…</span>
        ) : (
          <button key={p} onClick={() => onChange(p)} className={cx(base, p === page ? 'bg-primary text-onprimary' : 'hover:bg-surface2')}>
            {p}
          </button>
        ),
      )}
      <button disabled={page === pages} onClick={() => onChange(page + 1)} className={cx(base, 'hover:bg-surface2 disabled:opacity-40')} aria-label="Next">
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}

// ---- Trạng thái rỗng ----
export function Empty({ icon: Icon = Inbox, title, text, action }) {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-line px-6 py-16 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-surface2 text-muted">
        <Icon className="size-7" />
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      {text && <p className="mt-1 max-w-md text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// ---- Thanh trượt giá 2 đầu ----
export function RangeSlider({ min, max, step = 50000, value, onChange }) {
  const [lo, hi] = value
  const pct = (v) => ((v - min) / (max - min)) * 100
  return (
    <div className="dual-range">
      <div className="absolute left-0 right-0 top-[13px] h-1 rounded-full bg-line" />
      <div className="absolute top-[13px] h-1 rounded-full bg-primary" style={{ left: pct(lo) + '%', right: 100 - pct(hi) + '%' }} />
      <input type="range" min={min} max={max} step={step} value={lo} onChange={(e) => onChange([Math.min(+e.target.value, hi - step), hi])} aria-label="min" />
      <input type="range" min={min} max={max} step={step} value={hi} onChange={(e) => onChange([lo, Math.max(+e.target.value, lo + step)])} aria-label="max" />
    </div>
  )
}

// ---- Hộp xác nhận ----
import Modal from './Modal'
export function Confirm({ open, onClose, onConfirm, title, text, confirmLabel, cancelLabel, danger = true }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{cancelLabel}</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-sm text-muted">{text}</p>
    </Modal>
  )
}

// ---- Tiêu đề section ----
export function SectionTitle({ eyebrow, title, text, align = 'center', action }) {
  return (
    <div className={cx('mb-10 flex flex-wrap items-end justify-between gap-4', align === 'center' && 'flex-col items-center text-center')}>
      <div className={cx(align === 'center' && 'mx-auto max-w-2xl')}>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>}
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
        {text && <p className="mt-3 text-muted">{text}</p>}
      </div>
      {action}
    </div>
  )
}
