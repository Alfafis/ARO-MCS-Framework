import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { Category, CategoryItem, CategoriaCatalogo } from '@/types/categorias'
import type { Cliente, Projeto } from '@/types/clientes'
import type { ParametroGlobal, ParametroGlobalChave, ParametroAnual, ParametroAnualChave } from '@/types/parametrosGlobais'
import { mapParametroGlobalRow, mapParametroAnualRow } from '@/types/parametrosGlobais'
import type { TipoProjeto } from '@/types/tiposProjeto'
import type { Setor } from '@/types/setores'
import { parseMoedaBR, formatMoedaCompact, valorEsperadoNumerico } from '@/lib/financeiro'
import { formatRelativeTime } from '@/lib/utils'
import { mapItemCustoRow } from '@/lib/categoriaMappers'
import { supabase } from '@/integrations/supabase/client'
import type {
  ProjetoDbRow, ItemCustoRow, CategoriaProjetoRow, CategoriaCatalogoRow, AddCategoriaReturns,
  CarregarTemplateExemploItem, CategoriaTemplateRow, ItemTemplateRow, TemplateAddCategoriaReturns,
} from '@/types'
import { ProjetoContext } from './projeto-context'
import type { ConfigFinanceiraForm, NovoProjetoForm } from './projeto-context'

export type { ConfigFinanceiraForm }

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(w => w.length > 0)
    .map(w => w[0].toUpperCase())
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
}

type ProjetoRowComCategorias = ProjetoDbRow & {
  categorias_projeto?: (CategoriaProjetoRow & {
    categorias_catalogo: CategoriaCatalogoRow
    itens_custo: ItemCustoRow[]
  })[]
}

type CategoriaTemplateRowComItens = CategoriaTemplateRow & {
  categorias_catalogo: CategoriaCatalogoRow
  itens_template: ItemTemplateRow[]
}

// Mesmo shape de tela do projeto real (Category) — camposOperacionais não
// existe em template (fato operacional é sempre por instância de projeto).
function mapRowToTemplateCategoria(row: CategoriaTemplateRowComItens): Category {
  return {
    id: row.id,
    catalogoId: row.catalogo_id,
    preenche: row.preenche as Category['preenche'],
    expanded: false,
    justAdded: false,
    items: row.itens_template.map(mapItemCustoRow),
    camposOperacionais: [],
  }
}

