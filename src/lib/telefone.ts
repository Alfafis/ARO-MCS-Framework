// Mask leve, sem tabela de país: DDI só existe se o usuário digitar "+", sempre
// 2 dígitos (aproximação — DDI de 1 ou 3 dígitos, ex. EUA "+1", sai levemente
// errado, mas não valida nada, só organiza visualmente). Sem lib nova.
export function formatTelefone(raw: string): string {
  const hasPlus = raw.trimStart().startsWith('+')
  const digits = raw.replace(/\D/g, '').slice(0, 13)
  if (!digits) return hasPlus ? '+' : ''

  let resto = digits
  let ddi = ''
  if (hasPlus) {
    ddi = resto.slice(0, 2)
    resto = resto.slice(2)
  }

  const area = resto.slice(0, 2)
  const numero = resto.slice(2)
  const numeroFormatado = numero.length > 4 ? `${numero.slice(0, -4)}-${numero.slice(-4)}` : numero

  return [hasPlus && ddi ? `+${ddi}` : '', area, numeroFormatado].filter(Boolean).join(' ')
}
