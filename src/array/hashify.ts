import { dotprop } from '../object'

/**
 * fast O(n) non-mutating convert an array to an object with keys
 * defined by a property, dot-prop path, or extractor function
 *
 * An alternate usage exists when given an array of string or number:
 * in that case the return object maps the value to `true`. May be better
 * to use a Set for these cases.
 */
export function hashify (objArray: (string|number|undefined|null)[]|undefined): { [keys: string]: boolean }
export function hashify <ObjectType extends object> (objArray: ObjectType[]|undefined, key: keyof ObjectType): { [keys: string]: ObjectType }
export function hashify <ObjectType> (objArray: ObjectType[]|undefined, keyOrExtractor: string|number|symbol|((obj: ObjectType) => string|number|undefined)): { [keys: string]: ObjectType }
export function hashify <ObjectType> (objArray: ObjectType[]|undefined, keyOrExtractor?: string|number|symbol|((obj: ObjectType) => string|number|undefined)) {
  const hash: Record<string|number, ObjectType|boolean> = Object.create(null)
  if (!Array.isArray(objArray)) return hash
  if (typeof keyOrExtractor === 'undefined') {
    for (const obj of objArray) {
      if (typeof obj === 'string' || typeof obj === 'number') {
        hash[obj] = true
      } else if (typeof obj !== 'undefined' && obj !== null) {
        throw new Error('hashify called with no key extractor and an array value is too complex to be used as a hash key')
      }
    }
  } else if (typeof keyOrExtractor === 'function') {
    for (const obj of objArray) {
      const val = keyOrExtractor(obj)
      if (val) hash[val] = obj
    }
  } else if (typeof keyOrExtractor === 'number' || typeof keyOrExtractor === 'symbol') {
    for (const obj of objArray) {
      const potentialkey = (obj as any)[keyOrExtractor]
      if (potentialkey && ['string', 'number'].includes(typeof potentialkey)) hash[potentialkey] = obj
    }
  } else {
    for (const obj of objArray) {
      const potentialkey: string|number|undefined = dotprop(obj, keyOrExtractor)
      if (potentialkey && ['string', 'number'].includes(typeof potentialkey)) hash[potentialkey] = obj
    }
  }
  return hash
}
