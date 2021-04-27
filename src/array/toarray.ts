/**
 * converts undefined or a scalar into an array, leaves existing array
 * untouched
 *
 * useful for cleansing input when you want to allow user to optionally
 * provide a singular scalar for convenience, e.g.:
 * cache.findById(53) and cache.findById([53. 78, 99])
 */
export function toArray <T> (val: T | T[] | undefined | null) {
  val ??= []
  if (Array.isArray(val)) return val
  return [val]
}
