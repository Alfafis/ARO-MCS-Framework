import { BarChart2 } from 'lucide-react'

const CATEGORIES = [
  { rank: '01', name: 'Monitoramento',    value: 10.80, max: 10.80 },
  { rank: '02', name: 'Barragem',         value: 5.45,  max: 10.80 },
  { rank: '03', name: 'Cavas',            value: 4.70,  max: 10.80 },
  { rank: '04', name: 'Pilha de estéril', value: 3.90,  max: 10.80 },
  { rank: '05', name: 'Planta industrial',value: 3.30,  max: 10.80 },
]

export default function CostByCategory() {
  return (
    <div className="card col-span-8">
      <div className="flex items-center gap-1.5 mb-4">
        <BarChart2 size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">Custo por categoria</span>
      </div>

      <div className="flex justify-between items-baseline mb-5">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-c-text-2">
          5 principais de 8 categorias
        </span>
        <span className="text-[0.875rem] text-c-text-2">
          <span className="font-bold text-c-text font-mono">R$ 34,5 M</span>{' '}esperado
        </span>
      </div>

      <div className="flex flex-col gap-[18px]">
        {CATEGORIES.map(({ rank, name, value, max }) => (
          <div key={rank} className="grid grid-cols-[28px_1fr_72px] gap-3 items-start">
            <span className="font-mono text-[0.75rem] text-c-text-2 pt-0.5">{rank}</span>
            <div>
              <span className="text-[0.844rem] font-semibold text-c-text">{name}</span>
              <div className="mt-1.5 h-1.5 rounded bg-[#ece9e6] overflow-hidden">
                <div className="h-full rounded bg-accent" style={{ width: `${(value / max) * 100}%` }} />
              </div>
            </div>
            <span className="font-mono text-[0.875rem] font-bold text-c-text text-right pt-0.5">
              {value.toFixed(2)}M
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-[rgba(20,21,26,.08)] text-center">
        <button className="text-[0.8125rem] font-medium text-c-text-2 hover:text-accent transition-colors cursor-pointer bg-none border-none">
          Ver todas as 8 categorias →
        </button>
      </div>
    </div>
  )
}
