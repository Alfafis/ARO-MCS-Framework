import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'

export type Tema = 'light' | 'dark'

const STORAGE_KEY = 'aro-tema'

interface TemaContextValue {
  tema: Tema
  toggleTema: () => Promise<void>
  setTema: (t: Tema) => Promise<void>
}

const Ctx = createContext<TemaContextValue>({
  tema: 'light',
  toggleTema: async () => {},
  setTema: async () => {},
})

export const useTema = () => useContext(Ctx)

function aplicarNoDocumento(tema: Tema) {
  const root = document.documentElement
  if (tema === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

// Boot síncrono — lê o localStorage antes do React montar pra evitar flash
// de tema errado (FOUC) enquanto Supabase resolve a sessão. Import statement
// no main.tsx chama isso na hora do parse do módulo.
function bootstrapTemaFromCache() {
  if (typeof document === 'undefined') return
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached === 'dark' || cached === 'light') {
      aplicarNoDocumento(cached)
    }
  } catch {
    /* localStorage indisponível — ignora, cai no default light */
  }
}
bootstrapTemaFromCache()

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTemaState] = useState<Tema>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      return cached === 'dark' ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  })

  // Sincroniza com o perfil ao entrar/sair de sessão. Portal do Cliente
  // (`/relatorio/:id`) roda sem sessão — Provider mantém default light.
  useEffect(() => {
    let cancelado = false

    async function carregarDoPerfil(userId: string) {
      const { data } = await supabase.from('perfis').select('tema').eq('id', userId).maybeSingle()
      if (cancelado) return
      const remoto = (data as { tema?: Tema } | null)?.tema
      if (remoto === 'dark' || remoto === 'light') {
        setTemaState(remoto)
        aplicarNoDocumento(remoto)
        try {
          localStorage.setItem(STORAGE_KEY, remoto)
        } catch {
          /* noop */
        }
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) void carregarDoPerfil(session.user.id)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) void carregarDoPerfil(session.user.id)
      // Logout não força reset — usuário volta ao Login mantendo a preferência
      // em cache até o próximo login definir de novo.
    })

    return () => {
      cancelado = true
      subscription.unsubscribe()
    }
  }, [])

  async function setTema(novo: Tema) {
    setTemaState(novo)
    aplicarNoDocumento(novo)
    try {
      localStorage.setItem(STORAGE_KEY, novo)
    } catch {
      /* noop */
    }
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session) {
      // RPC, não .from().update() direto — `perfis` só tem policy de SELECT
      // (perfis_select_own), sem UPDATE nenhuma. Update direto retorna 204
      // "sucesso" sem afetar linha nenhuma (RLS default-deny filtrando em
      // silêncio), nunca persistindo o tema de fato. Ver migration
      // 20260904180000_atualizar_meu_tema_rpc.sql.
      const { error } = await supabase.rpc('atualizar_meu_tema', { p_tema: novo })
      if (error) console.error('Falha ao salvar tema:', error)
    }
  }

  async function toggleTema() {
    await setTema(tema === 'dark' ? 'light' : 'dark')
  }

  return <Ctx.Provider value={{ tema, toggleTema, setTema }}>{children}</Ctx.Provider>
}
