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

/** Returns the result of replacing HTML reserved characters in `str` with their HTML encoded escape values.
 * @returns an empty string if `str` is `undefined` or `null`.
 * @example
 * ```ts
 * htmlEncode('Text with WAVE breaking <h1>text</h1> in it.')
 * // Returns: 'Text with WAVE breaking &lt;h1&gt;text&lt;/h1&gt; in it.'
 * ``` */
export function htmlEncode (str: string | undefined | null) {
  if (str == null) return ''
  return str.replace(badChars, escapeChar)
}
