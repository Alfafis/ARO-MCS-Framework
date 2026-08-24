import { useContext } from 'react'
import { Ctx, type Lang } from './lang-context'

export const useLang = () => useContext(Ctx)

export function useT<T>(dict: Record<Lang, T>): T {
  const { lang } = useLang()
  return dict[lang]
}
