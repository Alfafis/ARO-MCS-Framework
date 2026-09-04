import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type {
  Category,
  CategoryItem,
  CategoriaCatalogo,
  CampoOperacional,
  CampoOperacionalTemplate,
} from '@/types/categorias'
import type { Cliente, Projeto } from '@/types/clientes'
import type {
  ParametroGlobal,
  ParametroGlobalChave,
  ParametroAnual,
  ParametroAnualChave,
} from '@/types/parametrosGlobais'
import { mapParametroGlobalRow, mapParametroAnualRow } from '@/types/parametrosGlobais'
import type { TipoProjeto } from '@/types/tiposProjeto'
import type { Setor } from '@/types/setores'
import type { CategoriaRemediacao, ItemRemediacao, CategoriaRemediacaoRow, ItemRemediacaoRow } from '@/types/remediacao'
import { mapCategoriaRemediacaoRow, mapItemRemediacaoRow } from '@/types/remediacao'
import { parseMoedaBR, formatMoedaCompact, valorEsperadoNumerico } from '@/lib/financeiro'
import { formatRelativeTime } from '@/lib/utils'
import { mapItemCustoRow, mapCampoOperacionalRow, mapCampoOperacionalTemplateRow } from '@/lib/categoriaMappers'
import { supabase } from '@/integrations/supabase/client'
import type {
  ProjetoDbRow,
  ItemCustoRow,
  CategoriaProjetoRow,
  CategoriaCatalogoRow,
  AddCategoriaReturns,
  CarregarTemplateExemploItem,
  CategoriaTemplateRow,
  ItemTemplateRow,
  TemplateAddCategoriaReturns,
  DesembolsoItemAnoRow,
  DesembolsoItemTemplateAnoRow,
  CampoOperacionalRow,
} from '@/types'
import { ProjetoContext } from './projeto-context'
import type { ConfigFinanceiraForm, NovoProjetoForm } from './projeto-context'

export type { ConfigFinanceiraForm }

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('')
}

function estimateTotal(categorias: Category[]): string {
  const total = valorEsperadoNumerico(categorias)
  if (total === 0) return '—'
  return formatMoedaCompact(total)
}

// Campo do item → chave que a RPC update_item_custo espera no patch jsonb.
// As chaves novas (aplicabilidadeSetores/fase/anoInicio/anoFim) exigem que
// a RPC seja estendida — ver "Pendente" no cabeçalho da migration
// 20260824120000_setores_fase_ano.sql.
const ITEM_FIELD_TO_PATCH_KEY: Record<keyof CategoryItem, string> = {
  id: 'id', // nunca enviado — id não é editável
  name: 'nome',
  unit: 'unidade',
  min: 'custoMin',
  max: 'custoMax',
  source: 'fonte',
  aplicabilidadeSetores: 'aplicabilidadeSetores',
  fase: 'fase',
  anoInicio: 'anoInicio',
  anoFim: 'anoFim',
  // legado (transitório)
  aplicabilidade: 'aplicabilidade',
  anoPrevisto: 'anoPrevisto',
  // desembolsoPorAno tem RPC própria (update_item_desembolso) — não entra em
  // update_item_custo. Mantemos aqui só pra fechar o Record; nunca é enviado.
  desembolsoPorAno: 'desembolsoPorAno',
  // Motor de fórmula (migration 20260903150000/151500) — mesmo padrão de
  // save-on-blur dos outros campos, chave presente com null explícito zera.
  custoUnitarioMin: 'custoUnitarioMin',
  custoUnitarioMax: 'custoUnitarioMax',
  formulaQuantidade: 'formulaQuantidade',
}

type ProjetoRowComCategorias = ProjetoDbRow & {
  categorias_projeto?: (CategoriaProjetoRow & {
    categorias_catalogo: CategoriaCatalogoRow
    itens_custo: (ItemCustoRow & { desembolso_item_ano?: DesembolsoItemAnoRow[] | null })[]
    campos_operacionais?: CampoOperacionalRow[] | null
  })[]
}

type CampoOperacionalTemplateRow = {
  id: string
  label: string
  unidade: string | null
  valor_referencia: string | null
  ordem: number
  formula: string | null
}

type CategoriaTemplateRowComItens = CategoriaTemplateRow & {
  categorias_catalogo: CategoriaCatalogoRow
  itens_template: (ItemTemplateRow & { desembolso_item_template_ano?: DesembolsoItemTemplateAnoRow[] | null })[]
  campos_operacionais_template?: CampoOperacionalTemplateRow[]
}

// Mesmo shape de tela do projeto real (Category). camposOperacionais (por
// projeto, com status pendente/preenchido) fica vazio no template — o
// template usa `camposOperacionaisTemplate` (só label/unidade/valor_ref).
function mapRowToTemplateCategoria(row: CategoriaTemplateRowComItens): Category {
  return {
    id: row.id,
    catalogoId: row.catalogo_id,
    preenche: row.preenche as Category['preenche'],
    expanded: false,
    justAdded: false,
    items: row.itens_template.map(mapItemCustoRow),
    camposOperacionais: [],
    camposOperacionaisTemplate: (row.campos_operacionais_template ?? [])
      .slice()
      .sort((a, b) => a.ordem - b.ordem)
      .map(mapCampoOperacionalTemplateRow),
    custoProvavel: row.custo_provavel,
  }
}

