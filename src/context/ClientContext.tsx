import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ClientOption } from '@/components/layout/ClientSelector'

const CLIENTS: ClientOption[] = [
  { id: '1', name: 'NX Gold · Fechamento de Mina' },
  { id: '2', name: 'ARO · Plano de Fechamento 2024' },
  { id: '3', name: 'Mineração Horizonte · Fase 2' },
]

interface ClientContextValue {
  clients: ClientOption[]
  selectedClient: string
  currentClient: ClientOption
  setSelectedClient: (id: string) => void
}

const ClientContext = createContext<ClientContextValue | null>(null)

export function ClientProvider({ children }: { children: ReactNode }) {
  const [selectedClient, setSelectedClient] = useState(CLIENTS[0].id)
  const currentClient = CLIENTS.find(c => c.id === selectedClient) ?? CLIENTS[0]

  return (
    <ClientContext.Provider value={{ clients: CLIENTS, selectedClient, currentClient, setSelectedClient }}>
      {children}
    </ClientContext.Provider>
  )
}

export function useClient(): ClientContextValue {
  const ctx = useContext(ClientContext)
  if (!ctx) throw new Error('useClient must be used within ClientProvider')
  return ctx
}
