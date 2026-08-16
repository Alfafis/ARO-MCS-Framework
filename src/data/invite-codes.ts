export interface ReportCode {
  code:        string
  clientName:  string
  projectName: string
}

const STORAGE_KEY = 'aro_report_codes'

type CodeMap = Record<string, ReportCode>  // reportId → ReportCode

function loadCodes(): CodeMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function saveCodes(map: CodeMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

function randomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const arr = new Uint8Array(10)
  crypto.getRandomValues(arr)
  const seg = (bytes: Uint8Array) =>
    Array.from(bytes).map(b => chars[b % chars.length]).join('')
  return `${seg(arr.slice(0, 5))}-${seg(arr.slice(5))}`
}

export function getCodeForReport(reportId: string): string | null {
  return loadCodes()[reportId]?.code ?? null
}

export function setCodeForReport(
  reportId:    string,
  code:        string,
  clientName:  string,
  projectName: string,
): void {
  const map = loadCodes()
  map[reportId] = { code: code.toUpperCase().trim(), clientName, projectName }
  saveCodes(map)
}

export function generateCodeForReport(
  reportId:    string,
  clientName:  string,
  projectName: string,
): string {
  const code = randomCode()
  setCodeForReport(reportId, code, clientName, projectName)
  return code
}

export function validateCodeForReport(reportId: string, code: string): boolean {
  const entry = loadCodes()[reportId]
  if (!entry) return false
  return entry.code.toLowerCase() === code.toLowerCase().trim()
}
