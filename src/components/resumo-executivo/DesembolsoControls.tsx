import type { ModoDesembolso } from '@/lib/desembolsoAno'

// Toggle dos 3 modos do card de desembolso ano-a-ano
// (`_Plan_Curva_Desembolso.md`). `disableIpca` desabilita o modo IPCA quando
// `parametros_anuais` não tem série completa configurada (evita render de
// matriz idêntica à provisão sem aviso). Extraído dos duplicatas em
// ResumoExecutivo.tsx e PortalClienteRelatorio.tsx (TODO conhecido desde
// ecc543a, sessão 28-08).
interface ModoToggleProps {
  current: ModoDesembolso
  onChange: (m: ModoDesembolso) => void
  disableIpca: boolean
  contingenciaPct: number
  labels?: { base: string; provisaoTemplate: string; ipca: string; disabledTitle: string }
}

const DEFAULT_MODO_LABELS = {
  base: 'Sem provisão',
  provisaoTemplate: 'Com provisão {pct}%',
  ipca: 'Com IPCA acumulado',
  disabledTitle: 'IPCA anual não configurado em Parâmetros Globais',
}

export function ModoToggle({
  current,
  onChange,
  disableIpca,
  contingenciaPct,
  labels = DEFAULT_MODO_LABELS,
}: ModoToggleProps) {
  const opts: { key: ModoDesembolso; label: string }[] = [{ key: 'base', label: labels.base }]
  if (contingenciaPct > 0) {
    opts.push({ key: 'provisao', label: labels.provisaoTemplate.replace('{pct}', String(contingenciaPct)) })
  }
  opts.push({ key: 'ipca', label: labels.ipca })
  return (
    <div className="inline-flex rounded-full bg-[#f6f5f3] p-1 gap-1">
      {opts.map((opt) => {
        const disabled = opt.key === 'ipca' && disableIpca
        const active = current === opt.key
        return (
          <button
            key={opt.key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.key)}
            className={`px-3 py-1 rounded-full text-[11.5px] font-medium transition-colors cursor-pointer border-0 ${
              active
                ? 'bg-white text-c-text shadow-sm'
                : disabled
                  ? 'text-c-text-2/40 cursor-not-allowed'
                  : 'text-c-text-2 hover:text-c-text'
            }`}
            title={disabled ? labels.disabledTitle : undefined}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// Toggle da granularidade da visualização — Agregado (categoria × ano, aba
// `0. Síntese Por Setor`) vs. Detalhado (item × ano, aba `9. Síntese Por
// Atividade`). Mesmo visual do ModoToggle pra consistência da linha de
// controles.
interface ViewToggleProps {
  current: 'agregado' | 'detalhado'
  onChange: (v: 'agregado' | 'detalhado') => void
  labels: { agregado: string; detalhado: string }
}

export function ViewToggle({ current, onChange, labels }: ViewToggleProps) {
  const opts: { key: 'agregado' | 'detalhado'; label: string }[] = [
    { key: 'agregado', label: labels.agregado },
    { key: 'detalhado', label: labels.detalhado },
  ]
  return (
    <div className="inline-flex rounded-full bg-[#f6f5f3] p-1 gap-1">
      {opts.map((opt) => {
        const active = current === opt.key
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={`px-3 py-1 rounded-full text-[11.5px] font-medium transition-colors cursor-pointer border-0 ${
              active ? 'bg-white text-c-text shadow-sm' : 'text-c-text-2 hover:text-c-text'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
