export function toRGBA (color: string | { red: number, green: number, blue: number, alpha?: number } | [number, number, number]) {
  if (typeof color === 'string') {
    const m = color.match(/rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\s*\)/i)
    if (m) {
      return { red: Number(m[1]), green: Number(m[2]), blue: Number(m[3]), alpha: m[4] ? Number(m[4]) : 1 }
    }
    if (color.startsWith('#')) color = color.substring(1)
    const redHex = color.substring(0, 2)
    const greenHex = color.substring(2, 4)
    const blueHex = color.substring(4, 6)
    return { red: parseInt(redHex, 16), green: parseInt(greenHex, 16), blue: parseInt(blueHex, 16), alpha: 1 }
  }
  if (Array.isArray(color)) {
    return { red: color[0], green: color[1], blue: color[2], alpha: 1 }
  }
  return { ...color, alpha: color.alpha ?? 1 }
}

/**
 * Determine best text color for a background color
 *
 * Uses the WCAG contrast formula to mathematically determine whether black or white provides the most contrast
 * with the given color.
 */
export function shouldUseWhiteText (color: string | { red: number, green: number, blue: number } | [number, number, number]) {
  const { red, green, blue } = toRGBA(color)
  const [r, g, b] = [red, green, blue].map(c => c / 255.0).map(c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum <= 0.179
}
