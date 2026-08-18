import type { CostCategory, CostTotals, FanPoint, DisbursementCategory } from '@/types/relatorio'

export interface Phase {
  name:        string
  description: string
  value:       number
}

// Fonte: Khaled 1 Provisionamento_Financeiro_NX_Gold — aba "9. Síntese Por Atividade"
export const MOCK_PHASES: Phase[] = [
  { name: 'Pré-Fechamento',  description: 'Estudos e planejamento',        value:  2_306_040 },
  { name: 'Fechamento',      description: 'Execução física',                value: 18_911_818 },
  { name: 'Pós-Fechamento',  description: 'Monitoramento (anos 7–10)',     value: 12_586_441 },
  { name: 'Provisão 20%',    description: 'Margem de segurança financeira', value:  7_390_181 },
]

export const MOCK_CATEGORIES: CostCategory[] = [
  { rank: '01', name: 'Estudos',               min: '6,55M',  max: '9,10M',  updated: '9,54M'  },
  { rank: '02', name: 'Cavas',                 min: '2,27M',  max: '2,42M',  updated: '2,53M'  },
  { rank: '03', name: 'Pilhas de Estéril',      min: '1,72M',  max: '1,80M',  updated: '1,89M'  },
  { rank: '04', name: 'Barragens',             min: '0,41M',  max: '0,43M',  updated: '0,45M'  },
  { rank: '05', name: 'Planta Industrial',     min: '0,84M',  max: '0,88M',  updated: '0,92M'  },
  { rank: '06', name: 'Áreas de Apoio',        min: '3,79M',  max: '3,99M',  updated: '4,18M'  },
  { rank: '07', name: 'Demolição Estr. Civis', min: '4,44M',  max: '4,57M',  updated: '4,80M'  },
  { rank: '08', name: 'Monitoramento',         min: '9,59M',  max: '12,01M', updated: '12,59M' },
]

export const MOCK_TOTALS: CostTotals = {
  min: '29,61M',
  max: '35,20M',
  updated: '36,90M',
}

export const MOCK_DISBURSEMENT_VALUES = [
  'R$ 0', '471,7k', '314,5k', '1,52M', '4,42M',
  '14,91M', '3,15M', '3,15M', '3,15M', '3,15M',
]

export const MOCK_DISBURSEMENT_BY_CATEGORY: DisbursementCategory[] = [
  { name: 'Estudos',               values: [null, '471,7k', '314,5k', '1,52M',  '1,57M',  '2,99M',  null,    null,    null,    null   ] },
  { name: 'Cavas',                 values: [null, null,     null,     null,      null,      '2,53M',  null,    null,    null,    null   ] },
  { name: 'Pilhas de Estéril',     values: [null, null,     null,     null,      null,      '1,89M',  null,    null,    null,    null   ] },
  { name: 'Barragens',             values: [null, null,     null,     null,      null,      '451k',   null,    null,    null,    null   ] },
  { name: 'Planta Industrial',     values: [null, null,     null,     null,      null,      '921,2k', null,    null,    null,    null   ] },
  { name: 'Áreas de Apoio',        values: [null, null,     null,     null,      '1,65M',   '2,53M',  null,    null,    null,    null   ] },
  { name: 'Demolição Estr. Civis', values: [null, null,     null,     null,      '1,20M',   '3,60M',  null,    null,    null,    null   ] },
  { name: 'Monitoramento',         values: [null, null,     null,     null,      null,      null,     '3,15M', '3,15M', '3,15M', '3,15M'] },
]

export const MOCK_METHOD_VALUES = [
  'R$ 84.172.705',
  'R$ 112.613.519',
  'R$ 56.670.699',
  'R$ 55.175.062',
]

export const MOCK_RISK_METRIC_VALUES = [
  'R$ 32.383.330',
  'R$ 1.609.055',
  'R$ 33.751.817',
  '25,19%',
]

const FAN_CV  = 0.0497
const FAN_MAX = 34.236
const FAN_CUM = [0, 0.4717, 0.7862, 2.3062, 6.726, 21.636, 24.786, 27.936, 31.086, 34.236]

export function buildFanData(labels: string[], cv = FAN_CV): FanPoint[] {
  return FAN_CUM.map((cum, i) => ({
    label: labels[i],
    low:   Math.max(0, (cum * (1 - cv) / FAN_MAX) * 100),
    band:  Math.max(cum > 0 ? 1 : 0, (cum * cv * 2 / FAN_MAX) * 100),
  }))
}
