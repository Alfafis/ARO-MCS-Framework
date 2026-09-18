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

  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  })
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
