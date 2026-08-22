export interface TipoProjeto {
  id:   string
  nome: string
}

export const TIPOS_PROJETO: TipoProjeto[] = [
  { id: 'fechamento-mina', nome: 'Fechamento de Mina (ARO)' },
  { id: 'ambiental',       nome: 'Ambiental' },
  { id: 'outro',           nome: 'Outro' },
]

// Blueprint de categoria/item sem id — id é gerado na hora de clonar pra dentro de um projeto.
export interface ItemBlueprint {
  name:           string
  unit:           string
  min:            string
  max:            string
  source:         string
  aplicabilidade: string
  anoPrevisto:    string
}

export interface CategoryBlueprint {
  // Chave estável — nunca muda mesmo se o nome de exibição (no catálogo) for renomeado.
  // É o que liga um blueprint de template à entrada certa do catálogo.
  catalogoKey: string
  name:     string
  preenche: 'Consultor' | 'Ambos'
  items:    ItemBlueprint[]
}

// Seed real: planilha "Khaled 1 Provisionamento_Financeiro_NX_Gold" (docs/), 8 setores.
// Cada categoria vira 1 item-síntese (min/max já consolidados) — detalhar por item de
// composição de custo é trabalho de captura futura, não bloqueia o cadastro agora.
const FECHAMENTO_MINA: CategoryBlueprint[] = [
  {
    catalogoKey: 'estudos', name: 'Estudos', preenche: 'Consultor',
    items: [{ name: 'Estudos e ações gerais — Fase de Pré-Fechamento', unit: 'verba', min: 'R$ 6.550.000', max: 'R$ 9.100.000', source: 'SINAPI 2021', aplicabilidade: 'Todos os setores', anoPrevisto: 'Anos 2–6' }],
  },
  {
    catalogoKey: 'cavas', name: 'Cavas', preenche: 'Consultor',
    items: [{ name: 'Recuperação de cavas', unit: 'verba', min: 'R$ 2.272.500', max: 'R$ 2.418.000', source: 'Brandt Meio Amb.', aplicabilidade: 'Setor 7', anoPrevisto: 'Ano 6' }],
  },
  {
    catalogoKey: 'pilhas-esteril', name: 'Pilhas de Estéril', preenche: 'Consultor',
    items: [{ name: 'Recuperação de pilhas de estéril', unit: 'verba', min: 'R$ 1.718.800', max: 'R$ 1.805.500', source: 'Brandt Meio Amb.', aplicabilidade: 'Setor 2', anoPrevisto: 'Ano 6' }],
  },
  {
    catalogoKey: 'barragem', name: 'Barragem', preenche: 'Ambos',
    items: [
      { name: 'Descomissionamento estrutural', unit: 'm²',    min: 'R$ 2.100.000', max: 'R$ 3.050.000', source: 'SINAPI 2021',     aplicabilidade: 'Setor 1', anoPrevisto: 'Ano 6' },
      { name: 'Recomposição de talude',         unit: 'm²',    min: 'R$ 1.400.000', max: 'R$ 2.100.000', source: 'Brandt Meio Amb.', aplicabilidade: 'Setor 1', anoPrevisto: 'Ano 6' },
      { name: 'Monitoramento pós-obra',         unit: 'verba', min: 'R$ 900.000',   max: 'R$ 1.350.000', source: 'SINAPI 2021',     aplicabilidade: 'Setor 1', anoPrevisto: 'Anos 7–10' },
    ],
  },
  {
    catalogoKey: 'planta-industrial', name: 'Planta Industrial', preenche: 'Consultor',
    items: [{ name: 'Desmontagem da planta industrial', unit: 'verba', min: 'R$ 840.600', max: 'R$ 878.900', source: 'SINAPI 2021', aplicabilidade: 'Setor 3', anoPrevisto: 'Ano 6' }],
  },
  {
    catalogoKey: 'areas-apoio', name: 'Áreas de Apoio', preenche: 'Consultor',
    items: [{ name: 'Desmobilização de áreas de apoio', unit: 'verba', min: 'R$ 3.788.800', max: 'R$ 3.986.300', source: 'SINAPI 2021', aplicabilidade: 'Setor 4, 6, 8, 9', anoPrevisto: 'Anos 5–6' }],
  },
  {
    catalogoKey: 'demolicao-civis', name: 'Demolição Estr. Civis', preenche: 'Consultor',
    items: [{ name: 'Demolição de estruturas civis', unit: 'm²', min: 'R$ 4.437.700', max: 'R$ 4.574.600', source: 'SINAPI 2021', aplicabilidade: 'Setor 4, 5, 6, 7, 8, 9', anoPrevisto: 'Anos 5–6' }],
  },
  {
    catalogoKey: 'monitoramento', name: 'Monitoramento', preenche: 'Ambos',
    items: [{ name: 'Monitoramento pós-fechamento', unit: 'verba', min: 'R$ 9.589.100', max: 'R$ 12.007.700', source: 'SINAPI 2021', aplicabilidade: 'Todos os setores', anoPrevisto: 'Anos 7–10' }],
  },
]

export const CATEGORIA_TEMPLATES: Record<string, CategoryBlueprint[]> = {
  'fechamento-mina': FECHAMENTO_MINA,
  ambiental: [],
  outro:     [],
}
