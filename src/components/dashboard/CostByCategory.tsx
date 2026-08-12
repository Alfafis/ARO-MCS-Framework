import { BarChart2 } from 'lucide-react'

const CATEGORIES = [
  { rank: '01', name: 'Monitoramento', value: 10.80, max: 10.80 },
  { rank: '02', name: 'Barragem',      value: 5.45,  max: 10.80 },
  { rank: '03', name: 'Cavas',         value: 4.70,  max: 10.80 },
  { rank: '04', name: 'Pilha de estéril', value: 3.90, max: 10.80 },
  { rank: '05', name: 'Planta industrial', value: 3.30, max: 10.80 },
]

export default function CostByCategory() {
  return (
    <div className="cell" style={{ gridColumn: 'span 8' }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        <BarChart2 size={14} color="var(--accent)" aria-hidden="true" />
        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--c-text)' }}>Custo por categoria</span>
      </div>

      {/* Subtítulo + total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--c-text-2)', textTransform: 'uppercase' }}>
          5 principais de 8 categorias
        </span>
        <span style={{ fontSize: '0.875rem', color: 'var(--c-text-2)' }}>
          <span style={{ fontWeight: 700, color: 'var(--c-text)', fontFamily: 'ui-monospace,Menlo,monospace' }}>R$ 34,5 M</span>
          {' '}esperado
        </span>
      </div>

      {/* Lista ranqueada */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {CATEGORIES.map(({ rank, name, value, max }) => (
          <div key={rank} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 72px', gap: 12, alignItems: 'start' }}>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '0.75rem', color: 'var(--c-text-2)', paddingTop: 2 }}>
              {rank}
            </span>
            <div>
              <span style={{ fontSize: '0.844rem', fontWeight: 600, color: 'var(--c-text)' }}>{name}</span>
              <div style={{ marginTop: 6, height: 6, borderRadius: 4, background: '#ece9e6', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  borderRadius: 4,
                  background: 'var(--accent)',
                  width: `${(value / max) * 100}%`,
                }} />
              </div>
            </div>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '0.875rem', fontWeight: 700, color: 'var(--c-text)', textAlign: 'right', paddingTop: 2 }}>
              {value.toFixed(2)}M
            </span>
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--c-line)', textAlign: 'center' }}>
        <button className="cat-seeall">Ver todas as 8 categorias →</button>
      </div>
    </div>
  )
}
