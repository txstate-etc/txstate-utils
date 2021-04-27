import stablestringify from 'fast-json-stable-stringify'
import { dotprop } from './object'

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
  const hash: Record<string|number, ObjectType|boolean> = {}
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

function vivifyadd (hash: any, key: any, val: any) {
  hash[key] ??= []
  hash[key].push(val)
}
export function groupby <ObjectType extends object> (objArray: ObjectType[]|undefined, key: keyof ObjectType): { [keys: string]: ObjectType[] }
export function groupby <ObjectType> (objArray: ObjectType[]|undefined, keyOrExtractor: string|number|symbol|((obj: ObjectType) => string|number|undefined)): { [keys: string]: ObjectType[] }
export function groupby <ObjectType> (objArray: ObjectType[]|undefined, keyOrExtractor: string|number|symbol|((obj: ObjectType) => string|number|undefined)) {
  const hash: Record<string|number, ObjectType[]> = {}
  if (!Array.isArray(objArray)) return hash
  if (typeof keyOrExtractor === 'function') {
    for (const obj of objArray) {
      const key = keyOrExtractor(obj)
      if (key != null) vivifyadd(hash, key, obj)
    }
  } else if (typeof keyOrExtractor === 'number' || typeof keyOrExtractor === 'symbol') {
    for (const obj of objArray) {
      const potentialkey = (obj as any)[keyOrExtractor]
      if (['string', 'number'].includes(typeof potentialkey)) vivifyadd(hash, potentialkey, obj)
    }
  } else {
    for (const obj of objArray) {
      const potentialkey: string|number|undefined = dotprop(obj, keyOrExtractor)
      if (['string', 'number'].includes(typeof potentialkey)) vivifyadd(hash, potentialkey, obj)
    }
  }
  return hash
}

/**
 * fast O(n) non-mutating array de-duplication based on a property,
 * dot-prop path, extractor function, or full serialized value
 */
export function unique<ObjectType> (arr: readonly ObjectType[], property: keyof ObjectType): ObjectType[]
export function unique<ObjectType> (arr: readonly ObjectType[], path: string): ObjectType[]
export function unique<ObjectType> (arr: readonly ObjectType[], extractKey: (obj: ObjectType) => any): ObjectType[]
export function unique<ObjectType> (arr: readonly ObjectType[]): ObjectType[]
export function unique<ObjectType> (arr: readonly ObjectType[], stringify: any = stablestringify) {
  if (typeof stringify !== 'function') {
    const key = stringify
    stringify = (obj: ObjectType) => dotprop(obj, key)
  }
  const seen: Set<string> = new Set()
  const ret: ObjectType[] = []
  for (const itm of arr) {
    const s = stringify(itm)
    const key = typeof s === 'string' ? s : stablestringify(s)
    if (!seen.has(key)) {
      ret.push(itm)
      seen.add(key)
    }
  }
  return ret
}

/**
 * fast O(n) non-mutating algorithm to shuffle an array
 */
export function shuffle<ObjectType> (shuffleArray: readonly ObjectType[]) {
  const copied = [...shuffleArray]
  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i)
    const temp = copied[i]
    copied[i] = copied[j]
    copied[j] = temp
  }
  return copied
}

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
