import { ChevronRight } from 'lucide-react'
import type { Cliente } from '@/types/clientes'

interface Props {
  cliente: Cliente
  projectsLabel: string
  onOpen: () => void
}

export default function ClienteRow({ cliente, projectsLabel, onOpen }: Props) {
  return (
    <button
      onClick={onOpen}
      className="w-full grid grid-cols-[36px_1fr_auto_16px] items-center gap-3 px-6 py-4 border-b border-[rgba(20,21,26,.08)] last:border-b-0 text-left bg-transparent border-0 border-x-0 border-t-0 cursor-pointer hover:bg-[#f9f8f7] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
    >
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] bg-[#f0eeec] font-mono font-bold text-[13px] text-c-text flex-none">
        {cliente.initials}
      </span>
      <span className="text-[0.875rem] font-semibold text-c-text truncate">{cliente.nome}</span>
      <span className="text-[0.8125rem] text-c-text-2 whitespace-nowrap">{projectsLabel}</span>
      <ChevronRight size={16} className="text-c-text-2" aria-hidden="true" />
    </button>
  )
}
