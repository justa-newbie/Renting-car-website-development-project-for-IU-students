import { Search } from 'lucide-react'
import { cx } from '@/lib/format'
import { inputCls } from '../ui/Field'

export function PageHead({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Card({ title, action, children, className }) {
  return (
    <section className={cx('rounded-3xl border border-line bg-surface p-5', className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-extrabold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function StatCard({ icon: Icon, label, value, delta, tone = 'primary' }) {
  const tones = { primary: 'bg-primary-soft text-primary', green: 'bg-emerald-500/15 text-emerald-500', blue: 'bg-sky-500/15 text-sky-500', amber: 'bg-amber-500/15 text-amber-500' }
  return (
    <div className="rounded-3xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between">
        <span className={cx('grid size-11 place-items-center rounded-2xl', tones[tone])}><Icon className="size-5" /></span>
        {delta != null && <span className={cx('rounded-full px-2.5 py-1 text-xs font-bold', delta >= 0 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/15 text-red-600 dark:text-red-400')}>{delta >= 0 ? '+' : ''}{delta}%</span>}
      </div>
      <p className="mt-4 text-2xl font-extrabold tracking-tight">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder, className }) {
  return (
    <div className={cx('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cx(inputCls, 'h-10 rounded-full pl-10')} />
    </div>
  )
}

// Bảng dữ liệu: <Table head={[...]}>{rows}</Table>
export function Table({ head, children, empty }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-line bg-surface">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-surface2/60 text-xs uppercase tracking-wider text-muted">
            {head.map((h, i) => <th key={i} className={cx('px-4 py-3.5 font-bold', h.right && 'text-right')}>{h.label ?? h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
      {empty}
    </div>
  )
}

export const Td = ({ children, className, right }) => <td className={cx('px-4 py-3.5 align-middle', right && 'text-right', className)}>{children}</td>

export function IconBtn({ icon: Icon, label, onClick, tone = 'default', disabled }) {
  const tones = { default: 'hover:bg-surface2 text-muted hover:text-fg', danger: 'hover:bg-red-500/15 text-muted hover:text-red-500', success: 'hover:bg-emerald-500/15 text-muted hover:text-emerald-500' }
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={label} aria-label={label} className={cx('grid size-9 cursor-pointer place-items-center rounded-full transition disabled:opacity-40', tones[tone])}>
      <Icon className="size-4" />
    </button>
  )
}
