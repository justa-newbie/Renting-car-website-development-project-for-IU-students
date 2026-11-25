import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useI18n } from '@/context/I18nContext'
import { cx } from '@/lib/format'

/** Công tắc Light / Dark dạng viên thuốc giống thiết kế Starcar */
export function ThemeToggle({ compact = false }) {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()
  const opt = (value, Icon, label) => (
    <button
      type="button"
      onClick={() => setTheme(value)}
      aria-pressed={theme === value}
      aria-label={label}
      className={cx(
        'flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition',
        theme === value ? 'bg-bg text-fg shadow' : 'text-muted hover:text-fg',
      )}
    >
      <Icon className="size-3.5" />
      {!compact && label}
    </button>
  )
  return (
    <div className="inline-flex rounded-full border border-line bg-surface2 p-1">
      {opt('light', Sun, t('Sáng', 'Light'))}
      {opt('dark', Moon, t('Tối', 'Dark'))}
    </div>
  )
}

export function LangSwitch() {
  const { lang, setLang } = useI18n()
  return (
    <div className="inline-flex rounded-full border border-line bg-surface2 p-1 text-xs font-bold">
      {['vi', 'en'].map((c) => (
        <button
          key={c}
          onClick={() => setLang(c)}
          className={cx('h-8 cursor-pointer rounded-full px-3 uppercase transition', lang === c ? 'bg-bg text-fg shadow' : 'text-muted hover:text-fg')}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
