const escapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
  '=': '&#x3D;'
}
const badChars = /[&<>"'`=]/g
function escapeChar (c: string) { return escapes[c] }

export function htmlEncode (str: string | undefined | null) {
  if (str == null) return ''
  return str.replace(badChars, escapeChar)
}
