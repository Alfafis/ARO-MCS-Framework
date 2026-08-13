import { BarChart2 } from 'lucide-react'

const METHODS = [
  { label: 'Juros simples — 10,75%/ano',              value: 'R$ 84.172.705'  },
  { label: 'Juros compostos — 10,75%/ano',            value: 'R$ 112.613.519' },
  { label: 'Inflação constante — 3,4%/ano',           value: 'R$ 56.670.699'  },
  { label: 'Escalonamento — IPCA variável 2024-2033', value: 'R$ 55.175.062'  },
]

export default function MonetaryMethodsCard() {
  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-4">
        <BarChart2 size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">
          Métodos de atualização monetária (10 anos, sobre R$ 40,57 M)
        </span>
      </div>

      <div className="flex flex-col">
        {METHODS.map(({ label, value }) => (
          <div
            key={label}
            className="flex justify-between items-baseline py-3 border-b border-c-line last:border-b-0"
          >
            <span className="text-[0.8125rem] text-c-text">{label}</span>
            <span className="font-mono text-[0.875rem] font-bold text-c-text whitespace-nowrap ml-4">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
