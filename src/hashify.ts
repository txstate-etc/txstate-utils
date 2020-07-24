import dp from 'dot-prop'

export function hashify <ObjectType extends Object, Key extends keyof ObjectType, KeyType extends (string|number)&ObjectType[Key]> (objArray: ObjectType[], key: Key): Record<KeyType, ObjectType>
export function hashify <ObjectType, FuncReturnType extends string|number> (objArray: ObjectType[], keyOrExtractor: string|number|((obj: ObjectType) => FuncReturnType|undefined)): Record<FuncReturnType, ObjectType>
export function hashify <ObjectType> (objArray: ObjectType[], keyOrExtractor: string|number|symbol|((obj: ObjectType) => string|number|undefined)) {
  const hash: Record<string|number, ObjectType> = {}
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
