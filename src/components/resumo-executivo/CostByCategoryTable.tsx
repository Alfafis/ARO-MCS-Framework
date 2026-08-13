import { BarChart2 } from 'lucide-react'
import { useT } from '@/i18n/LangContext'
import { resumoT } from '@/i18n/resumo-executivo'

const CATEGORIES = [
  { rank: '01', name: 'Estudos',               min: '6,55M',  max: '9,10M',  updated: '9,54M'  },
  { rank: '02', name: 'Cavas',                 min: '2,27M',  max: '2,42M',  updated: '2,53M'  },
  { rank: '03', name: 'Pilhas',                min: '1,72M',  max: '1,80M',  updated: '1,89M'  },
  { rank: '04', name: 'Barragens',             min: '0,41M',  max: '0,43M',  updated: '0,45M'  },
  { rank: '05', name: 'Planta Industrial',     min: '0,84M',  max: '0,88M',  updated: '0,92M'  },
  { rank: '06', name: 'Áreas de Apoio',        min: '3,79M',  max: '3,99M',  updated: '4,18M'  },
  { rank: '07', name: 'Demolição Estr. Civis', min: '4,44M',  max: '4,57M',  updated: '4,80M'  },
  { rank: '08', name: 'Monitoramento',         min: '9,59M',  max: '12,01M', updated: '12,59M' },
]

export default function CostByCategoryTable() {
  const t = useT(resumoT)

  return (
    <div className="card col-span-7">
      <div className="flex items-center gap-1.5 mb-4">
        <BarChart2 size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">{t.costTableTitle}</span>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {([t.colHash, t.colCategory, t.colMin, t.colMax, t.colUpdated] as const).map(col => (
              <th
                key={col}
                className="text-[11px] font-semibold tracking-widest uppercase text-c-text-2 pb-2.5 border-b border-c-line"
                style={{ textAlign: col === t.colHash || col === t.colCategory ? 'left' : 'right' }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map(({ rank, name, min, max, updated }) => (
            <tr key={rank}>
              <td className="py-2.5 border-b border-c-line font-mono text-[11px] text-c-text-2 pr-2 w-8">{rank}</td>
              <td className="py-2.5 border-b border-c-line text-[0.8125rem] text-c-text">{name}</td>
              <td className="py-2.5 border-b border-c-line font-mono text-[0.8125rem] text-c-text-2 text-right">{min}</td>
              <td className="py-2.5 border-b border-c-line font-mono text-[0.8125rem] text-c-text-2 text-right">{max}</td>
              <td className="py-2.5 border-b border-c-line font-mono text-[0.8125rem] font-semibold text-c-text text-right">{updated}</td>
            </tr>
          ))}
          <tr>
            <td className="pt-3 border-t-2 border-c-line" />
            <td className="pt-3 border-t-2 border-c-line text-[0.8125rem] font-bold text-c-text">{t.totalLabel}</td>
            <td className="pt-3 border-t-2 border-c-line font-mono text-[0.8125rem] font-bold text-c-text text-right">29,61M</td>
            <td className="pt-3 border-t-2 border-c-line font-mono text-[0.8125rem] font-bold text-c-text text-right">35,20M</td>
            <td className="pt-3 border-t-2 border-c-line font-mono text-[0.8125rem] font-bold text-c-text text-right">36,90M</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
