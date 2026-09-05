import type { Lang } from './lang-context'

interface LandingT {
  navProduto: string
  navRelatorio: string
  navQuemUsa: string
  enter: string
  themeTitleLight: string
  themeTitleDark: string
  langFull: string

  heroTag: string
  heroTitulo: string
  heroParagrafo: string
  heroCheck1: string
  heroCheck2: string
  heroCheck3: string

  painelTitulo: string
  painelBadge: string
  painelProvisaoLabel: string
  painelProvisaoValor: string
  painelFaixaLabel: string
  painelFaixaValor: string
  painelCat: [string, string, string, string, string]
  painelVal: [string, string, string, string, string]
  painelNivel: string
  painelNivelValor: string
  painelDesembolso: string
  painelDesembolsoValor: string
  painelUltima: string
  painelUltimaValor: string
  painelNota: string

  kpi1Num: string
  kpi1Label: string
  kpi2Num: string
  kpi2Label: string
  kpi3Num: string
  kpi3Label: string
  kpi4Num: string
  kpi4Label: string

  secFuncoesTitulo: string
  secFuncoesKicker: string
  func1Titulo: string
  func1Desc: string
  func2Titulo: string
  func2Desc: string
  func3Titulo: string
  func3Desc: string
  func4Titulo: string
  func4Desc: string
  func5Titulo: string
  func5Desc: string
  conviteTitulo: string
  conviteDesc: string
  conviteCta: string

  entregTag: string
  entregTitulo: string
  entregParagrafo: string
  entregCheck1: string
  entregCheck2: string
  entregCheck3: string

  quem1Titulo: string
  quem1Desc: string
  quem2Titulo: string
  quem2Desc: string
  quem3Titulo: string
  quem3Desc: string

  depQuote: string
  depAuthor: string

  ctaFinalTitulo: string
  ctaFinalSub: string
  ctaFinalCta: string

  footTexto: string
}

