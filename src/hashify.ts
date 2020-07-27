import dp from 'dot-prop'

export function hashify <ObjectType extends object> (objArray: ObjectType[]|undefined, key: keyof ObjectType): { [keys: string]: ObjectType }
export function hashify <ObjectType> (objArray: ObjectType[]|undefined, keyOrExtractor: string|number|symbol|((obj: ObjectType) => string|number|undefined)): { [keys: string]: ObjectType }
export function hashify <ObjectType> (objArray: ObjectType[]|undefined, keyOrExtractor: string|number|symbol|((obj: ObjectType) => string|number|undefined)) {
  const hash: Record<string|number, ObjectType> = {}
  if (!Array.isArray(objArray)) return hash
  if (typeof keyOrExtractor === 'function') {
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
