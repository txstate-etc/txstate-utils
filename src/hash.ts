export function hash (s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0
  }
  return h
}

/**
 * Creates a consistent id string suitable for a DOM id
 *
 * The id will always come out the same for a given input string, but it
 * has low collision tolerance. Only use this when you must have a
 * consistent id.
 */
export function hashid (s: string) {
  return 'h' + hash(s).toString(36)
}
