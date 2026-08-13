import { AlertTriangle, FolderOpen, AlertCircle, ShieldAlert, FileCheck2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const RISKS: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: FolderOpen,
    title: 'Contingência divergente entre categorias',
    desc: 'A síntese por setor aplica 0% de contingência, enquanto a síntese por atividade aplica 20% sobre base equivalente — os dois totais não convergem.',
  },
  {
    Icon: AlertCircle,
    title: '"Investigação e remediação" fora do Total Geral',
    desc: 'Itens de grande porte (ex.: sistema de tratamento → R$ 15M; desmontagem da planta → R$ 4,5M) não estão somados no total — possível subestimação do passivo.',
  },
  {
    Icon: ShieldAlert,
    title: 'Nível de incerteza calculado é apertado demais',
    desc: 'O desvio-padrão vem só do range Min-Max de cada item — resulta em CV de ~5%, quando estimativas classe conceitual costumam ficar entre -30% e +50%.',
  },
  {
    Icon: FileCheck2,
    title: 'Inversão de Min/Max corrigida na Rev1',
    desc: 'Item 8.1.1 ("Bloqueio de acessos") tinha Min e Max invertidos na rev0 — já corrigido, listado no changelog da timeline de revisões.',
  },
]

export default function RisksCard() {
  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-4">
        <AlertTriangle size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">Riscos e pontos de atenção</span>
      </div>

      <div className="flex flex-col">
        {RISKS.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="flex gap-3 py-3.5 border-b border-c-line last:border-b-0 first:pt-0 last:pb-0"
          >
            <div className="w-7 h-7 rounded-[9px] bg-accent-100 flex items-center justify-center shrink-0 mt-0.5">
              <Icon size={13} color="var(--accent-700)" strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[0.8125rem] font-semibold text-c-text mb-0.5">{title}</p>
              <p className="text-[0.75rem] text-c-text-2 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
