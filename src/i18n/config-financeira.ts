import type { Lang } from './LangContext'

export const configFinanceiraT: Record<
  Lang,
  {
    labelMoeda: string
    labelDataBase: string
    labelAnoReferencia: string
    helpAnoReferencia: string
    labelHorizonte: string
    helpHorizonte: string
    labelMetodo: string
    helpMetodo: string
    labelContingencia: string
    metodoADefinir: string
    metodoSimples: string
    metodoCompostos: string
    metodoInflacao: string
    metodoEscalonamento: string
    savedToast: string
    saveErrorToast: string
    valorInvalidoToast: string
  }
> = {
  'pt-BR': {
    labelMoeda: 'Moeda',
    labelDataBase: 'Data base (ano)',
    labelAnoReferencia: 'Ano de referência dos valores',
    helpAnoReferencia:
      'Ano em que os valores dos itens de custo foram digitados. Se carregou um template com valores de anos anteriores, ajuste aqui — o sistema aplica a ancoragem IPCA até a data base. Se digitou os valores hoje, mantenha o ano atual — sem ancoragem.',
    labelHorizonte: 'Horizonte (anos)',
    helpHorizonte: 'Quantos anos o fechamento leva — usado no cálculo de atualização financeira.',
    labelMetodo: 'Método de atualização',
    helpMetodo: 'Informativo — os 4 métodos continuam calculados e comparados juntos no relatório.',
    labelContingencia: 'Contingência (%)',
    metodoADefinir: 'A definir',
    metodoSimples: 'Juros simples',
    metodoCompostos: 'Juros compostos',
    metodoInflacao: 'Inflação constante',
    metodoEscalonamento: 'Escalonamento (IPCA variável)',
    savedToast: 'Configuração salva.',
    saveErrorToast: 'Não foi possível salvar.',
    valorInvalidoToast: 'Valor inválido.',
  },
  en: {
    labelMoeda: 'Currency',
    labelDataBase: 'Base year',
    labelAnoReferencia: 'Reference year of values',
    helpAnoReferencia:
      'Year in which the cost item values were entered. If you loaded a template with values from earlier years, adjust here — the system applies CPI anchoring up to the base year. If you entered the values today, keep the current year — no anchoring.',
    labelHorizonte: 'Horizon (years)',
    helpHorizonte: 'How many years the closure takes — used in the financial escalation calculation.',
    labelMetodo: 'Update method',
    helpMetodo: 'Informational — all 4 methods keep being calculated and compared together in the report.',
    labelContingencia: 'Contingency (%)',
    metodoADefinir: 'To be defined',
    metodoSimples: 'Simple interest',
    metodoCompostos: 'Compound interest',
    metodoInflacao: 'Constant inflation',
    metodoEscalonamento: 'Escalation (variable CPI)',
    savedToast: 'Configuration saved.',
    saveErrorToast: 'Could not save.',
    valorInvalidoToast: 'Invalid value.',
  },
  es: {
    labelMoeda: 'Moneda',
    labelDataBase: 'Año base',
    labelAnoReferencia: 'Año de referencia de los valores',
    helpAnoReferencia:
      'Año en que se ingresaron los valores de los ítems de costo. Si cargó una plantilla con valores de años anteriores, ajuste aquí — el sistema aplica el anclaje IPCA hasta el año base. Si ingresó los valores hoy, mantenga el año actual — sin anclaje.',
    labelHorizonte: 'Horizonte (años)',
    helpHorizonte: 'Cuántos años lleva el cierre — usado en el cálculo de actualización financiera.',
    labelMetodo: 'Método de actualización',
    helpMetodo: 'Informativo — los 4 métodos se siguen calculando y comparando juntos en el informe.',
    labelContingencia: 'Contingencia (%)',
    metodoADefinir: 'A definir',
    metodoSimples: 'Interés simple',
    metodoCompostos: 'Interés compuesto',
    metodoInflacao: 'Inflación constante',
    metodoEscalonamento: 'Escalonamiento (IPCA variable)',
    savedToast: 'Configuración guardada.',
    saveErrorToast: 'No se pudo guardar.',
    valorInvalidoToast: 'Valor inválido.',
  },
}
