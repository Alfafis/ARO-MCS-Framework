export interface InviteCode {
  code:        string
  clientId:    string
  clientName:  string
  projectName: string
}

export const INVITE_CODES: InviteCode[] = [
  { code: 'NXGOLD-2024', clientId: '1', clientName: 'NX Gold',               projectName: 'Fechamento de Mina'       },
  { code: 'AROMIN-01',   clientId: '2', clientName: 'ARO',                   projectName: 'Plano de Fechamento 2024' },
  { code: 'MHFASE2',     clientId: '3', clientName: 'Mineração Horizonte',   projectName: 'Fase 2'                   },
]

export function validateCode(code: string): InviteCode | null {
  return INVITE_CODES.find(c =>
    c.code.toLowerCase() === code.toLowerCase().trim()
  ) ?? null
}

export function getCodeByClientId(clientId: string): InviteCode | null {
  return INVITE_CODES.find(c => c.clientId === clientId) ?? null
}
