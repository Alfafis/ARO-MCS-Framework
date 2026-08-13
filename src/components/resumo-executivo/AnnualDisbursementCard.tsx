import { Calendar } from 'lucide-react'

const YEARS = [
  { label: 'ANO 1',  value: 'R$ 0'   },
  { label: 'ANO 2',  value: '471,7k' },
  { label: 'ANO 3',  value: '314,5k' },
  { label: 'ANO 4',  value: '1,52M'  },
  { label: 'ANO 5',  value: '4,42M'  },
  { label: 'ANO 6',  value: '14,91M' },
  { label: 'ANO 7',  value: '3,15M'  },
  { label: 'ANO 8',  value: '3,15M'  },
  { label: 'ANO 9',  value: '3,15M'  },
  { label: 'ANO 10', value: '3,15M'  },
]

export default function AnnualDisbursementCard() {
  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-4">
        <Calendar size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">
          Desembolso projetado por ano — Total Geral
        </span>
      </div>

      <div className="grid grid-cols-10 gap-2">
        {YEARS.map(({ label, value }) => (
          <div key={label} className="bg-[#f6f5f3] rounded-[8px] p-2 text-center">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-c-text-2 mb-1">{label}</p>
            <p className="font-mono text-[0.75rem] font-bold text-c-text">{value}</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-c-text-2 mt-3 leading-relaxed">
        Apenas Estudos, Áreas de Apoio, Demolição e Monitoramento têm valores lançados por ano; as demais categorias não têm essa quebra.
      </p>
    </div>
  )
}
