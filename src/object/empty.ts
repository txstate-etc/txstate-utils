import { isBlank, isNotBlank, isNotNull } from '../util.js'

function isEmptyWithUncertainty (obj: any): boolean | undefined {
  if (obj == null) return true
  if (obj instanceof Date) return obj.getTime() === 0
  if (typeof obj === 'number') return false
  if (typeof obj === 'string') return isBlank(obj)
  if (typeof obj.length === 'number') return !obj.length
  if (typeof obj.size === 'number') return !obj.size
  if (typeof obj.isEmpty === 'function') return obj.isEmpty()
  if (typeof obj.size === 'function') return !obj.size()
}

/**
 * useful for checking if an object, string, or array is empty,
 * undefined, or null
 */
export function isEmpty (obj: any): boolean {
  const certainty = isEmptyWithUncertainty(obj)
  if (certainty != null) return certainty
  if (typeof obj === 'object') return !Object.keys(obj as object).filter(k => isNotNull(obj[k])).length
  return !obj
}

/**
 * Much the same as isEmpty but ignore blank properties
 *
 * { hello: undefined } => both isEmpty and isPracticallyEmpty return true
 * { hello: '' } => isEmpty returns false, isPracticallyEmpty returns true
 * { hello: ' ' } => isEmpty returns false, isPracticallyEmpty returns true
 */
export function isPracticallyEmpty (obj: any) {
  const certainty = isEmptyWithUncertainty(obj)
  if (certainty != null) return certainty
  if (typeof obj === 'object') return !Object.keys(obj as object).filter(k => isNotBlank(obj[k])).length
  return !obj
}

/**
 * useful for checking if an object, string, or array is empty,
 * undefined, or null
 */
export function isNotEmpty <T> (obj: T): obj is Exclude<T, undefined | null> {
  return !isEmpty(obj)
}

/**
 * useful for checking if an object, string, or array is empty,
 * undefined, or null
 */
export function isNotPracticallyEmpty <T> (obj: T): obj is Exclude<T, undefined | null> {
  return !isPracticallyEmpty(obj)
}
