import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { derivarTonsAccent } from '@/lib/color'

export const DEFAULT_LOGO_ICONE = '/logo.png'
export const DEFAULT_LOGO_COMPLETO = '/BePlanned Logo.png'
export const DEFAULT_FUNDO = '/PADRONAGEM%20-%20FUNDO%20com%20pontilhado.png'
export const DEFAULT_COR = '#2e7d32'

export interface PlataformaConfig {
  logoIconeUrl: string
  logoCompletoUrl: string
  corPrimaria: string
  fundoUrl: string
  fundoAtivo: boolean
}

interface PlataformaConfigContextValue {
  config: PlataformaConfig
  loading: boolean
  atualizarConfig: (patch: {
    logoIconeUrl: string | null
    logoCompletoUrl: string | null
    corPrimaria: string | null
    fundoUrl: string | null
    fundoAtivo: boolean
  }) => Promise<void>
}

const DEFAULT_CONFIG: PlataformaConfig = {
  logoIconeUrl: DEFAULT_LOGO_ICONE,
  logoCompletoUrl: DEFAULT_LOGO_COMPLETO,
  corPrimaria: DEFAULT_COR,
  fundoUrl: DEFAULT_FUNDO,
  fundoAtivo: true,
}

const Ctx = createContext<PlataformaConfigContextValue>({
  config: DEFAULT_CONFIG,
  loading: true,
  atualizarConfig: async () => {},
})

export const usePlataformaConfig = () => useContext(Ctx)

function aplicarNoDocumento(config: PlataformaConfig) {
  const tons = derivarTonsAccent(config.corPrimaria)
  const root = document.documentElement.style
  root.setProperty('--color-accent', tons.base)
  root.setProperty('--color-accent-700', tons.escuro)
  root.setProperty('--color-accent-100', tons.claro)
  root.setProperty('--accent', tons.base)
  root.setProperty('--accent-700', tons.escuro)
  root.setProperty('--accent-100', tons.claro)

  // `.bg-fixed` vive em index.html (fora da árvore React, de propósito —
  // evita flash de fundo sem estilo antes do JS carregar). Único lugar
  // sancionado neste projeto pra alcançar um nó fora do React: é o próprio
  // elemento estático pensado pra ser configurado assim.
  const bgEl = document.querySelector<HTMLElement>('.bg-fixed')
  if (bgEl) {
    // Overlay via var(--bg-fixed-overlay) — trocada pelo tema escuro
    // (bege 92% no light, quase preto 92% no dark). Manter background como
    // string literal aqui aceita CSS vars naturalmente.
    bgEl.style.backgroundImage = config.fundoAtivo
      ? `linear-gradient(var(--bg-fixed-overlay), var(--bg-fixed-overlay)), url('${config.fundoUrl}')`
      : 'none'
  }
}

export function PlataformaConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PlataformaConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('configuracoes_plataforma')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        const next: PlataformaConfig = {
          logoIconeUrl: data?.logo_icone_url ?? DEFAULT_LOGO_ICONE,
          logoCompletoUrl: data?.logo_completo_url ?? DEFAULT_LOGO_COMPLETO,
          corPrimaria: data?.cor_primaria ?? DEFAULT_COR,
          fundoUrl: data?.fundo_url ?? DEFAULT_FUNDO,
          fundoAtivo: data?.fundo_ativo ?? true,
        }
        setConfig(next)
        aplicarNoDocumento(next)
        setLoading(false)
      })
  }, [])

  async function atualizarConfig(patch: {
    logoIconeUrl: string | null
    logoCompletoUrl: string | null
    corPrimaria: string | null
    fundoUrl: string | null
    fundoAtivo: boolean
  }) {
    const { data, error } = await supabase.rpc('atualizar_configuracoes_plataforma', {
      p_logo_icone_url: patch.logoIconeUrl as unknown as string,
      p_logo_completo_url: patch.logoCompletoUrl as unknown as string,
      p_cor_primaria: patch.corPrimaria as unknown as string,
      p_fundo_url: patch.fundoUrl as unknown as string,
      p_fundo_ativo: patch.fundoAtivo,
    })
    if (error || !data) throw error ?? new Error('Falha ao salvar configurações da plataforma')
    const next: PlataformaConfig = {
      logoIconeUrl: data.logo_icone_url ?? DEFAULT_LOGO_ICONE,
      logoCompletoUrl: data.logo_completo_url ?? DEFAULT_LOGO_COMPLETO,
      corPrimaria: data.cor_primaria ?? DEFAULT_COR,
      fundoUrl: data.fundo_url ?? DEFAULT_FUNDO,
      fundoAtivo: data.fundo_ativo,
    }
    setConfig(next)
    aplicarNoDocumento(next)
  }

  return <Ctx.Provider value={{ config, loading, atualizarConfig }}>{children}</Ctx.Provider>
}
