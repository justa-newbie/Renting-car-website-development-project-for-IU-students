import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const Ctx = createContext(null)

/**
 * Song ngữ Việt / Anh:
 *   t('Xin chào', 'Hello')   -> chọn theo ngôn ngữ hiện tại
 *   l({ vi: '...', en: '...' }) -> dùng cho nhãn lưu trong data/constants.js
 */
export const useI18n = () => useContext(Ctx)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('rc_lang') || 'vi'
    } catch {
      return 'vi'
    }
  })

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem('rc_lang', lang)
    } catch {
      /* bỏ qua */
    }
  }, [lang])

  const t = useCallback((vi, en) => (lang === 'vi' ? vi : (en ?? vi)), [lang])
  const l = useCallback((o) => (o ? (o[lang] ?? o.vi ?? '') : ''), [lang])
  const value = useMemo(() => ({ lang, setLang, t, l }), [lang, t, l])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
