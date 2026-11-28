import { cx } from '@/lib/format'

const variants = {
  primary: 'bg-primary text-onprimary hover:bg-primary-hover shadow-[0_6px_18px_-6px_var(--primary)]',
  dark: 'bg-fg text-bg hover:opacity-90',
  secondary: 'bg-surface2 text-fg hover:bg-line',
  outline: 'border border-line bg-surface text-fg hover:border-primary hover:text-primary',
  ghost: 'text-fg hover:bg-surface2',
  soft: 'bg-primary-soft text-primary hover:opacity-80',
  danger: 'bg-red-500 text-white hover:bg-red-600',
}
const sizes = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-base gap-2.5',
  icon: 'size-10 justify-center',
}

export default function Button({ as: Comp = 'button', variant = 'primary', size = 'md', className, children, ...props }) {
  return (
    <Comp
      className={cx(
        'inline-flex cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-full font-semibold transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  )
}
