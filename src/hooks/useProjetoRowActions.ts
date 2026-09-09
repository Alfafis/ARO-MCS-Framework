import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjeto } from '@/context/useProjeto'
import type { Projeto } from '@/types/clientes'

export type ProjetoRowAction =
  | 'concluir'
  | 'arquivar'
  | 'excluir'
  | 'categorias'
  | 'relatorio'
  | 'gerar-link'
  | 'gerar-codigo'

// Compartilhado entre ClienteProjetos e Projetos (lista global) — mesma lógica de
// ação em linha de projeto, pra não divergir entre as duas telas. 'excluir' é
// tratado pela página (confirm dialog + toast), este hook ignora.
export function useProjetoRowActions(rows: Projeto[]) {
  const navigate = useNavigate()
  const { arquivarProjeto, concluirProjeto } = useProjeto()
  const [linkCopied, setLinkCopied] = useState(false)
  const [codeModalFor, setCodeModalFor] = useState<Projeto | null>(null)

  const handleAction = useCallback(
    (id: string, action: ProjetoRowAction) => {
      if (action === 'gerar-link') {
        const url = `${window.location.origin}/relatorio/${id}`
        navigator.clipboard.writeText(url).catch(() => prompt('Copie o link do relatório:', url))
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2500)
      } else if (action === 'gerar-codigo') {
        const row = rows.find((r) => r.id === id)
        if (row) setCodeModalFor(row)
      } else if (action === 'relatorio') {
        navigate(`/relatorio/${id}`)
      } else if (action === 'categorias') {
        navigate(`/projetos/${id}/categorias`)
      } else if (action === 'arquivar') {
        arquivarProjeto(id)
      } else if (action === 'concluir') {
        concluirProjeto(id)
      }
      // 'excluir' cai fora — página trata (confirm dialog + toast)
    },
    [navigate, rows, arquivarProjeto, concluirProjeto]
  )

  return { handleAction, linkCopied, codeModalFor, setCodeModalFor }
}
