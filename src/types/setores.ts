// Fase do planejamento de fechamento de mina. Deriva da coluna "Fase do
// planejamento" da aba "9. Síntese Por Atividade" da planilha NX Gold.
// "Provisionamento (20%)" da planilha NÃO é uma fase — é contingência
// aplicada em cima do total, tratada separadamente em `projetos.contingencia_pct`.
export type Fase = 'pre-fechamento' | 'fechamento' | 'pos-fechamento'

export const FASE_LABEL: Record<Fase, string> = {
  'pre-fechamento':  'Pré-fechamento',
  fechamento:        'Fechamento',
  'pos-fechamento':  'Pós-fechamento',
}

// Setor da mina — área física/funcional. Lookup no banco (`public.setores`),
// mas o frontend recebe hidratado via ProjetoContext. IDs preservam a
// numeração original da planilha.
export interface Setor {
  id:   number   // 1..99, seed inicial 1..9
  nome: string
}

// Range de execução do item ao longo do horizonte do projeto.
// - anoInicio = anoFim  → item executado em um ano único
// - anoInicio < anoFim  → item distribuído/contínuo entre esses anos
// - ambos null          → ano não definido (equivalente ao "A definir" do UI legado)
export interface AnoRange {
  anoInicio: number | null   // 1..20
  anoFim:    number | null   // 1..20
}
