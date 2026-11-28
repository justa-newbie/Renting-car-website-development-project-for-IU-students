import { cx } from '@/lib/format'

const tones = {
  neutral: 'bg-surface2 text-muted',
  primary: 'bg-primary-soft text-primary',
  success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  danger: 'bg-red-500/15 text-red-600 dark:text-red-400',
  info: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  solidSuccess: 'bg-emerald-500 text-white',
  solidWarm: 'bg-gradient-to-r from-orange-400 to-rose-500 text-white',
  solidMuted: 'bg-zinc-500/80 text-white',
}

export default function Badge({ tone = 'neutral', className, children }) {
  return (
    <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold', tones[tone], className)}>
      {children}
    </span>
  )
}