// Junta categorias_projeto/categorias_catalogo/itens_custo num só round-trip
// (embed do PostgREST via FK) — sem isso, projeto recarregado (F5) mostrava
// "sem categorias" mesmo com dado real no banco: a busca de projeto nunca
// buscava a árvore de categoria, só a casca.
function mapRowToProjeto(row: ProjetoRowComCategorias): Projeto {
  const categorias: Category[] = (row.categorias_projeto ?? [])
    .sort((a, b) => a.ordem - b.ordem)
    .map((cp) => ({
      id: cp.id,
      catalogoId: cp.catalogo_id,
      preenche: cp.preenche as Category['preenche'],
      expanded: false,
      justAdded: false,
      items: cp.itens_custo.map(mapItemCustoRow),
      camposOperacionais: (cp.campos_operacionais ?? [])
        .slice()
        .sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime())
        .map(mapCampoOperacionalRow),
      custoProvavel: cp.custo_provavel,
    }))
  return {
    id: row.id,
    clienteId: row.cliente_id,
    projeto: row.nome,
    status: row.status as Projeto['status'],
    rev: row.rev,
    esperado: estimateTotal(categorias),
    atualizado: formatRelativeTime(row.atualizado_em),
    atualizadoEm: row.atualizado_em,
    highlight: false,
    tipoProjetoId: row.tipo_projeto_id,
    moeda: row.moeda,
    dataBase: row.data_base,
    horizonteAnos: row.horizonte_anos,
    metodoAtualizacao: row.metodo_atualizacao,
    contingenciaPct: row.contingencia_pct,
    remediacaoHabilitada: (row as unknown as { remediacao_habilitada?: boolean }).remediacao_habilitada ?? false,
    categorias,
  }
}

