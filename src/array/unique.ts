import { stringify as stablestringify } from '../stringify.js'
import { get } from '../object/index.js'

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
    stringify = (obj: ObjectType) => get(obj, key)
  }
  const seen = new Set<string>()
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
