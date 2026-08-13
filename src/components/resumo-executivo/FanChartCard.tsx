import { TrendingUp } from 'lucide-react'

const FAN_DATA = [
  { label: 'Ano 1',  low: 0,  band: 3  },
  { label: 'Ano 2',  low: 0,  band: 6  },
  { label: 'Ano 3',  low: 1,  band: 10 },
  { label: 'Ano 4',  low: 2,  band: 16 },
  { label: 'Ano 5',  low: 4,  band: 25 },
  { label: 'Ano 6',  low: 8,  band: 38 },
  { label: 'Ano 7',  low: 15, band: 52 },
  { label: 'Ano 8',  low: 22, band: 65 },
  { label: 'Ano 9',  low: 30, band: 75 },
  { label: 'Ano 10', low: 38, band: 82 },
]

const CHART_H = 150

export default function FanChartCard() {
  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-5">
        <TrendingUp size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">
          Leque de confiança (fan chart) — desembolso acumulado por ano
        </span>
      </div>

      {/* Colunas do gráfico */}
      <div className="grid grid-cols-10 gap-2.5">
        {FAN_DATA.map(({ label, low, band }) => {
          const dotCenter = low + band / 2
          return (
            <div key={label} className="flex flex-col items-center">

              {/* Container da coluna */}
              <div className="relative w-4" style={{ height: CHART_H }}>

                {/* Trilha de fundo */}
                <div
                  className="absolute"
                  style={{
                    width: 16,
                    top: 0,
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#ece9e6',
                    borderRadius: 8,
                  }}
                />

                {/* Banda de incerteza */}
                <div
                  className="absolute"
                  style={{
                    width: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bottom: `${low}%`,
                    height: `${band}%`,
                    background: 'var(--accent-100)',
                    borderRadius: 8,
                  }}
                />

                {/* Ponto central */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-[14px] h-[14px] rounded-full bg-accent border-2 border-white"
                  style={{ bottom: `calc(${dotCenter}% - 7px)` }}
                />
              </div>

              {/* Rótulo do ano */}
              <span className="text-[10px] text-c-text-2 mt-2 whitespace-nowrap">{label}</span>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-c-text-2 mt-3 leading-relaxed">
        Faixa estimada a partir do coeficiente de variação da simulação de Monte Carlo (4,97%) aplicado ao desembolso acumulado por ano — não é um cálculo de percentil (P10/P90) rodado independentemente para cada ano.
      </p>
    </div>
  )
}