// Junta categorias_projeto/categorias_catalogo/itens_custo num só round-trip
// (embed do PostgREST via FK) — sem isso, projeto recarregado (F5) mostrava
// "sem categorias" mesmo com dado real no banco: a busca de projeto nunca
// buscava a árvore de categoria, só a casca.
function mapRowToProjeto(row: ProjetoRowComCategorias): Projeto {
  const categorias: Category[] = (row.categorias_projeto ?? [])
    .sort((a, b) => a.ordem - b.ordem)
    .map(cp => ({
      id: cp.id,
      catalogoId: cp.catalogo_id,
      preenche: cp.preenche as Category['preenche'],
      expanded: false,
      justAdded: false,
      items: cp.itens_custo.map(mapItemCustoRow),
      camposOperacionais: [],
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
        setClientes(data.map(c => ({ id: c.id, nome: c.nome, initials: initials(c.nome) })))
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
      .select('*, categorias_projeto(*, categorias_catalogo(*), itens_custo(*))')
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
    // Cast em `from<'setores'>` porque os types gerados só entram no
    // supabase/type.ts depois de `npm run gen:types` (a rodar quando a
    // migration 20260824120000_setores_fase_ano.sql for aplicada).
    const fetchSetores = (supabase as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          order: (col: string) => Promise<{ data: { id: number; nome: string }[] | null; error: unknown }>
        }
      }
    })
      .from('setores')
      .select('id, nome')
      .order('id')
      .then(({ data, error }) => {
        if (error || !data) return
        setSetores(data.map(s => ({ id: s.id, nome: s.nome })))
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
        setTiposComTemplate([...new Set(data.map(r => r.tipo_projeto_id))])
      })

    Promise.allSettled([fetchClientes, fetchTipos, fetchProjetos, fetchCatalogo, fetchSetores, fetchParametrosGlobais, fetchParametrosAnuais, fetchTiposComTemplate])
      .then(() => setLoading(false))
  }

  const criarCliente = useCallback(async (nome: string): Promise<string> => {
    const { data, error } = await supabase.rpc('create_cliente', { p_nome: nome })
    if (error || !data) throw error ?? new Error('Falha ao criar cliente')
    setClientes(prev => prev.some(c => c.id === data.id)
      ? prev
      : [...prev, { id: data.id, nome: data.nome, initials: initials(data.nome) }])
    return data.id
  }, [])

  // Dedup por nome vive na RPC (mesmo padrão de create_cliente) — chamar de
  // novo com nome repetido devolve a linha existente, nunca duplica.
  const criarTipoProjeto = useCallback(async (nome: string): Promise<TipoProjeto> => {
    const { data, error } = await supabase.rpc('criar_tipo_projeto', { p_nome: nome })
    if (error || !data) throw error ?? new Error('Falha ao criar tipo de projeto')
    setTiposProjeto(prev => prev.some(t => t.id === data.id) ? prev : [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)))
    return data
  }, [])

  const renomearTipoProjeto = useCallback(async (id: string, novoNome: string) => {
    const { data, error } = await supabase.rpc('renomear_tipo_projeto', { p_id: id, p_novo_nome: novoNome })
    if (error || !data) throw error ?? new Error('Falha ao renomear tipo de projeto')
    setTiposProjeto(prev => prev.map(t => t.id === id ? data : t).sort((a, b) => a.nome.localeCompare(b.nome)))
  }, [])

  const removerTipoProjeto = useCallback(async (id: string) => {
    const { error } = await supabase.rpc('remover_tipo_projeto', { p_id: id })
    if (error) throw error
    setTiposProjeto(prev => prev.filter(t => t.id !== id))
  }, [])

  // Rename é global — colisão de nome no catálogo sobe como erro (unique
  // index), caller decide o que mostrar. Nunca engolir aqui.
  const renomearCategoriaCatalogo = useCallback(async (catalogoId: string, novoNome: string) => {
    const { data, error } = await supabase.rpc('renomear_categoria_catalogo', { p_id: catalogoId, p_novo_nome: novoNome })
    if (error || !data) throw error ?? new Error('Falha ao renomear categoria')
    setCatalogo(prev => prev.map(c => c.id === catalogoId ? { id: data.id, nome: data.nome } : c))
  }, [])

  const atualizarParametroGlobal = useCallback(async (
    chave: ParametroGlobalChave, valor: number, fonte: ParametroGlobal['fonte'], serieBcb: number | null
  ) => {
    const { data, error } = await supabase.rpc('atualizar_parametro_global', {
      p_chave: chave, p_valor: valor, p_fonte: fonte, p_serie_bcb: serieBcb ?? undefined,
    })
    if (error || !data) throw error ?? new Error('Falha ao atualizar parâmetro global')
    const atualizado = mapParametroGlobalRow(data)
    setParametrosGlobais(prev => prev.map(p => p.chave === chave ? atualizado : p))
  }, [])

  const atualizarParametroAnual = useCallback(async (
    chave: ParametroAnualChave, ano: number, valorMin: number | null, valorMax: number | null, fonte: ParametroAnual['fonte']
  ) => {
    // p_valor_min/p_valor_max aceitam NULL em runtime (coluna nullable, sem NOT NULL
    // na função) mas o gerador de tipos do Supabase não marca args `numeric` simples
    // como nullable — cast intencional, mesmo padrão já registrado em skills/supabase.md
    // ("retorno precisa de mapa manual" pra jsonb; aqui é o argumento que precisa).
    const { data, error } = await supabase.rpc('atualizar_parametro_anual', {
      p_chave: chave, p_ano: ano, p_valor_min: valorMin as number, p_valor_max: valorMax as number, p_fonte: fonte,
    })
    if (error || !data) throw error ?? new Error('Falha ao atualizar parâmetro anual')
    const atualizado = mapParametroAnualRow(data)
    setParametrosAnuais(prev => prev.map(p => p.chave === chave && p.ano === ano ? atualizado : p))
  }, [])

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
    setProjetos(prev => [novo, ...prev])
    setTimeout(() => {
      setProjetos(prev => prev.map(p => p.id === novo.id ? { ...p, highlight: false } : p))
    }, 900)
    return novo.id
  }, [])

  const arquivarProjeto = useCallback(async (id: string) => {
    const { error } = await supabase.rpc('arquivar_projeto', { p_id: id })
    if (error) throw error
    setProjetos(prev => prev.filter(p => p.id !== id))
  }, [])

  const concluirProjeto = useCallback(async (id: string) => {
    const { error } = await supabase.rpc('concluir_projeto', { p_id: id })
    if (error) throw error
    setProjetos(prev => prev.map(p => p.id === id ? { ...p, status: 'concluido' } : p))
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
    setProjetos(prev => prev.map(p => p.id === projetoId ? {
      ...p,
      moeda: data.moeda, dataBase: data.data_base, horizonteAnos: data.horizonte_anos,
      metodoAtualizacao: data.metodo_atualizacao, contingenciaPct: data.contingencia_pct,
    } : p))
  }, [])

  const mapCategorias = useCallback((projetoId: string, fn: (categorias: Category[]) => Category[]) => {
    setProjetos(prev => prev.map(p => {
      if (p.id !== projetoId) return p
      const categorias = fn(p.categorias)
      return { ...p, categorias, esperado: estimateTotal(categorias) }
    }))
  }, [])

  // ----------------------------------------------------------------------
  // Template de categoria por tipo_projeto (Configurações) — espelha as
  // funções de categoria/item de projeto real acima, só que a chave é
  // tipo_projeto_id em vez de projeto_id e o alvo é categorias_template/
  // itens_template. Buscado sob demanda (não no boot) — só usado quando o
  // editor de template em Configurações abre pra um tipo.
  // ----------------------------------------------------------------------

  const mapTemplateCategorias = useCallback((tipoProjetoId: string, fn: (categorias: Category[]) => Category[]) => {
    setTemplates(prev => ({ ...prev, [tipoProjetoId]: fn(prev[tipoProjetoId] ?? []) }))
  }, [])

  const fetchTemplateCategorias = useCallback(async (tipoProjetoId: string) => {
    const { data, error } = await supabase
      .from('categorias_template')
      .select('*, categorias_catalogo(*), itens_template(*)')
      .eq('tipo_projeto_id', tipoProjetoId)
      .order('ordem')
    if (error || !data) return
    setTemplates(prev => ({
      ...prev,
      [tipoProjetoId]: (data as unknown as CategoriaTemplateRowComItens[]).map(mapRowToTemplateCategoria),
    }))
  }, [])

  const templateAddCategoria = useCallback(async (tipoProjetoId: string) => {
    const { data, error } = await supabase.rpc('template_add_categoria', { p_tipo_projeto_id: tipoProjetoId })
    if (error || !data) throw error ?? new Error('Falha ao criar categoria de template')
    const { categoria, catalogo: novoCatalogo } = data as unknown as TemplateAddCategoriaReturns

    setCatalogo(prev => prev.some(c => c.id === novoCatalogo.id) ? prev : [...prev, { id: novoCatalogo.id, nome: novoCatalogo.nome }])
    setTiposComTemplate(prev => prev.includes(tipoProjetoId) ? prev : [...prev, tipoProjetoId])
    mapTemplateCategorias(tipoProjetoId, categorias => {
      const nova: Category = {
        id: categoria.id, catalogoId: categoria.catalogo_id, preenche: categoria.preenche as Category['preenche'],
        expanded: true, justAdded: true, items: [], camposOperacionais: [],
      }
      return [nova, ...categorias]
    })
    setTimeout(() => {
      setTemplates(prev => ({ ...prev, [tipoProjetoId]: (prev[tipoProjetoId] ?? []).map(c => ({ ...c, justAdded: false })) }))
    }, 900)
  }, [mapTemplateCategorias])

  const templateRemoveCategoria = useCallback(async (tipoProjetoId: string, catId: string) => {
    const { error } = await supabase.rpc('template_remove_categoria', { p_id: catId })
    if (error) throw error
    mapTemplateCategorias(tipoProjetoId, categorias => categorias.filter(c => c.id !== catId))
  }, [mapTemplateCategorias])

  const templateUpdateCategoria = useCallback(async (tipoProjetoId: string, catId: string, field: keyof Category, value: string | boolean) => {
    if (field === 'preenche') {
      const { error } = await supabase.rpc('template_update_categoria_preenche', { p_id: catId, p_preenche: value as string })
      if (error) throw error
    }
    mapTemplateCategorias(tipoProjetoId, categorias => categorias.map(c => c.id === catId ? { ...c, [field]: value } : c))
  }, [mapTemplateCategorias])

  const templateAddItem = useCallback(async (tipoProjetoId: string, catId: string) => {
    const { data, error } = await supabase.rpc('template_add_item', { p_categoria_template_id: catId })
    if (error || !data) throw error ?? new Error('Falha ao criar item de template')
    const novoItem = mapItemCustoRow(data)
    mapTemplateCategorias(tipoProjetoId, categorias => categorias.map(c => c.id === catId ? { ...c, items: [...c.items, novoItem] } : c))
  }, [mapTemplateCategorias])

  const templateRemoveItem = useCallback(async (tipoProjetoId: string, catId: string, itemId: string) => {
    const { error } = await supabase.rpc('template_remove_item', { p_id: itemId })
    if (error) throw error
    mapTemplateCategorias(tipoProjetoId, categorias => categorias.map(c => c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c))
  }, [mapTemplateCategorias])

  // Só estado local — digitar não toca rede, mesmo padrão de updateItem.
  const templateUpdateItem = useCallback((tipoProjetoId: string, catId: string, itemId: string, field: keyof CategoryItem, value: unknown) => {
    mapTemplateCategorias(tipoProjetoId, categorias => categorias.map(c => c.id === catId
      ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, [field]: value } : i) }
      : c
    ))
  }, [mapTemplateCategorias])

  const templateSaveItem = useCallback(async (itemId: string, field: keyof CategoryItem, value: unknown) => {
    if (field === 'id') return
    const patchKey = ITEM_FIELD_TO_PATCH_KEY[field]
    const patchValue = (field === 'min' || field === 'max') ? parseMoedaBR(String(value)) : value
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
    setCatalogo(prev => {
      const next = [...prev]
      for (const { catalogo: cat } of criadas) {
        if (!next.some(c => c.id === cat.id)) next.push({ id: cat.id, nome: cat.nome })
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
    }))

    setProjetos(prev => prev.map(p => p.id === projetoId ? { ...p, categorias, esperado: estimateTotal(categorias) } : p))
  }, [])

  const addCategoria = useCallback(async (projetoId: string) => {
    const { data, error } = await supabase.rpc('add_categoria', { p_projeto_id: projetoId })
    if (error || !data) throw error ?? new Error('Falha ao criar categoria')
    const { categoria, catalogo: novoCatalogo } = data as unknown as AddCategoriaReturns

    setCatalogo(prev => [...prev, { id: novoCatalogo.id, nome: novoCatalogo.nome }])
    mapCategorias(projetoId, categorias => {
      const nova: Category = {
        id: categoria.id, catalogoId: categoria.catalogo_id, preenche: categoria.preenche as Category['preenche'],
        expanded: true, justAdded: true, items: [], camposOperacionais: [],
      }
      return [nova, ...categorias]
    })
    setTimeout(() => {
      setProjetos(prev => prev.map(p => p.id === projetoId
        ? { ...p, categorias: p.categorias.map(c => ({ ...c, justAdded: false })) }
        : p
      ))
    }, 900)
  }, [mapCategorias])

  const removeCategoria = useCallback(async (projetoId: string, catId: string) => {
    // Remove só a instância deste projeto — o nome no catálogo permanece (outros
    // projetos podem estar usando o mesmo nome).
    const { error } = await supabase.rpc('remover_categoria_projeto', { p_id: catId })
    if (error) throw error
    mapCategorias(projetoId, categorias => categorias.filter(c => c.id !== catId))
  }, [mapCategorias])

  // 'preenche' persiste (RPC); 'expanded'/'justAdded' são estado de UI puro —
  // nunca tocam rede.
  const updateCategoria = useCallback(async (projetoId: string, catId: string, field: keyof Category, value: string | boolean) => {
    if (field === 'preenche') {
      const { error } = await supabase.rpc('update_categoria_preenche', { p_id: catId, p_preenche: value as string })
      if (error) throw error
    }
    mapCategorias(projetoId, categorias => categorias.map(c => c.id === catId ? { ...c, [field]: value } : c))
  }, [mapCategorias])

  const addItem = useCallback(async (projetoId: string, catId: string) => {
    const { data, error } = await supabase.rpc('add_item_custo', { p_categoria_projeto_id: catId })
    if (error || !data) throw error ?? new Error('Falha ao criar item')
    const novoItem = mapItemCustoRow(data)
    mapCategorias(projetoId, categorias => categorias.map(c => c.id === catId ? { ...c, items: [...c.items, novoItem] } : c))
  }, [mapCategorias])

  const removeItem = useCallback(async (projetoId: string, catId: string, itemId: string) => {
    const { error } = await supabase.rpc('remove_item_custo', { p_id: itemId })
    if (error) throw error
    mapCategorias(projetoId, categorias => categorias.map(c => c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c))
  }, [mapCategorias])

  // Só estado local — digitar não toca rede. Persistência real é `saveItem`,
  // chamada no blur de cada campo (ver CategoryBlock.tsx).
  const updateItem = useCallback((projetoId: string, catId: string, itemId: string, field: keyof CategoryItem, value: unknown) => {
    mapCategorias(projetoId, categorias => categorias.map(c => c.id === catId
      ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, [field]: value } : i) }
      : c
    ))
  }, [mapCategorias])

  const saveItem = useCallback(async (itemId: string, field: keyof CategoryItem, value: unknown) => {
    if (field === 'id') return
    const patchKey = ITEM_FIELD_TO_PATCH_KEY[field]
    const patchValue = (field === 'min' || field === 'max') ? parseMoedaBR(String(value)) : value
    const patch = { [patchKey]: patchValue } as unknown as Record<string, string | number | null | number[]>
    const { error } = await supabase.rpc('update_item_custo', { p_id: itemId, p_patch: patch })
    if (error) throw error
  }, [])

  const atualizarRevLocal = useCallback((projetoId: string, rev: string) => {
    setProjetos(prev => prev.map(p => p.id === projetoId ? { ...p, rev } : p))
  }, [])

  return (
    <ProjetoContext.Provider value={{
      loading,
      clientes, criarCliente,
      tiposProjeto, criarTipoProjeto, renomearTipoProjeto, removerTipoProjeto,
      catalogo, renomearCategoriaCatalogo,
      setores,
      parametrosGlobais, atualizarParametroGlobal,
      parametrosAnuais, atualizarParametroAnual,
      tiposComTemplate, templates, fetchTemplateCategorias,
      templateAddCategoria, templateRemoveCategoria, templateUpdateCategoria,
      templateAddItem, templateRemoveItem, templateUpdateItem, templateSaveItem,
      projetos, criarProjeto, carregarTemplateExemplo, arquivarProjeto, concluirProjeto,
      atualizarConfigFinanceira,
      addCategoria, removeCategoria, updateCategoria, addItem, removeItem, updateItem, saveItem,
      atualizarRevLocal,
    }}>
      {children}
    </ProjetoContext.Provider>
  )
}
