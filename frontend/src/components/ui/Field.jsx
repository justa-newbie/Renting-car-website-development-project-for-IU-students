import { forwardRef } from 'react'
import { cx } from '@/lib/format'

export const inputCls =
  'h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-fg outline-none transition placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:opacity-60'

export function Field({ label, error, hint, children, className }) {
  return (
    <label className={cx('block', className)}>
      {label && <span className="mb-1.5 block text-[13px] font-semibold text-fg">{label}</span>}
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  )
}

export const Input = forwardRef(function Input({ label, error, hint, icon: Icon, className, wrapClass, ...props }, ref) {
  return (
    <Field label={label} error={error} hint={hint} className={wrapClass}>
      <span className="relative block">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />}
        <input ref={ref} className={cx(inputCls, Icon && 'pl-10', error && 'border-red-500', className)} {...props} />
      </span>
    </Field>
  )
})

export function Select({ label, error, hint, children, className, wrapClass, ...props }) {
  return (
    <Field label={label} error={error} hint={hint} className={wrapClass}>
      <select className={cx(inputCls, 'cursor-pointer pr-8', className)} {...props}>
        {children}
      </select>
    </Field>
  )
}

export function Textarea({ label, error, hint, className, wrapClass, ...props }) {
  return (
    <Field label={label} error={error} hint={hint} className={wrapClass}>
      <textarea className={cx(inputCls, 'h-auto min-h-24 py-3', className)} {...props} />
    </Field>
  )
}

export function Checkbox({ label, checked, onChange, className, ...props }) {
  return (
    <label className={cx('flex cursor-pointer items-center gap-2.5 text-sm', className)}>
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4.5 cursor-pointer rounded accent-[var(--primary)]" {...props} />
      <span>{label}</span>
    </label>
  )
}
