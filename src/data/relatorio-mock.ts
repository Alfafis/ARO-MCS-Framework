import type { CostCategory, CostTotals, FanPoint, DisbursementCategory } from '@/types/relatorio'

export type PhaseKey = 'pre' | 'closure' | 'post' | 'provision'

export interface Phase {
  key:   PhaseKey
  value: number
}

// Fonte: Khaled 1 Provisionamento_Financeiro_NX_Gold — agrupado por categoria
// pre: Estudos (9.538.620) + Cavas (2.534.515)
// closure: Pilhas (1.891.990) + Barragens (451.017) + Planta (921.235) + Áreas (4.178.430) + Demolição (4.795.201)
// post: Monitoramento (12.586.441)
// provision: 20% do total sem provisão (36.897.449)
export const MOCK_PHASES: Phase[] = [
  { key: 'pre',       value: 12_073_135 },
  { key: 'closure',   value: 12_237_873 },
  { key: 'post',      value: 12_586_441 },
  { key: 'provision', value:  7_379_490 },
]

export const MOCK_CATEGORIES: CostCategory[] = [
  { rank: '01', name: 'Estudos',               min: '6,55M',  max: '9,10M',  updated: '9,54M',  phase: 'pre'     },
  { rank: '02', name: 'Cavas',                 min: '2,27M',  max: '2,42M',  updated: '2,53M',  phase: 'pre'     },
  { rank: '03', name: 'Pilhas de Estéril',     min: '1,72M',  max: '1,80M',  updated: '1,89M',  phase: 'closure' },
  { rank: '04', name: 'Barragens',             min: '0,41M',  max: '0,43M',  updated: '0,45M',  phase: 'closure' },
  { rank: '05', name: 'Planta Industrial',     min: '0,84M',  max: '0,88M',  updated: '0,92M',  phase: 'closure' },
  { rank: '06', name: 'Áreas de Apoio',        min: '3,79M',  max: '3,99M',  updated: '4,18M',  phase: 'closure' },
  { rank: '07', name: 'Demolição Estr. Civis', min: '4,44M',  max: '4,57M',  updated: '4,80M',  phase: 'closure' },
  { rank: '08', name: 'Monitoramento',         min: '9,59M',  max: '12,01M', updated: '12,59M', phase: 'post'    },
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
