import dp from 'dot-prop'

export function hashify (objArray: (string|number)[]|undefined): { [keys: string]: boolean }
export function hashify <ObjectType extends object> (objArray: ObjectType[]|undefined, key: keyof ObjectType): { [keys: string]: ObjectType }
export function hashify <ObjectType> (objArray: ObjectType[]|undefined, keyOrExtractor: string|number|symbol|((obj: ObjectType) => string|number|undefined)): { [keys: string]: ObjectType }
export function hashify <ObjectType> (objArray: ObjectType[]|undefined, keyOrExtractor?: string|number|symbol|((obj: ObjectType) => string|number|undefined)) {
  const hash: Record<string|number, ObjectType|boolean> = {}
  if (!Array.isArray(objArray)) return hash
  if (typeof keyOrExtractor === 'undefined') {
    for (const obj of objArray) {
      if (typeof obj === 'string' || typeof obj === 'number') {
        hash[obj] = true
      } else {
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
      const potentialkey: string|number|undefined = dp.get(obj, keyOrExtractor)
      if (potentialkey && ['string', 'number'].includes(typeof potentialkey)) hash[potentialkey] = obj
    }
  }
  return hash
}
