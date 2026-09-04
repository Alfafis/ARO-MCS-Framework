// Deriva os tons escuro/claro (hoje --accent-700/--accent-100 fixos em
// index.css) a partir de UMA cor base escolhida pelo consultor. Aproximação
// deliberada, não fidelidade colorimétrica ao design original: escurece a
// luminosidade em ~10pp pro tom escuro, clareia bastante + dessatura pro tom
// claro (tinta quase branca com o matiz). Suficiente pra "personalização",
// não pretende reproduzir exatamente a paleta verde original pra outra cor.

function hexParaHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: l * 100 }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h: number
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) * 60
      break
    case g:
      h = ((b - r) / d + 2) * 60
      break
    default:
      h = ((r - g) / d + 4) * 60
  }
  return { h, s: s * 100, l: l * 100 }
}

function hslParaHex(h: number, s: number, l: number): string {
  const sN = Math.min(100, Math.max(0, s)) / 100
  const lN = Math.min(100, Math.max(0, l)) / 100
  const c = (1 - Math.abs(2 * lN - 1)) * sN
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lN - c / 2
  let [r, g, b] = [0, 0, 0]
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export interface TonsAccent {
  base: string
  escuro: string
  claro: string
}

export function derivarTonsAccent(base: string): TonsAccent {
  const { h, s, l } = hexParaHsl(base)
  return {
    base,
    escuro: hslParaHex(h, s, Math.max(0, l - 10)),
    claro: hslParaHex(h, s * 0.85, Math.min(96, l + 60)),
  }
}
