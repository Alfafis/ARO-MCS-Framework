import { FileText } from 'lucide-react'

const LAUNCHES = [
  { sector: 4,  name: 'Barragem',     period: 'Jul/2026', value: 'R$ 612.000', status: 'Validado',   ok: true  },
  { sector: 8,  name: 'Monitoramento',period: 'Jul/2026', value: 'R$ 218.000', status: 'Em revisão', ok: false },
  { sector: 2,  name: 'Cavas',        period: 'Jun/2026', value: 'R$ 940.000', status: 'Validado',   ok: true  },
]

export default function RecentLaunches() {
  return (
    <div className="cell" style={{ gridColumn: 'span 7' }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
        <FileText size={14} color="var(--accent)" aria-hidden="true" />
        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--c-text)' }}>Lançamentos recentes</span>
      </div>

      {/* Tabela */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Categoria', 'Período', 'Valor real', 'Status'].map(col => (
              <th key={col} style={{
                textAlign: col === 'Categoria' ? 'left' : col === 'Status' ? 'right' : 'left',
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--c-text-2)',
                paddingBottom: 10,
                borderBottom: '1px solid var(--c-line)',
              }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {LAUNCHES.map(({ sector, name, period, value, status, ok }, i) => (
            <tr key={i}>
              <td style={{ padding: '12px 0', borderBottom: '1px solid var(--c-line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 7,
                    background: '#f0eeec',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6875rem', fontWeight: 700, color: 'var(--c-text-2)',
                    fontFamily: 'ui-monospace,Menlo,monospace', flexShrink: 0,
                  }}>{sector}</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--c-text)' }}>{name}</span>
                </div>
              </td>
              <td style={{ padding: '12px 8px', borderBottom: '1px solid var(--c-line)', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '0.8125rem', color: 'var(--accent-700)' }}>
                {period}
              </td>
              <td style={{ padding: '12px 8px', borderBottom: '1px solid var(--c-line)', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--c-text)' }}>
                {value}
              </td>
              <td style={{ padding: '12px 0', borderBottom: '1px solid var(--c-line)', textAlign: 'right' }}>
                <span className="tag" style={{
                  background: ok ? 'var(--success-bg)' : 'var(--accent-100)',
                  color: ok ? 'var(--success)' : 'var(--accent-700)',
                }}>{status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
