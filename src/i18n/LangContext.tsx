import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'pt-BR' | 'en' | 'es'

interface LangCtx {
  lang:    Lang
  setLang: (l: Lang) => void
}

const Ctx = createContext<LangCtx>({ lang: 'pt-BR', setLang: () => {} })

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

export const useLang = () => useContext(Ctx)

export function useT<T>(dict: Record<Lang, T>): T {
  const { lang } = useLang()
  return dict[lang]
}
