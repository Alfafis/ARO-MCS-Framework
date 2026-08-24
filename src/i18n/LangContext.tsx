import { useEffect, useState, type ReactNode } from 'react'
import { Ctx, type Lang } from './lang-context'

export type { Lang }

const STORAGE_KEY = 'aro_lang'

function getInitialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'pt-BR' || stored === 'en' || stored === 'es') return stored
  return 'pt-BR'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang)

  // <html lang> precisa acompanhar o idioma escolhido — leitor de tela e
  // tradutor automático do browser leem esse atributo, não o conteúdo.
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  function setLang(l: Lang) {
    localStorage.setItem(STORAGE_KEY, l)
    setLangState(l)
  }

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>
}
