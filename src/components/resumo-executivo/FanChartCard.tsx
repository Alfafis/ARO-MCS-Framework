import { TrendingUp } from 'lucide-react'

const FAN_DATA = [
  { label: 'Ano 1',  low: 0,  high: 5,  dot: 2  },
  { label: 'Ano 2',  low: 0,  high: 12, dot: 5  },
  { label: 'Ano 3',  low: 0,  high: 18, dot: 10 },
  { label: 'Ano 4',  low: 2,  high: 25, dot: 13 },
  { label: 'Ano 5',  low: 5,  high: 35, dot: 22 },
  { label: 'Ano 6',  low: 10, high: 48, dot: 32 },
  { label: 'Ano 7',  low: 18, high: 58, dot: 44 },
  { label: 'Ano 8',  low: 25, high: 66, dot: 52 },
  { label: 'Ano 9',  low: 32, high: 74, dot: 58 },
  { label: 'Ano 10', low: 40, high: 82, dot: 65 },
]

export default function FanChartCard() {
  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-5">
        <TrendingUp size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">
          Leque de confiança (fan chart) — desembolso acumulado por ano
        </span>
      </div>

      <div className="grid grid-cols-10 gap-3">
        {FAN_DATA.map(({ label, low, high, dot }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <div className="relative w-4 rounded-full bg-[#f0eeec]" style={{ height: 150 }}>
              <div
                className="absolute left-0 right-0 rounded-full bg-accent-100"
                style={{ bottom: `${low}%`, height: `${high - low}%` }}
              />
              <div
                className="absolute left-1/2 -translate-x-1/2 w-[9px] h-[9px] rounded-full bg-accent border-2 border-white"
                style={{ bottom: `calc(${dot}% - 4.5px)` }}
              />
            </div>
            <span className="text-[11px] text-c-text-2 whitespace-nowrap">{label}</span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-c-text-2 mt-3 leading-relaxed">
        Faixa estimada a partir do coeficiente de variação da simulação (4,97%) aplicado ao desembolso acumulado por ano.
      </p>
    </div>
  )
}
