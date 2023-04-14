/* eslint-disable no-cond-assign */
const escapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
  '=': '&#x3D;'
}
function escapeChar (c: string) { return escapes[c] }

/** Returns the result of replacing HTML reserved characters in `str` with their HTML encoded escape values.
 * @returns an empty string if `str` is `undefined` or `null`.
 * @example
 * ```ts
 * htmlEncode('Text with WAVE breaking <h1>text</h1> in it.')
 * // Returns: 'Text with WAVE breaking &lt;h1&gt;text&lt;/h1&gt; in it.'
 * ``` */
export function htmlEncode (str: string | undefined | null) {
  if (str == null) return ''
  return str.replace(/[&<>"'`=]/g, escapeChar)
}

const htmlDecodeMap: Record<string, string> = {
  nbsp: ' ',
  cent: '¢',
  pound: '£',
  yen: '¥',
  euro: '€',
  copy: '©',
  reg: '®',
  lt: '<',
  gt: '>',
  quot: '"',
  amp: '&',
  apos: '\''
}

function htmlDecodeReplacer (entity: string, entityCode: string) {
  if (htmlDecodeMap[entityCode]) return htmlDecodeMap[entityCode]
  let m
  if (m = entityCode.match(/^#x([\da-fA-F]+)$/)) return String.fromCharCode(parseInt(m[1], 16))
  if (m = entityCode.match(/^#(\d+)$/)) return String.fromCharCode(~~m[1])
  return entity
}

export function htmlDecode (str: string) {
  return str.replace(/&([^;]+);/g, htmlDecodeReplacer)
};
