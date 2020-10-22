import dp from 'dot-prop'
import stablestringify from 'fast-json-stable-stringify'

// I often want to get properties from a mongoose object, but
// dotProp does not work on them, so here is a convenience function
// that does
export function dotprop<ObjectType, Key extends keyof ObjectType> (obj: ObjectType, key: Key): ObjectType[Key]
export function dotprop<ObjectType> (obj: ObjectType, key: string): any
export function dotprop<ObjectType> (obj: ObjectType, key: string) {
  const usableObject = (obj as any).toObject ? (obj as any).toObject() : obj
  return dp.get(usableObject, key)
}

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

export function unique<ObjectType> (arr: ObjectType[], property: keyof ObjectType): ObjectType[]
export function unique<ObjectType> (arr: ObjectType[], path: string): ObjectType[]
export function unique<ObjectType> (arr: ObjectType[], extractKey: (obj: ObjectType) => any): ObjectType[]
export function unique<ObjectType> (arr: ObjectType[]): ObjectType[]
export function unique<ObjectType> (arr: ObjectType[], stringify: any = stablestringify) {
  if (typeof stringify !== 'function') {
    const key = stringify
    stringify = (obj: ObjectType) => dotprop(obj, key)
  }
  const seen: { [keys: string]: true|undefined } = {}
  const ret = []
  for (const e of arr) {
    const s = stringify(e)
    const key = typeof s === 'string' ? s : stablestringify(s)
    if (!seen[key]) {
      ret.push(e)
      seen[key] = true
    }
  }
  return ret
}

export function shuffle<ObjectType> (shuffleArray: ObjectType[]) {
  const copied = [...shuffleArray]
  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i)
    const temp = copied[i]
    copied[i] = copied[j]
    copied[j] = temp
  }
  return copied
}