export const landingT: Record<Lang, LandingT> = {
  'pt-BR': {
    navProduto: 'Produto',
    navRelatorio: 'Relatório',
    navQuemUsa: 'Quem usa',
    enter: 'Entrar',
    themeTitleLight: 'Ativar tema escuro',
    themeTitleDark: 'Ativar tema claro',
    langFull: 'Português (Brasil)',

    heroTag: 'Provisionamento de passivos ambientais',
    heroTitulo: 'Seu passivo ambiental, fora da planilha.',
    heroParagrafo:
      'A Be Planned reúne o levantamento de passivos ambientais, o provisionamento financeiro e o relatório que sua auditoria vai pedir — de fechamento de mina a qualquer obrigação de encerramento ou recuperação ambiental. Cada revisão fica registrada, datada e rastreável — sem versões circulando por e-mail.',
    heroCheck1: 'Faixa de incerteza explicitada, não um número solto',
    heroCheck2: 'Cada revisão publicada como versão fechada e rastreável',
    heroCheck3: 'Relatório do cliente pronto para entregar, sem anexos',

    painelTitulo: 'Amostra do painel',
    painelBadge: 'Rev1 · Vigente',
    painelProvisaoLabel: 'PROVISÃO ESPERADA',
    painelProvisaoValor: 'R$ 48,0 M',
    painelFaixaLabel: 'Faixa de confiança',
    painelFaixaValor: 'R$ 44,0–52,0 M',
    painelCat: ['Categoria A', 'Categoria B', 'Categoria C', 'Categoria D', 'Categoria E'],
    painelVal: ['18,00M', '12,60M', '7,20M', '5,04M', '3,24M'],
    painelNivel: 'Nível de incerteza',
    painelNivelValor: 'Baixo',
    painelDesembolso: 'Desembolso projetado',
    painelDesembolsoValor: '10 anos',
    painelUltima: 'Última revisão',
    painelUltimaValor: 'Abr/2026',
    painelNota: 'Ranking por categoria · dados ilustrativos',

    kpi1Num: '9',
    kpi1Label: 'Categorias de custo estruturadas',
    kpi2Num: '10',
    kpi2Label: 'Anos de desembolso projetado',
    kpi3Num: '4',
    kpi3Label: 'Métodos de atualização comparados',
    kpi4Num: '1',
    kpi4Label: 'Fonte da verdade por projeto',

    secFuncoesTitulo: 'O que a Be Planned faz',
    secFuncoesKicker: 'CINCO FUNÇÕES, UM FLUXO',
    func1Titulo: 'Cadastro de custos por categoria',
    func1Desc:
      'Cada item de passivo entra com sua faixa de custo, unidade e a fonte de referência que a sustenta. As categorias acompanham a estrutura da operação, e cada linha registra quem a preencheu.',
    func2Titulo: 'Provisão com faixa de incerteza',
    func2Desc:
      'O valor esperado vem acompanhado da faixa em que pode variar e do nível de confiança associado. Em vez de um número solto, a diretoria recebe um intervalo defensável — e sabe quais categorias mais pesam nessa incerteza.',
    func3Titulo: 'Valor presente e valor atualizado',
    func3Desc:
      'A provisão aparece na data-base do estudo e atualizada para o exercício corrente, com os principais métodos de correção lado a lado. Você escolhe a premissa; o relatório registra a escolha.',
    func4Titulo: 'Realizado contra planejado',
    func4Desc:
      'Conforme o projeto avança, os custos executados são lançados com comprovante e comparados ao que havia sido provisionado. O desvio aparece no ano em que aconteceu, por categoria.',
    func5Titulo: 'Revisões com trilha de auditoria',
    func5Desc:
      'Cada revisão é publicada como uma versão fechada: o que mudou, quando, e um registro de integridade que comprova depois que o documento não foi alterado. A revisão anterior continua consultável.',
    conviteTitulo: 'Do levantamento ao balanço',
    conviteDesc: 'Um único fluxo, de ponta a ponta, sem exportar para outra ferramenta no meio do caminho.',
    conviteCta: 'Começar agora',

    entregTag: 'Entregável',
    entregTitulo: 'Um relatório que se entrega sem anexos',
    entregParagrafo:
      'A versão para o cliente sai pronta: provisão consolidada, custo por categoria, faixa de confiança, desembolso ano a ano e a revisão vigente identificada. Sem navegação interna, sem planilha de apoio, imprimível como está.',
    entregCheck1: 'Provisão consolidada e faixa de confiança',
    entregCheck2: 'Desembolso projetado ano a ano',
    entregCheck3: 'Revisão vigente e data-base identificadas',

    quem1Titulo: 'Consultoria ambiental',
    quem1Desc:
      'Monta o levantamento, controla as revisões e emite o relatório de cada cliente a partir de uma base única — sem reconstruir a planilha a cada ciclo.',
    quem2Titulo: 'Empresas com passivo ambiental',
    quem2Desc:
      'Recebe a provisão que precisa levar ao balanço, com a faixa de incerteza explicitada e o histórico de como o número evoluiu entre exercícios.',
    quem3Titulo: 'Auditoria e controladoria',
    quem3Desc:
      'Consulta a revisão vigente, as premissas adotadas e a trilha de alterações sem depender de quem montou o cálculo estar disponível.',

    depQuote:
      'Antes, defender a provisão em auditoria era uma arqueologia de planilhas. Hoje é abrir a revisão vigente.',
    depAuthor: 'Cenário típico de auditoria',

    ctaFinalTitulo: 'Seu passivo ambiental merece mais que uma aba.',
    ctaFinalSub:
      'Um único fluxo, de ponta a ponta, com cada revisão publicada como versão fechada e a trilha de alterações preservada.',
    ctaFinalCta: 'Começar agora',

    footTexto: 'Be Planned — inteligência econômica para passivos ambientais.',
  },

  en: {
    navProduto: 'Product',
    navRelatorio: 'Report',
    navQuemUsa: 'Who uses it',
    enter: 'Sign in',
    themeTitleLight: 'Switch to dark theme',
    themeTitleDark: 'Switch to light theme',
    langFull: 'English',

    heroTag: 'Environmental liability provisioning',
    heroTitulo: 'Your environmental liability, out of the spreadsheet.',
    heroParagrafo:
      'Be Planned brings together environmental liability estimation, financial provisioning and the report your auditor will ask for — from mine closure to any decommissioning or remediation obligation. Every revision is recorded, dated and traceable — no versions circulating over e-mail.',
    heroCheck1: 'Uncertainty range made explicit, not a lone number',
    heroCheck2: 'Each revision published as a closed, traceable version',
    heroCheck3: 'Client report ready to hand over, no attachments',

    painelTitulo: 'Panel sample',
    painelBadge: 'Rev1 · Current',
    painelProvisaoLabel: 'EXPECTED PROVISION',
    painelProvisaoValor: 'R$ 48.0 M',
    painelFaixaLabel: 'Confidence range',
    painelFaixaValor: 'R$ 44.0–52.0 M',
    painelCat: ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'],
    painelVal: ['18.00M', '12.60M', '7.20M', '5.04M', '3.24M'],
    painelNivel: 'Uncertainty level',
    painelNivelValor: 'Low',
    painelDesembolso: 'Projected disbursement',
    painelDesembolsoValor: '10 years',
    painelUltima: 'Last revision',
    painelUltimaValor: 'Apr/2026',
    painelNota: 'Ranking by category · illustrative data',

    kpi1Num: '9',
    kpi1Label: 'Structured cost categories',
    kpi2Num: '10',
    kpi2Label: 'Years of projected disbursement',
    kpi3Num: '4',
    kpi3Label: 'Update methods compared',
    kpi4Num: '1',
    kpi4Label: 'Source of truth per project',

    secFuncoesTitulo: 'What Be Planned does',
    secFuncoesKicker: 'FIVE FUNCTIONS, ONE FLOW',
    func1Titulo: 'Cost registration by category',
    func1Desc:
      'Each liability item is entered with its cost range, unit and the reference source that supports it. Categories follow the operation structure, and every line records who filled it in.',
    func2Titulo: 'Provision with an uncertainty range',
    func2Desc:
      'The expected value comes with the range it may vary within and the associated confidence level. Instead of a lone number, the board receives a defensible interval — and knows which categories weigh most on that uncertainty.',
    func3Titulo: 'Present value and updated value',
    func3Desc:
      'The provision appears at the study base date and updated to the current fiscal year, with the main correction methods side by side. You choose the premise; the report records the choice.',
    func4Titulo: 'Actual versus planned',
    func4Desc:
      'As the project progresses, executed costs are recorded with supporting evidence and compared to what had been provisioned. The variance shows up in the year it happened, by category.',
    func5Titulo: 'Revisions with an audit trail',
    func5Desc:
      'Each revision is published as a closed version: what changed, when, and an integrity record that later proves the document was not altered. The previous revision remains consultable.',
    conviteTitulo: 'From estimation to the balance sheet',
    conviteDesc: 'A single flow, end to end, without exporting to another tool along the way.',
    conviteCta: 'Get started',

    entregTag: 'Deliverable',
    entregTitulo: 'A report that ships without attachments',
    entregParagrafo:
      'The client version comes ready: consolidated provision, cost by category, confidence range, year-by-year disbursement and the current revision identified. No internal navigation, no supporting spreadsheet, printable as is.',
    entregCheck1: 'Consolidated provision and confidence range',
    entregCheck2: 'Projected disbursement year by year',
    entregCheck3: 'Current revision and base date identified',

    quem1Titulo: 'Environmental consultancy',
    quem1Desc:
      'Builds the estimate, controls revisions and issues each client report from a single base — without rebuilding the spreadsheet every cycle.',
    quem2Titulo: 'Companies with environmental liability',
    quem2Desc:
      'Receives the provision to book on the balance sheet, with the uncertainty range made explicit and the history of how the number evolved between fiscal years.',
    quem3Titulo: 'Audit and controlling',
    quem3Desc:
      'Consults the current revision, the premises adopted and the change trail without depending on whoever built the calculation being available.',

    depQuote:
      'Before, defending the provision in an audit was spreadsheet archaeology. Today it is opening the current revision.',
    depAuthor: 'Typical audit scenario',

    ctaFinalTitulo: 'Your environmental liability deserves more than a tab.',
    ctaFinalSub:
      'A single flow, end to end, with each revision published as a closed version and the change trail preserved.',
    ctaFinalCta: 'Get started',

    footTexto: 'Be Planned — economic intelligence for environmental liabilities.',
  },

  es: {
    navProduto: 'Producto',
    navRelatorio: 'Informe',
    navQuemUsa: 'Quién lo usa',
    enter: 'Iniciar sesión',
    themeTitleLight: 'Activar tema oscuro',
    themeTitleDark: 'Activar tema claro',
    langFull: 'Español',

    heroTag: 'Aprovisionamiento de pasivos ambientales',
    heroTitulo: 'Tu pasivo ambiental, fuera de la planilla.',
    heroParagrafo:
      'Be Planned reúne el levantamiento de pasivos ambientales, el aprovisionamiento financiero y el informe que tu auditoría va a pedir — desde el cierre de mina hasta cualquier obligación de desmantelamiento o remediación ambiental. Cada revisión queda registrada, fechada y trazable — sin versiones circulando por correo.',
    heroCheck1: 'Rango de incertidumbre explícito, no un número suelto',
    heroCheck2: 'Cada revisión publicada como versión cerrada y trazable',
    heroCheck3: 'Informe del cliente listo para entregar, sin anexos',

    painelTitulo: 'Muestra del panel',
    painelBadge: 'Rev1 · Vigente',
    painelProvisaoLabel: 'APROVISIONAMIENTO ESPERADO',
    painelProvisaoValor: 'R$ 48,0 M',
    painelFaixaLabel: 'Rango de confianza',
    painelFaixaValor: 'R$ 44,0–52,0 M',
    painelCat: ['Categoría A', 'Categoría B', 'Categoría C', 'Categoría D', 'Categoría E'],
    painelVal: ['18,00M', '12,60M', '7,20M', '5,04M', '3,24M'],
    painelNivel: 'Nivel de incertidumbre',
    painelNivelValor: 'Bajo',
    painelDesembolso: 'Desembolso proyectado',
    painelDesembolsoValor: '10 años',
    painelUltima: 'Última revisión',
    painelUltimaValor: 'Abr/2026',
    painelNota: 'Ranking por categoría · datos ilustrativos',

    kpi1Num: '9',
    kpi1Label: 'Categorías de costo estructuradas',
    kpi2Num: '10',
    kpi2Label: 'Años de desembolso proyectado',
    kpi3Num: '4',
    kpi3Label: 'Métodos de actualización comparados',
    kpi4Num: '1',
    kpi4Label: 'Fuente de la verdad por proyecto',

    secFuncoesTitulo: 'Lo que hace Be Planned',
    secFuncoesKicker: 'CINCO FUNCIONES, UN FLUJO',
    func1Titulo: 'Registro de costos por categoría',
    func1Desc:
      'Cada ítem de pasivo entra con su rango de costo, unidad y la fuente de referencia que lo respalda. Las categorías acompañan la estructura de la operación, y cada línea registra quién la completó.',
    func2Titulo: 'Aprovisionamiento con rango de incertidumbre',
    func2Desc:
      'El valor esperado viene acompañado del rango en el que puede variar y del nivel de confianza asociado. En lugar de un número suelto, la dirección recibe un intervalo defendible — y sabe qué categorías pesan más en esa incertidumbre.',
    func3Titulo: 'Valor presente y valor actualizado',
    func3Desc:
      'El aprovisionamiento aparece en la fecha base del estudio y actualizado al ejercicio corriente, con los principales métodos de corrección lado a lado. Eliges la premisa; el informe registra la elección.',
    func4Titulo: 'Realizado contra planeado',
    func4Desc:
      'A medida que el proyecto avanza, los costos ejecutados se registran con comprobante y se comparan con lo que se había aprovisionado. El desvío aparece en el año en que sucedió, por categoría.',
    func5Titulo: 'Revisiones con pista de auditoría',
    func5Desc:
      'Cada revisión se publica como una versión cerrada: qué cambió, cuándo, y un registro de integridad que comprueba después que el documento no fue alterado. La revisión anterior sigue consultable.',
    conviteTitulo: 'Del levantamiento al balance',
    conviteDesc: 'Un único flujo, de punta a punta, sin exportar a otra herramienta en el camino.',
    conviteCta: 'Comenzar ahora',

    entregTag: 'Entregable',
    entregTitulo: 'Un informe que se entrega sin anexos',
    entregParagrafo:
      'La versión para el cliente sale lista: aprovisionamiento consolidado, costo por categoría, rango de confianza, desembolso año a año y la revisión vigente identificada. Sin navegación interna, sin planilla de apoyo, imprimible tal cual.',
    entregCheck1: 'Aprovisionamiento consolidado y rango de confianza',
    entregCheck2: 'Desembolso proyectado año a año',
    entregCheck3: 'Revisión vigente y fecha base identificadas',

    quem1Titulo: 'Consultoría ambiental',
    quem1Desc:
      'Arma el levantamiento, controla las revisiones y emite el informe de cada cliente desde una base única — sin reconstruir la planilla cada ciclo.',
    quem2Titulo: 'Empresas con pasivo ambiental',
    quem2Desc:
      'Recibe el aprovisionamiento que necesita llevar al balance, con el rango de incertidumbre explícito y el histórico de cómo evolucionó el número entre ejercicios.',
    quem3Titulo: 'Auditoría y controlling',
    quem3Desc:
      'Consulta la revisión vigente, las premisas adoptadas y la pista de cambios sin depender de que quien armó el cálculo esté disponible.',

    depQuote:
      'Antes, defender el aprovisionamiento en auditoría era una arqueología de planillas. Hoy es abrir la revisión vigente.',
    depAuthor: 'Escenario típico de auditoría',

    ctaFinalTitulo: 'Tu pasivo ambiental merece más que una pestaña.',
    ctaFinalSub:
      'Un único flujo, de punta a punta, con cada revisión publicada como versión cerrada y la pista de cambios preservada.',
    ctaFinalCta: 'Comenzar ahora',

    footTexto: 'Be Planned — inteligencia económica para pasivos ambientales.',
  },
}
