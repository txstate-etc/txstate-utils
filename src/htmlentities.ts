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

/** Replaces characters in `str` to their HTML encoded escape values.
 * Returns an empty string if `str` is `undefined` or `null`.
 * @example
 * ```ts
 * htmlEncode('Text with WAVE breaking <h1>text</h1> in it.')
 * // Returns: 'Text with WAVE breaking &lt;h1&gt;text&lt;/h1&gt; in it.
 * ``` */
export function htmlEncode (str: string | undefined | null) {
  if (str == null) return ''
  return str.replace(badChars, escapeChar)
}
