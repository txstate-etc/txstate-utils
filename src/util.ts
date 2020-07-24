import dp from 'dot-prop'

export function sleep (milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

export function randomid () {
  return String.fromCharCode(97 + Math.floor(Math.random() * 26)) + Math.random().toString(36).slice(2, 11)
}

export function isBlank (str: string|undefined|null) {
  return !str || !str.trim || str.trim().length === 0
}

export function isEmpty (obj: any): boolean {
  if (typeof obj === 'undefined' || obj === null) return true
  if (typeof obj === 'number') return false
  if (typeof obj === 'string') return isBlank(obj)
  if (typeof obj.length === 'number') return !obj.length
  if (typeof obj.isEmpty === 'function') return obj.isEmpty()
  if (typeof obj.size === 'function') return !obj.size()
  if (typeof obj === 'object') return !Object.keys(obj).length
  return !obj
}

// export function hashify <ObjectType extends Object> (objArray: ObjectType[], key: string|number): Record<string|number, ObjectType>
// export function hashify <ObjectType> (objArray: ObjectType[], extractKey: (obj: ObjectType) => string|number): Record<string|number, ObjectType>
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
      const potentialkey = dp.get(obj, keyOrExtractor) as string|number|undefined
      if (potentialkey && ['string', 'number'].includes(typeof potentialkey)) hash[potentialkey] = obj
    }
  }
  return hash
}
