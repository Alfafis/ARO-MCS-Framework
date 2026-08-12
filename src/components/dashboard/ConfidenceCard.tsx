import { Shield } from 'lucide-react'

const UPDATE_METHODS = [
  { label: 'Escalonamento (IPCA)',   value: 'R$ 55,2 M' },
  { label: 'Juros simples 10,75%',  value: 'R$ 84,2 M' },
  { label: 'Juros compostos 10,75%',value: 'R$ 112,6 M' },
  { label: 'Inflação constante 3,4%',value: 'R$ 56,7 M' },
]

export default function ConfidenceCard() {
  return (
    <div className="cell" style={{ gridColumn: 'span 4' }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <Shield size={14} color="var(--accent)" aria-hidden="true" />
        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--c-text)' }}>Confiabilidade e contingência</span>
      </div>

      {/* Nível */}
      <p style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--c-text)', letterSpacing: '-0.02em', marginBottom: 14 }}>
        Baixa incerteza
      </p>

      {/* Barra IC 95% */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ position: 'relative', height: 6, borderRadius: 4, background: '#ece9e6', marginBottom: 6 }}>
          <div style={{
            position: 'absolute',
            left: '20%', right: '20%',
            height: '100%',
            borderRadius: 4,
            background: 'var(--accent)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '0.6875rem', color: 'var(--c-text-2)' }}>IC 95%: R$ 37,9 M</span>
          <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '0.6875rem', color: 'var(--c-text-2)' }}>R$ 39,1 M</span>
        </div>
      </div>

      <div className="conf-divider" />

      {/* Contingência */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
        <div>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--c-text)', marginBottom: 2 }}>Contingência aplicada</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--c-text-2)' }}>Síntese por Setor zero; por Atividade aplica 20%</p>
        </div>
        <span className="tag tag-line" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>A decidir</span>
      </div>

      <div className="conf-divider" />

      {/* Métodos de atualização */}
      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--c-text)', marginBottom: 10 }}>Métodos de atualização</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {UPDATE_METHODS.map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--c-text-2)' }}>{label}</span>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: '0.75rem', fontWeight: 600, color: 'var(--c-text)', whiteSpace: 'nowrap' }}>{value}</span>
          </div>
        ))}
        <p style={{ fontSize: '0.6875rem', color: 'var(--c-text-2)', marginTop: 4 }}>Método padrão a definir por projeto.</p>
      </div>
    </div>
  )
}