export function ProjetoProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [tiposProjeto, setTiposProjeto] = useState<TipoProjeto[]>([])
  const [catalogo, setCatalogo] = useState<CategoriaCatalogo[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [parametrosGlobais, setParametrosGlobais] = useState<ParametroGlobal[]>([])
  const [parametrosAnuais, setParametrosAnuais] = useState<ParametroAnual[]>([])
  const [tiposComTemplate, setTiposComTemplate] = useState<string[]>([])
  const [templates, setTemplates] = useState<Record<string, Category[]>>({})
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [remediacaoByProjeto, setRemediacaoByProjeto] = useState<Record<string, CategoriaRemediacao[]>>({})
  const [remediacaoLoading, setRemediacaoLoading] = useState(false)

  // 4 fetches disparados em paralelo (nenhum await sequencial) — Promise.allSettled só
  // marca o boot como concluído, não serializa as chamadas em si.
  //
  // Depende de onAuthStateChange, não de mount puro: ProjetoProvider já monta em
  // /login (acima do gate de auth em App.tsx), então um `useEffect(() => {...}, [])`
  // dispara esse fetch com a request ainda anônima (RLS default-deny devolve [] sem
  // erro), e login subsequente não remonta o provider — sem esse listener, o
  // dashboard ficava preso no snapshot vazio pelo resto da sessão SPA (só um F5,
  // que já carrega a sessão do localStorage antes do fetch, mostrava dado real).
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) return
      fetchAll()
    })
    return () => subscription.unsubscribe()
  }, [])

  function fetchAll() {
    const fetchClientes = supabase
      .from('clientes')
      .select('id, nome')
      .order('nome')
      .then(({ data, error }) => {
        if (error || !data) return
        setClientes(data.map((c) => ({ id: c.id, nome: c.nome, initials: initials(c.nome) })))
      })
    const fetchTipos = supabase
      .from('tipos_projeto')
      .select('id, nome')
      .order('nome')
      .then(({ data, error }) => {
        if (error || !data) return
        setTiposProjeto(data)
      })
    const fetchProjetos = supabase
      .from('projetos')
      .select(
        '*, categorias_projeto(*, categorias_catalogo(*), itens_custo(*, desembolso_item_ano(*)), campos_operacionais(*))'
      )
      .order('criado_em')
      .then(({ data, error }) => {
        if (error || !data) return
        setProjetos((data as unknown as ProjetoRowComCategorias[]).map(mapRowToProjeto))
      })
    const fetchCatalogo = supabase
      .from('categorias_catalogo')
      .select('id, nome')
      .order('nome')
      .then(({ data, error }) => {
        if (error || !data) return
        setCatalogo(data)
      })
    // Setores é lookup pequeno (10 seeds), pode carregar tudo no boot sem
    // paginação — usado pelo multi-select de aplicabilidade em CategoryBlock.
    const fetchSetores = supabase
      .from('setores')
      .select('id, nome')
      .order('id')
      .then(({ data, error }) => {
        if (error || !data) return
        setSetores(data.map((s) => ({ id: s.id, nome: s.nome })))
      })
    const fetchParametrosGlobais = supabase
      .from('parametros_globais')
      .select('*')
      .then(({ data, error }) => {
        if (error || !data) return
        setParametrosGlobais(data.map(mapParametroGlobalRow))
      })
    const fetchParametrosAnuais = supabase
      .from('parametros_anuais')
      .select('*')
      .then(({ data, error }) => {
        if (error || !data) return
        setParametrosAnuais(data.map(mapParametroAnualRow))
      })
    // Só o id do tipo — pra saber quais tipos têm template administrado sem
    // carregar categoria+item de todo mundo no boot (Configuracoes busca o
    // detalhe sob demanda via fetchTemplateCategorias).
    const fetchTiposComTemplate = supabase
      .from('categorias_template')
      .select('tipo_projeto_id')
      .then(({ data, error }) => {
        if (error || !data) return
        setTiposComTemplate([...new Set(data.map((r) => r.tipo_projeto_id))])
      })

    Promise.allSettled([
      fetchClientes,
      fetchTipos,
      fetchProjetos,
      fetchCatalogo,
      fetchSetores,
      fetchParametrosGlobais,
      fetchParametrosAnuais,
      fetchTiposComTemplate,
    ]).then(() => setLoading(false))
  }

  const criarCliente = useCallback(async (nome: string): Promise<string> => {
    const { data, error } = await supabase.rpc('create_cliente', { p_nome: nome })
    if (error || !data) throw error ?? new Error('Falha ao criar cliente')
    setClientes((prev) =>
      prev.some((c) => c.id === data.id)
        ? prev
        : [...prev, { id: data.id, nome: data.nome, initials: initials(data.nome) }]
    )
    return data.id
  }, [])

  // Dedup por nome vive na RPC (mesmo padrão de create_cliente) — chamar de
  // novo com nome repetido devolve a linha existente, nunca duplica.
  const criarTipoProjeto = useCallback(async (nome: string): Promise<TipoProjeto> => {
    const { data, error } = await supabase.rpc('criar_tipo_projeto', { p_nome: nome })
    if (error || !data) throw error ?? new Error('Falha ao criar tipo de projeto')
    setTiposProjeto((prev) =>
      prev.some((t) => t.id === data.id) ? prev : [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome))
    )
    return data
  }, [])

  const renomearTipoProjeto = useCallback(async (id: string, novoNome: string) => {
    const { data, error } = await supabase.rpc('renomear_tipo_projeto', { p_id: id, p_novo_nome: novoNome })
    if (error || !data) throw error ?? new Error('Falha ao renomear tipo de projeto')
    setTiposProjeto((prev) => prev.map((t) => (t.id === id ? data : t)).sort((a, b) => a.nome.localeCompare(b.nome)))
  }, [])

  const removerTipoProjeto = useCallback(async (id: string) => {
    const { error } = await supabase.rpc('remover_tipo_projeto', { p_id: id })
    if (error) throw error
    setTiposProjeto((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Rename é global — colisão de nome no catálogo sobe como erro (unique
  // index), caller decide o que mostrar. Nunca engolir aqui.
  const renomearCategoriaCatalogo = useCallback(async (catalogoId: string, novoNome: string) => {
    const { data, error } = await supabase.rpc('renomear_categoria_catalogo', {
      p_id: catalogoId,
      p_novo_nome: novoNome,
    })
    if (error || !data) throw error ?? new Error('Falha ao renomear categoria')
    setCatalogo((prev) => prev.map((c) => (c.id === catalogoId ? { id: data.id, nome: data.nome } : c)))
  }, [])

  const atualizarParametroGlobal = useCallback(
    async (chave: ParametroGlobalChave, valor: number, fonte: ParametroGlobal['fonte'], serieBcb: number | null) => {
      const { data, error } = await supabase.rpc('atualizar_parametro_global', {
        p_chave: chave,
        p_valor: valor,
        p_fonte: fonte,
        p_serie_bcb: serieBcb ?? undefined,
      })
      if (error || !data) throw error ?? new Error('Falha ao atualizar parâmetro global')
      const atualizado = mapParametroGlobalRow(data)
      setParametrosGlobais((prev) => prev.map((p) => (p.chave === chave ? atualizado : p)))
    },
    []
  )

  const atualizarParametroAnual = useCallback(
    async (
      chave: ParametroAnualChave,
      ano: number,
      valorMin: number | null,
      valorMax: number | null,
      fonte: ParametroAnual['fonte']
    ) => {
      // p_valor_min/p_valor_max aceitam NULL em runtime (coluna nullable, sem NOT NULL
      // na função) mas o gerador de tipos do Supabase não marca args `numeric` simples
      // como nullable — cast intencional, mesmo padrão já registrado em skills/supabase.md
      // ("retorno precisa de mapa manual" pra jsonb; aqui é o argumento que precisa).
      const { data, error } = await supabase.rpc('atualizar_parametro_anual', {
        p_chave: chave,
        p_ano: ano,
        p_valor_min: valorMin as number,
        p_valor_max: valorMax as number,
        p_fonte: fonte,
      })
      if (error || !data) throw error ?? new Error('Falha ao atualizar parâmetro anual')
      const atualizado = mapParametroAnualRow(data)
      setParametrosAnuais((prev) => prev.map((p) => (p.chave === chave && p.ano === ano ? atualizado : p)))
    },
    []
  )

  const criarProjeto = useCallback(async (form: NovoProjetoForm) => {
    // Categorias nascem em branco — template é carregado à parte (ver carregarTemplateExemplo),
    // nunca automático, pra não travar o produto no vocabulário de um cliente específico.
    const { data, error } = await supabase.rpc('create_projeto', {
      p_cliente_id: form.clienteId,
      p_tipo_projeto_id: form.tipoProjetoId,
      p_nome: form.projeto,
    })
    if (error || !data) throw error ?? new Error('Falha ao criar projeto')
    const novo: Projeto = { ...mapRowToProjeto(data), highlight: true }
    setProjetos((prev) => [novo, ...prev])
    setTimeout(() => {
      setProjetos((prev) => prev.map((p) => (p.id === novo.id ? { ...p, highlight: false } : p)))
    }, 900)
    return novo.id
  }, [])

  const arquivarProjeto = useCallback(async (id: string) => {
    const { error } = await supabase.rpc('arquivar_projeto', { p_id: id })
    if (error) throw error
    setProjetos((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const concluirProjeto = useCallback(async (id: string) => {
    const { error } = await supabase.rpc('concluir_projeto', { p_id: id })
    if (error) throw error
    setProjetos((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'concluido' } : p)))
  }, [])

  const atualizarConfigFinanceira = useCallback(async (projetoId: string, form: ConfigFinanceiraForm) => {
    const { data, error } = await supabase.rpc('atualizar_config_financeira', {
      p_projeto_id: projetoId,
      p_moeda: form.moeda,
      p_data_base: form.dataBase,
      p_horizonte_anos: form.horizonteAnos,
      p_metodo_atualizacao: form.metodoAtualizacao,
      p_contingencia_pct: form.contingenciaPct,
    })
    if (error || !data) throw error ?? new Error('Falha ao atualizar configuração financeira')
    setProjetos((prev) =>
      prev.map((p) =>
        p.id === projetoId
          ? {
              ...p,
              moeda: data.moeda,
              dataBase: data.data_base,
              horizonteAnos: data.horizonte_anos,
              metodoAtualizacao: data.metodo_atualizacao,
              contingenciaPct: data.contingencia_pct,
            }
          : p
      )
    )
  }, [])

  const mapCategorias = useCallback((projetoId: string, fn: (categorias: Category[]) => Category[]) => {
    setProjetos((prev) =>
      prev.map((p) => {
        if (p.id !== projetoId) return p
        const categorias = fn(p.categorias)
        return { ...p, categorias, esperado: estimateTotal(categorias) }
      })
    )
  }, [])

  // ----------------------------------------------------------------------
  // Campos operacionais do projeto — CRUD direto na `campos_operacionais`,
  // sem RPC. Espelha as funções `templateAddCampoOp` etc. só que o alvo é a
  // tabela por-projeto. RLS habilitada pela migration 20260829150000.
  // ----------------------------------------------------------------------

  const addCampoOp = useCallback(
    async (projetoId: string, catId: string) => {
      const { data, error } = await supabase
        .from('campos_operacionais')
        .insert({ categoria_projeto_id: catId, label: '', status: 'pendente' })
        .select('id, label, valor, unidade, status')
        .single()
      if (error || !data) throw error ?? new Error('Falha ao criar campo operacional')
      const novo = mapCampoOperacionalRow(data)
      mapCategorias(projetoId, (categorias) =>
        categorias.map((c) => (c.id === catId ? { ...c, camposOperacionais: [...c.camposOperacionais, novo] } : c))
      )
    },
    [mapCategorias]
  )

  const removeCampoOp = useCallback(
    async (projetoId: string, catId: string, campoId: string) => {
      const { error } = await supabase.from('campos_operacionais').delete().eq('id', campoId)
      if (error) throw error
      mapCategorias(projetoId, (categorias) =>
        categorias.map((c) =>
          c.id === catId ? { ...c, camposOperacionais: c.camposOperacionais.filter((cp) => cp.id !== campoId) } : c
        )
      )
    },
    [mapCategorias]
  )

  const updateCampoOp = useCallback(
    (projetoId: string, catId: string, campoId: string, field: keyof CampoOperacional, value: string) => {
      mapCategorias(projetoId, (categorias) =>
        categorias.map((c) =>
          c.id === catId
            ? {
                ...c,
                camposOperacionais: c.camposOperacionais.map((cp) =>
                  cp.id === campoId ? { ...cp, [field]: value } : cp
                ),
              }
            : c
        )
      )
    },
    [mapCategorias]
  )

  const saveCampoOp = useCallback(async (campoId: string, field: keyof CampoOperacional, value: string) => {
    let patch: {
      label?: string
      unidade?: string | null
      valor?: string | null
      status?: 'pendente' | 'preenchido'
      formula?: string | null
    }
    if (field === 'label') patch = { label: value }
    else if (field === 'unidade') patch = { unidade: value }
    else if (field === 'valor') patch = { valor: value }
    else if (field === 'status') patch = { status: value === 'preenchido' ? 'preenchido' : 'pendente' }
    else if (field === 'formula') patch = { formula: value.trim() === '' ? null : value }
    else return
    const { error } = await supabase.from('campos_operacionais').update(patch).eq('id', campoId)
    if (error) throw error
  }, [])

  // ----------------------------------------------------------------------
  // Template de categoria por tipo_projeto (Configurações) — espelha as
  // funções de categoria/item de projeto real acima, só que a chave é
  // tipo_projeto_id em vez de projeto_id e o alvo é categorias_template/
  // itens_template. Buscado sob demanda (não no boot) — só usado quando o
  // editor de template em Configurações abre pra um tipo.
  // ----------------------------------------------------------------------

  const mapTemplateCategorias = useCallback((tipoProjetoId: string, fn: (categorias: Category[]) => Category[]) => {
    setTemplates((prev) => ({ ...prev, [tipoProjetoId]: fn(prev[tipoProjetoId] ?? []) }))
  }, [])

  const fetchTemplateCategorias = useCallback(async (tipoProjetoId: string) => {
    const { data, error } = await supabase
      .from('categorias_template')
      .select(
        '*, categorias_catalogo(*), itens_template(*, desembolso_item_template_ano(*)), campos_operacionais_template(*)'
      )
      .eq('tipo_projeto_id', tipoProjetoId)
      .order('ordem')
    if (error || !data) return
    setTemplates((prev) => ({
      ...prev,
      [tipoProjetoId]: (data as unknown as CategoriaTemplateRowComItens[]).map(mapRowToTemplateCategoria),
    }))
  }, [])

  const templateAddCampoOp = useCallback(
    async (tipoProjetoId: string, catId: string) => {
      // Ordem = max atual + 1, calculada aqui em vez de RPC — insert é direto,
      // e como só o admin edita esta tela, colisão é improvável na prática.
      const categoriasDoTipo = templates[tipoProjetoId] ?? []
      const cat = categoriasDoTipo.find((c) => c.id === catId)
      const proximaOrdem = (cat?.camposOperacionaisTemplate ?? []).reduce((m, cp) => Math.max(m, cp.ordem), -1) + 1
      const { data, error } = await supabase
        .from('campos_operacionais_template')
        .insert({ categoria_template_id: catId, label: '', ordem: proximaOrdem })
        .select('id, label, unidade, valor_referencia, ordem')
        .single()
      if (error || !data) throw error ?? new Error('Falha ao criar campo operacional')
      const novo = mapCampoOperacionalTemplateRow(data)
      mapTemplateCategorias(tipoProjetoId, (categorias) =>
        categorias.map((c) =>
          c.id === catId ? { ...c, camposOperacionaisTemplate: [...(c.camposOperacionaisTemplate ?? []), novo] } : c
        )
      )
    },
    [mapTemplateCategorias, templates]
  )

  const templateRemoveCampoOp = useCallback(
    async (tipoProjetoId: string, catId: string, campoId: string) => {
      const { error } = await supabase.from('campos_operacionais_template').delete().eq('id', campoId)
      if (error) throw error
      mapTemplateCategorias(tipoProjetoId, (categorias) =>
        categorias.map((c) =>
          c.id === catId
            ? {
                ...c,
                camposOperacionaisTemplate: (c.camposOperacionaisTemplate ?? []).filter((cp) => cp.id !== campoId),
              }
            : c
        )
      )
    },
    [mapTemplateCategorias]
  )

  // Só estado local — mesmo padrão de templateUpdateItem.
  const templateUpdateCampoOp = useCallback(
    (tipoProjetoId: string, catId: string, campoId: string, field: keyof CampoOperacionalTemplate, value: string) => {
      mapTemplateCategorias(tipoProjetoId, (categorias) =>
        categorias.map((c) =>
          c.id === catId
            ? {
                ...c,
                camposOperacionaisTemplate: (c.camposOperacionaisTemplate ?? []).map((cp) =>
                  cp.id === campoId ? { ...cp, [field]: value } : cp
                ),
              }
            : c
        )
      )
    },
    [mapTemplateCategorias]
  )

  // Só campos livres do template (label/unidade/valor_referencia) são
  // editáveis pela UI. id/ordem são gerenciados pelo backend/insert.
  const templateSaveCampoOp = useCallback(
    async (campoId: string, field: keyof CampoOperacionalTemplate, value: string) => {
      let patch: { label?: string; unidade?: string | null; valor_referencia?: string | null; formula?: string | null }
      if (field === 'label') patch = { label: value }
      else if (field === 'unidade') patch = { unidade: value }
      else if (field === 'valorReferencia') patch = { valor_referencia: value }
      else if (field === 'formula') patch = { formula: value.trim() === '' ? null : value }
      else return
      const { error } = await supabase.from('campos_operacionais_template').update(patch).eq('id', campoId)
      if (error) throw error
    },
    []
  )

  const templateAddCategoria = useCallback(
    async (tipoProjetoId: string) => {
      const { data, error } = await supabase.rpc('template_add_categoria', { p_tipo_projeto_id: tipoProjetoId })
      if (error || !data) throw error ?? new Error('Falha ao criar categoria de template')
      const { categoria, catalogo: novoCatalogo } = data as unknown as TemplateAddCategoriaReturns

      setCatalogo((prev) =>
        prev.some((c) => c.id === novoCatalogo.id) ? prev : [...prev, { id: novoCatalogo.id, nome: novoCatalogo.nome }]
      )
      setTiposComTemplate((prev) => (prev.includes(tipoProjetoId) ? prev : [...prev, tipoProjetoId]))
      mapTemplateCategorias(tipoProjetoId, (categorias) => {
        const nova: Category = {
          id: categoria.id,
          catalogoId: categoria.catalogo_id,
          preenche: categoria.preenche as Category['preenche'],
          expanded: true,
          justAdded: true,
          items: [],
          camposOperacionais: [],
          custoProvavel: null,
        }
        return [nova, ...categorias]
      })
      setTimeout(() => {
        setTemplates((prev) => ({
          ...prev,
          [tipoProjetoId]: (prev[tipoProjetoId] ?? []).map((c) => ({ ...c, justAdded: false })),
        }))
      }, 900)
    },
    [mapTemplateCategorias]
  )

  const templateRemoveCategoria = useCallback(
    async (tipoProjetoId: string, catId: string) => {
      const { error } = await supabase.rpc('template_remove_categoria', { p_id: catId })
      if (error) throw error
      mapTemplateCategorias(tipoProjetoId, (categorias) => categorias.filter((c) => c.id !== catId))
    },
    [mapTemplateCategorias]
  )

  const templateUpdateCategoria = useCallback(
    async (tipoProjetoId: string, catId: string, field: keyof Category, value: string | boolean) => {
      if (field === 'preenche') {
        const { error } = await supabase.rpc('template_update_categoria_preenche', {
          p_id: catId,
          p_preenche: value as string,
        })
        if (error) throw error
      }
      mapTemplateCategorias(tipoProjetoId, (categorias) =>
        categorias.map((c) => (c.id === catId ? { ...c, [field]: value } : c))
      )
    },
    [mapTemplateCategorias]
  )

  const templateAddItem = useCallback(
    async (tipoProjetoId: string, catId: string) => {
      const { data, error } = await supabase.rpc('template_add_item', { p_categoria_template_id: catId })
      if (error || !data) throw error ?? new Error('Falha ao criar item de template')
      const novoItem = mapItemCustoRow(data)
      mapTemplateCategorias(tipoProjetoId, (categorias) =>
        categorias.map((c) => (c.id === catId ? { ...c, items: [...c.items, novoItem] } : c))
      )
    },
    [mapTemplateCategorias]
  )

  const templateRemoveItem = useCallback(
    async (tipoProjetoId: string, catId: string, itemId: string) => {
      const { error } = await supabase.rpc('template_remove_item', { p_id: itemId })
      if (error) throw error
      mapTemplateCategorias(tipoProjetoId, (categorias) =>
        categorias.map((c) => (c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c))
      )
    },
    [mapTemplateCategorias]
  )

  // Só estado local — digitar não toca rede, mesmo padrão de updateItem.
  const templateUpdateItem = useCallback(
    (tipoProjetoId: string, catId: string, itemId: string, field: keyof CategoryItem, value: unknown) => {
      mapTemplateCategorias(tipoProjetoId, (categorias) =>
        categorias.map((c) =>
          c.id === catId ? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)) } : c
        )
      )
    },
    [mapTemplateCategorias]
  )

  const templateSaveItem = useCallback(async (itemId: string, field: keyof CategoryItem, value: unknown) => {
    if (field === 'id' || field === 'desembolsoPorAno') return
    const patchKey = ITEM_FIELD_TO_PATCH_KEY[field]
    const patchValue =
      field === 'min' || field === 'max'
        ? parseMoedaBR(String(value))
        : field === 'custoUnitarioMin' || field === 'custoUnitarioMax'
          ? value === '' || value == null
            ? null
            : parseMoedaBR(String(value))
          : value
    // Cast para Json — patchValue é sempre um valor serializável (string,
    // number, null ou number[]) validado pelos callers.
    const patch = { [patchKey]: patchValue } as unknown as Record<string, string | number | null | number[]>
    const { error } = await supabase.rpc('template_update_item', { p_id: itemId, p_patch: patch })
    if (error) throw error
  }, [])

  // Substitui TODAS as categorias do projeto — mesmo comportamento de sempre
  // (carregar de novo descarta o que já tinha). Template agora mora no banco
  // (categorias_template/itens_template, administrável em Configurações) —
  // a RPC lê o template do servidor a partir do tipo, não recebe mais o
  // conteúdo montado pelo frontend.
  const carregarTemplateExemplo = useCallback(async (projetoId: string, tipoProjetoId: string) => {
    const { data, error } = await supabase.rpc('carregar_template_exemplo', {
      p_projeto_id: projetoId,
      p_tipo_projeto_id: tipoProjetoId,
    })
    if (error || !data) throw error ?? new Error('Falha ao carregar template')

    const criadas = data as unknown as CarregarTemplateExemploItem[]
    setCatalogo((prev) => {
      const next = [...prev]
      for (const { catalogo: cat } of criadas) {
        if (!next.some((c) => c.id === cat.id)) next.push({ id: cat.id, nome: cat.nome })
      }
      return next
    })

    const categorias: Category[] = criadas.map(({ categoria, itens }) => ({
      id: categoria.id,
      catalogoId: categoria.catalogo_id,
      preenche: categoria.preenche as Category['preenche'],
      expanded: false,
      justAdded: false,
      items: itens.map(mapItemCustoRow),
      camposOperacionais: [],
      custoProvavel: categoria.custo_provavel,
    }))

    setProjetos((prev) =>
      prev.map((p) => (p.id === projetoId ? { ...p, categorias, esperado: estimateTotal(categorias) } : p))
    )
  }, [])

  const addCategoria = useCallback(
    async (projetoId: string) => {
      const { data, error } = await supabase.rpc('add_categoria', { p_projeto_id: projetoId })
      if (error || !data) throw error ?? new Error('Falha ao criar categoria')
      const { categoria, catalogo: novoCatalogo } = data as unknown as AddCategoriaReturns

      setCatalogo((prev) => [...prev, { id: novoCatalogo.id, nome: novoCatalogo.nome }])
      mapCategorias(projetoId, (categorias) => {
        const nova: Category = {
          id: categoria.id,
          catalogoId: categoria.catalogo_id,
          preenche: categoria.preenche as Category['preenche'],
          expanded: true,
          justAdded: true,
          items: [],
          camposOperacionais: [],
          custoProvavel: null,
        }
        return [nova, ...categorias]
      })
      setTimeout(() => {
        setProjetos((prev) =>
          prev.map((p) =>
            p.id === projetoId ? { ...p, categorias: p.categorias.map((c) => ({ ...c, justAdded: false })) } : p
          )
        )
      }, 900)
    },
    [mapCategorias]
  )

  const removeCategoria = useCallback(
    async (projetoId: string, catId: string) => {
      // Remove só a instância deste projeto — o nome no catálogo permanece (outros
      // projetos podem estar usando o mesmo nome).
      const { error } = await supabase.rpc('remover_categoria_projeto', { p_id: catId })
      if (error) throw error
      mapCategorias(projetoId, (categorias) => categorias.filter((c) => c.id !== catId))
    },
    [mapCategorias]
  )

  // 'preenche' persiste (RPC); 'expanded'/'justAdded' são estado de UI puro —
  // nunca tocam rede.
  const updateCategoria = useCallback(
    async (projetoId: string, catId: string, field: keyof Category, value: string | boolean) => {
      if (field === 'preenche') {
        const { error } = await supabase.rpc('update_categoria_preenche', { p_id: catId, p_preenche: value as string })
        if (error) throw error
      }
      mapCategorias(projetoId, (categorias) => categorias.map((c) => (c.id === catId ? { ...c, [field]: value } : c)))
    },
    [mapCategorias]
  )

  const addItem = useCallback(
    async (projetoId: string, catId: string) => {
      const { data, error } = await supabase.rpc('add_item_custo', { p_categoria_projeto_id: catId })
      if (error || !data) throw error ?? new Error('Falha ao criar item')
      const novoItem = mapItemCustoRow(data)
      mapCategorias(projetoId, (categorias) =>
        categorias.map((c) => (c.id === catId ? { ...c, items: [...c.items, novoItem] } : c))
      )
    },
    [mapCategorias]
  )

  const removeItem = useCallback(
    async (projetoId: string, catId: string, itemId: string) => {
      const { error } = await supabase.rpc('remove_item_custo', { p_id: itemId })
      if (error) throw error
      mapCategorias(projetoId, (categorias) =>
        categorias.map((c) => (c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c))
      )
    },
    [mapCategorias]
  )

  // Só estado local — digitar não toca rede. Persistência real é `saveItem`,
  // chamada no blur de cada campo (ver CategoryBlock.tsx).
  const updateItem = useCallback(
    (projetoId: string, catId: string, itemId: string, field: keyof CategoryItem, value: unknown) => {
      mapCategorias(projetoId, (categorias) =>
        categorias.map((c) =>
          c.id === catId ? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)) } : c
        )
      )
    },
    [mapCategorias]
  )

  const saveItem = useCallback(async (itemId: string, field: keyof CategoryItem, value: unknown) => {
    if (field === 'id' || field === 'desembolsoPorAno') return
    const patchKey = ITEM_FIELD_TO_PATCH_KEY[field]
    const patchValue =
      field === 'min' || field === 'max'
        ? parseMoedaBR(String(value))
        : field === 'custoUnitarioMin' || field === 'custoUnitarioMax'
          ? value === '' || value == null
            ? null
            : parseMoedaBR(String(value))
          : value
    const patch = { [patchKey]: patchValue } as unknown as Record<string, string | number | null | number[]>
    const { error } = await supabase.rpc('update_item_custo', { p_id: itemId, p_patch: patch })
    if (error) throw error
  }, [])

  // -----------------------------------------------------------------
  // Desembolso ano-a-ano (item de projeto e de template) — RPCs próprias
  // (update_item_desembolso / template_update_item_desembolso) que fazem
  // upsert+delete atômico do array de (ano, valor). Estado local é atualizado
  // otimisticamente. Ver `_Dados_Formulas_Planilha.md` — Etapa 5.
  // -----------------------------------------------------------------

  const updateItemDesembolso = useCallback(
    async (projetoId: string, catId: string, itemId: string, valores: { ano: number; valor: number }[]) => {
      const { error } = await supabase.rpc('update_item_desembolso', {
        p_item_id: itemId,
        p_valores: valores as unknown as Record<string, number>[],
      })
      if (error) throw error
      const clean = valores.filter((v) => v.valor > 0).sort((a, b) => a.ano - b.ano)
      mapCategorias(projetoId, (categorias) =>
        categorias.map((c) =>
          c.id === catId
            ? {
                ...c,
                items: c.items.map((i) =>
                  i.id === itemId ? { ...i, desembolsoPorAno: clean.length > 0 ? clean : null } : i
                ),
              }
            : c
        )
      )
    },
    [mapCategorias]
  )

  const templateUpdateItemDesembolso = useCallback(
    async (tipoProjetoId: string, catId: string, itemId: string, valores: { ano: number; valor: number }[]) => {
      const { error } = await supabase.rpc('template_update_item_desembolso', {
        p_item_template_id: itemId,
        p_valores: valores as unknown as Record<string, number>[],
      })
      if (error) throw error
      const clean = valores.filter((v) => v.valor > 0).sort((a, b) => a.ano - b.ano)
      mapTemplateCategorias(tipoProjetoId, (categorias) =>
        categorias.map((c) =>
          c.id === catId
            ? {
                ...c,
                items: c.items.map((i) =>
                  i.id === itemId ? { ...i, desembolsoPorAno: clean.length > 0 ? clean : null } : i
                ),
              }
            : c
        )
      )
    },
    [mapTemplateCategorias]
  )

  // -----------------------------------------------------------------
  // custo_provavel por categoria (moda "pela experiência") — RPC única.
  // valor null = "voltar pro fallback (min+max)/2 na Aro Simulação".
  // -----------------------------------------------------------------

  const updateCategoriaCustoProvavel = useCallback(
    async (projetoId: string, catId: string, valor: number | null) => {
      const { error } = await supabase.rpc('update_categoria_custo_provavel', {
        p_categoria_id: catId,
        p_valor: valor as number,
      })
      if (error) throw error
      mapCategorias(projetoId, (categorias) =>
        categorias.map((c) => (c.id === catId ? { ...c, custoProvavel: valor } : c))
      )
    },
    [mapCategorias]
  )

  const templateUpdateCategoriaCustoProvavel = useCallback(
    async (tipoProjetoId: string, catId: string, valor: number | null) => {
      const { error } = await supabase.rpc('template_update_categoria_custo_provavel', {
        p_categoria_template_id: catId,
        p_valor: valor as number,
      })
      if (error) throw error
      mapTemplateCategorias(tipoProjetoId, (categorias) =>
        categorias.map((c) => (c.id === catId ? { ...c, custoProvavel: valor } : c))
      )
    },
    [mapTemplateCategorias]
  )

  const atualizarRevLocal = useCallback((projetoId: string, rev: string) => {
    setProjetos((prev) => prev.map((p) => (p.id === projetoId ? { ...p, rev } : p)))
  }, [])

  // Setores CRUD (tela `/setores`) — RLS aplicada em migration
  // 20260830170905_setores_admin_rls. Optimistic update local + save Supabase.
  const addSetor = useCallback(async (id: number, nome: string) => {
    const { error } = await supabase.from('setores').insert({ id, nome }).select().single()
    if (error) throw error
    setSetores((prev) => [...prev, { id, nome }].sort((a, b) => a.id - b.id))
  }, [])

  const renomearSetor = useCallback(async (id: number, nome: string) => {
    setSetores((prev) => prev.map((s) => (s.id === id ? { ...s, nome } : s)))
    const { error } = await supabase.from('setores').update({ nome }).eq('id', id)
    if (error) throw error
  }, [])

  const removerSetor = useCallback(async (id: number) => {
    setSetores((prev) => prev.filter((s) => s.id !== id))
    const { error } = await supabase.from('setores').delete().eq('id', id)
    if (error) throw error
  }, [])

  // -- Remediação --------------------------------------------------------
  // Lazy load das categorias + itens de um projeto. Roda 1 query embed do
  // PostgREST (categorias_remediacao com itens_remediacao(*)) — mesma
  // estratégia do fetchProjetos original.
  const fetchRemediacao = useCallback(async (projetoId: string) => {
    setRemediacaoLoading(true)
    const { data, error } = await supabase
      .from('categorias_remediacao')
      .select(
        'id, projeto_id, nome, area_ha, ordem, itens_remediacao(id, categoria_id, descricao, unidade, quantidade, custo_unit_min, custo_unit_max, fonte, ordem)'
      )
      .eq('projeto_id', projetoId)
      .order('ordem')
    setRemediacaoLoading(false)
    if (error || !data) return
    type Row = CategoriaRemediacaoRow & { itens_remediacao?: ItemRemediacaoRow[] | null }
    const categorias: CategoriaRemediacao[] = (data as unknown as Row[]).map((row) => {
      const items = (row.itens_remediacao ?? [])
        .slice()
        .sort((a, b) => a.ordem - b.ordem)
        .map(mapItemRemediacaoRow)
      return mapCategoriaRemediacaoRow(row, items)
    })
    setRemediacaoByProjeto((prev) => ({ ...prev, [projetoId]: categorias }))
  }, [])

  const setRemediacaoHabilitada = useCallback(async (projetoId: string, habilitada: boolean) => {
    setProjetos((prev) => prev.map((p) => (p.id === projetoId ? { ...p, remediacaoHabilitada: habilitada } : p)))
    const { error } = await supabase.from('projetos').update({ remediacao_habilitada: habilitada }).eq('id', projetoId)
    if (error) throw error
  }, [])

  const carregarRemediacaoPadrao = useCallback(
    async (projetoId: string) => {
      const { error } = await supabase.rpc('carregar_remediacao_padrao', { p_projeto_id: projetoId })
      if (error) throw error
      await fetchRemediacao(projetoId)
    },
    [fetchRemediacao]
  )

  const addRemediacaoCategoria = useCallback(
    async (projetoId: string, nome: string, areaHa: number | null) => {
      const proximaOrdem = (remediacaoByProjeto[projetoId]?.length ?? 0) + 1
      const { data, error } = await supabase
        .from('categorias_remediacao')
        .insert({
          projeto_id: projetoId,
          nome,
          area_ha: areaHa,
          ordem: proximaOrdem,
        })
        .select('id, projeto_id, nome, area_ha, ordem')
        .single()
      if (error || !data) throw error ?? new Error('sem retorno')
      const nova = mapCategoriaRemediacaoRow(data as CategoriaRemediacaoRow, [])
      setRemediacaoByProjeto((prev) => ({ ...prev, [projetoId]: [...(prev[projetoId] ?? []), nova] }))
    },
    [remediacaoByProjeto]
  )

  const updateRemediacaoCategoria = useCallback(
    async (id: string, patch: Partial<Pick<CategoriaRemediacao, 'nome' | 'areaHa' | 'ordem'>>) => {
      const dbPatch: Record<string, unknown> = {}
      if (patch.nome != null) dbPatch.nome = patch.nome
      if ('areaHa' in patch) dbPatch.area_ha = patch.areaHa
      if (patch.ordem != null) dbPatch.ordem = patch.ordem
      setRemediacaoByProjeto((prev) => {
        const next: typeof prev = {}
        for (const [pid, cats] of Object.entries(prev)) {
          next[pid] = cats.map((c) => (c.id === id ? { ...c, ...patch } : c))
        }
        return next
      })
      const { error } = await supabase
        .from('categorias_remediacao')
        .update(dbPatch as never)
        .eq('id', id)
      if (error) throw error
    },
    []
  )

  const removeRemediacaoCategoria = useCallback(async (projetoId: string, id: string) => {
    setRemediacaoByProjeto((prev) => ({ ...prev, [projetoId]: (prev[projetoId] ?? []).filter((c) => c.id !== id) }))
    const { error } = await supabase.from('categorias_remediacao').delete().eq('id', id)
    if (error) throw error
  }, [])

  const addRemediacaoItem = useCallback(
    async (categoriaId: string) => {
      // Ordem = último + 1 do que estiver no state local.
      let proximaOrdem = 1
      for (const cats of Object.values(remediacaoByProjeto)) {
        const cat = cats.find((c) => c.id === categoriaId)
        if (cat) {
          proximaOrdem = cat.items.length + 1
          break
        }
      }
      const { data, error } = await supabase
        .from('itens_remediacao')
        .insert({
          categoria_id: categoriaId,
          descricao: 'Novo item',
          unidade: 'unid',
          quantidade: 1,
          custo_unit_min: 0,
          custo_unit_max: 0,
          ordem: proximaOrdem,
        })
        .select('id, categoria_id, descricao, unidade, quantidade, custo_unit_min, custo_unit_max, fonte, ordem')
        .single()
      if (error || !data) throw error ?? new Error('sem retorno')
      const novo = mapItemRemediacaoRow(data as ItemRemediacaoRow)
      setRemediacaoByProjeto((prev) => {
        const next: typeof prev = {}
        for (const [pid, cats] of Object.entries(prev)) {
          next[pid] = cats.map((c) => (c.id === categoriaId ? { ...c, items: [...c.items, novo] } : c))
        }
        return next
      })
    },
    [remediacaoByProjeto]
  )

  const updateRemediacaoItem = useCallback(
    async (
      id: string,
      patch: Partial<
        Pick<
          ItemRemediacao,
          'descricao' | 'unidade' | 'quantidade' | 'custoUnitMin' | 'custoUnitMax' | 'fonte' | 'ordem'
        >
      >
    ) => {
      const dbPatch: Record<string, unknown> = {}
      if (patch.descricao != null) dbPatch.descricao = patch.descricao
      if (patch.unidade != null) dbPatch.unidade = patch.unidade
      if (patch.quantidade != null) dbPatch.quantidade = patch.quantidade
      if (patch.custoUnitMin != null) dbPatch.custo_unit_min = patch.custoUnitMin
      if (patch.custoUnitMax != null) dbPatch.custo_unit_max = patch.custoUnitMax
      if ('fonte' in patch) dbPatch.fonte = patch.fonte
      if (patch.ordem != null) dbPatch.ordem = patch.ordem
      setRemediacaoByProjeto((prev) => {
        const next: typeof prev = {}
        for (const [pid, cats] of Object.entries(prev)) {
          next[pid] = cats.map((c) => ({ ...c, items: c.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }))
        }
        return next
      })
      const { error } = await supabase
        .from('itens_remediacao')
        .update(dbPatch as never)
        .eq('id', id)
      if (error) throw error
    },
    []
  )

  const removeRemediacaoItem = useCallback(async (categoriaId: string, id: string) => {
    setRemediacaoByProjeto((prev) => {
      const next: typeof prev = {}
      for (const [pid, cats] of Object.entries(prev)) {
        next[pid] = cats.map((c) => (c.id === categoriaId ? { ...c, items: c.items.filter((i) => i.id !== id) } : c))
      }
      return next
    })
    const { error } = await supabase.from('itens_remediacao').delete().eq('id', id)
    if (error) throw error
  }, [])

  return (
    <ProjetoContext.Provider
      value={{
        loading,
        clientes,
        criarCliente,
        tiposProjeto,
        criarTipoProjeto,
        renomearTipoProjeto,
        removerTipoProjeto,
        catalogo,
        renomearCategoriaCatalogo,
        setores,
        addSetor,
        renomearSetor,
        removerSetor,
        remediacaoByProjeto,
        remediacaoLoading,
        fetchRemediacao,
        setRemediacaoHabilitada,
        carregarRemediacaoPadrao,
        addRemediacaoCategoria,
        updateRemediacaoCategoria,
        removeRemediacaoCategoria,
        addRemediacaoItem,
        updateRemediacaoItem,
        removeRemediacaoItem,
        parametrosGlobais,
        atualizarParametroGlobal,
        parametrosAnuais,
        atualizarParametroAnual,
        tiposComTemplate,
        templates,
        fetchTemplateCategorias,
        templateAddCategoria,
        templateRemoveCategoria,
        templateUpdateCategoria,
        templateAddItem,
        templateRemoveItem,
        templateUpdateItem,
        templateSaveItem,
        templateAddCampoOp,
        templateRemoveCampoOp,
        templateUpdateCampoOp,
        templateSaveCampoOp,
        projetos,
        criarProjeto,
        carregarTemplateExemplo,
        arquivarProjeto,
        concluirProjeto,
        atualizarConfigFinanceira,
        addCategoria,
        removeCategoria,
        updateCategoria,
        addItem,
        removeItem,
        updateItem,
        saveItem,
        addCampoOp,
        removeCampoOp,
        updateCampoOp,
        saveCampoOp,
        updateItemDesembolso,
        templateUpdateItemDesembolso,
        updateCategoriaCustoProvavel,
        templateUpdateCategoriaCustoProvavel,
        atualizarRevLocal,
      }}
    >
      {children}
    </ProjetoContext.Provider>
  )
}
