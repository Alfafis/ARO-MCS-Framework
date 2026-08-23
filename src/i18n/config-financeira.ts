import type { Lang } from './LangContext'

export const configFinanceiraT: Record<Lang, {
  labelMoeda:        string
  labelDataBase:     string
  labelHorizonte:    string
  helpHorizonte:     string
  labelMetodo:       string
  helpMetodo:        string
  labelContingencia: string
  metodoADefinir:    string
  metodoSimples:     string
  metodoCompostos:   string
  metodoInflacao:    string
  metodoEscalonamento: string
  savedToast:        string
  saveErrorToast:    string
  valorInvalidoToast: string
}> = {
  'pt-BR': {
    labelMoeda:        'Moeda',
    labelDataBase:     'Data base (ano)',
    labelHorizonte:    'Horizonte (anos)',
    helpHorizonte:     'Quantos anos o fechamento leva — usado no cálculo de atualização financeira.',
    labelMetodo:       'Método de atualização',
    helpMetodo:        'Informativo — os 4 métodos continuam calculados e comparados juntos no relatório.',
    labelContingencia: 'Contingência (%)',
    metodoADefinir:    'A definir',
    metodoSimples:     'Juros simples',
    metodoCompostos:   'Juros compostos',
    metodoInflacao:    'Inflação constante',
    metodoEscalonamento: 'Escalonamento (IPCA variável)',
    savedToast:        'Configuração salva.',
    saveErrorToast:    'Não foi possível salvar.',
    valorInvalidoToast: 'Valor inválido.',
  },
  'en': {
    labelMoeda:        'Currency',
    labelDataBase:     'Base year',
    labelHorizonte:    'Horizon (years)',
    helpHorizonte:     'How many years the closure takes — used in the financial escalation calculation.',
    labelMetodo:       'Update method',
    helpMetodo:        'Informational — all 4 methods keep being calculated and compared together in the report.',
    labelContingencia: 'Contingency (%)',
    metodoADefinir:    'To be defined',
    metodoSimples:     'Simple interest',
    metodoCompostos:   'Compound interest',
    metodoInflacao:    'Constant inflation',
    metodoEscalonamento: 'Escalation (variable CPI)',
    savedToast:        'Configuration saved.',
    saveErrorToast:    'Could not save.',
    valorInvalidoToast: 'Invalid value.',
  },
  'es': {
    labelMoeda:        'Moneda',
    labelDataBase:     'Año base',
    labelHorizonte:    'Horizonte (años)',
    helpHorizonte:     'Cuántos años lleva el cierre — usado en el cálculo de actualización financiera.',
    labelMetodo:       'Método de actualización',
    helpMetodo:        'Informativo — los 4 métodos se siguen calculando y comparando juntos en el informe.',
    labelContingencia: 'Contingencia (%)',
    metodoADefinir:    'A definir',
    metodoSimples:     'Interés simple',
    metodoCompostos:   'Interés compuesto',
    metodoInflacao:    'Inflación constante',
    metodoEscalonamento: 'Escalonamiento (IPCA variable)',
    savedToast:        'Configuración guardada.',
    saveErrorToast:    'No se pudo guardar.',
    valorInvalidoToast: 'Valor inválido.',
  },
}
