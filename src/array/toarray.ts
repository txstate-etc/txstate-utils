/**
 * converts undefined or a scalar into an array, leaves existing array
 * untouched
 *
 * useful for cleansing input when you want to allow user to optionally
 * provide a singular scalar for convenience, e.g.:
 * cache.findById(53) and cache.findById([53. 78, 99])
 */
export function toArray (val: null | undefined): []
export function toArray <T, U> (val: T | [T] | [T, U]): [T] | [T, U]
export function toArray <T> (val: T | T[] | undefined | null): T[]
export function toArray <T> (val: T | T[] | undefined | null) {
  val ??= []
  return Array.isArray(val) ? val : [val]
}
