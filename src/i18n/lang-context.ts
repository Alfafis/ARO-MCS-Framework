import { createContext } from 'react'

export type Lang = 'pt-BR' | 'en' | 'es'

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
}

export const Ctx = createContext<LangCtx>({ lang: 'pt-BR', setLang: () => {} })
