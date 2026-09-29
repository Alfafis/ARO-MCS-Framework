import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'

// Renderiza um nó offscreen como PDF A4 retrato, cortando as páginas apenas
// nos limites entre os cards (marcados via `[data-pdf-content-root]` > filhos
// diretos). Evita a fatia arbitrária que corta card no meio.
export async function exportNodeAsPdf(node: HTMLElement, filename: string) {
  const nodeRect = node.getBoundingClientRect()
  const contentRoot = node.querySelector<HTMLElement>('[data-pdf-content-root]')

  // Cut points em CSS px, relativos ao topo do nó. Sempre inclui o topo do
  // content root (fim do header) e o fim absoluto. Cada filho direto do
  // content root adiciona seu topo — cortar aí sai no meio do `gap-5`.
  const cutPointsCss: number[] = [0]
  if (contentRoot) {
    const rootRect = contentRoot.getBoundingClientRect()
    cutPointsCss.push(rootRect.top - nodeRect.top)
    for (const child of Array.from(contentRoot.children)) {
      const cRect = child.getBoundingClientRect()
      cutPointsCss.push(cRect.top - nodeRect.top)
    }
  }
  cutPointsCss.push(nodeRect.height)

  // Teto de área do canvas. Safari/iOS recusa canvas acima de ~16,7 milhões de
  // pixels e devolve um bitmap VAZIO em vez de lançar erro — o PDF sai em
  // branco, sem nada no console. Com `scale: 2` fixo, um relatório de ~10 cards
  // (1040 × 8000 CSS px) dá 33M px e estoura. Aqui a escala cai até caber, então
  // relatório longo perde nitidez em vez de falhar em silêncio.
  const MAX_CANVAS_PIXELS = 16_000_000
  const areaCss = nodeRect.width * nodeRect.height
  const scale = areaCss > 0 ? Math.max(1, Math.min(2, Math.sqrt(MAX_CANVAS_PIXELS / areaCss))) : 2

  const canvas = await html2canvas(node, {
    scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  })

  // Rede de segurança pro mesmo modo de falha: canvas de dimensão zero (limite
  // do browser, nó ainda sem layout) nunca deve virar um PDF em branco salvo
  // como se tivesse dado certo.
  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error(`html2canvas devolveu canvas vazio (${canvas.width}x${canvas.height})`)
  }

  const imgData = canvas.toDataURL('image/jpeg', 0.98)
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  const cssToMm = imgHeight / nodeRect.height
  const cutPointsMm = Array.from(new Set(cutPointsCss.map((y) => y * cssToMm))).sort((a, b) => a - b)

  let pageStart = 0
  let pageIndex = 0
  while (pageStart < imgHeight - 0.5) {
    if (pageIndex > 0) pdf.addPage()
    const maxEnd = pageStart + pageHeight
    // Maior cut > pageStart e <= maxEnd. Se nenhum card couber inteiro na
    // página, cai no maxEnd (corta um card no meio — só acontece com card
    // maior que A4).
    const candidates = cutPointsMm.filter((c) => c > pageStart + 1 && c <= maxEnd)
    const nextCut = candidates.length > 0 ? Math.max(...candidates) : Math.min(maxEnd, imgHeight)

    pdf.addImage(imgData, 'JPEG', 0, -pageStart, imgWidth, imgHeight)
    // Cobre com branco o que sobra abaixo do último card da página, evitando
    // vazar o começo do próximo card na folha atual.
    const usedOnPage = nextCut - pageStart
    if (usedOnPage < pageHeight - 0.5) {
      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, usedOnPage, pageWidth, pageHeight - usedOnPage, 'F')
    }
    pageStart = nextCut
    pageIndex++
  }

  pdf.save(filename)
}
