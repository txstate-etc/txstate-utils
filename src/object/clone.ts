function copyBuffer (cur: any) {
  if (cur instanceof Buffer) {
    return Buffer.from(cur)
  }

  return new cur.constructor(cur.buffer.slice(), cur.byteOffset, cur.length)
}

function isArguments (value: any): value is any[] {
  return !!value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'callee') && !Object.prototype.propertyIsEnumerable.call(value, 'callee')
}

const refs: any[] = []
const refsNew: any[] = []

function cloneArray (a: any[], fn: typeof clone) {
  const keys = Object.keys(a)
  const a2 = new Array(keys.length)
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i] as unknown as number
    const cur = a[k]
    if (typeof cur !== 'object' || cur === null || cur.isLuxonDateTime) {
      a2[k] = cur
    } else if (cur instanceof Date) {
      a2[k] = new Date(cur)
    } else if (ArrayBuffer.isView(cur)) {
      a2[k] = copyBuffer(cur)
    } else {
      const index = refs.indexOf(cur)
      if (index !== -1) {
        a2[k] = refsNew[index]
      } else {
        a2[k] = fn(cur)
      }
    }
  }
  return a2
}

export function clone <T> (o: T): T {
  if (typeof o !== 'object' || o === null) return o
  if (o instanceof Date) return new Date(o) as any
  if (Array.isArray(o)) return cloneArray(o, clone) as any
  if (o instanceof Map) return new Map(cloneArray(Array.from(o), clone)) as any
  if (o instanceof Set) return new Set(cloneArray(Array.from(o), clone)) as any
  if (isArguments(o)) return cloneArray(Array.from(o), clone) as any
  const o2: any = {}
  refs.push(o)
  refsNew.push(o2)
  for (const k in o) {
    if (!Object.hasOwnProperty.call(o, k)) continue
    const cur = o[k]
    if (typeof cur !== 'object' || cur === null || (cur as any).isLuxonDateTime) {
      o2[k] = cur
    } else if (cur instanceof Date) {
      o2[k] = new Date(cur)
    } else if (cur instanceof Map) {
      o2[k] = new Map(cloneArray(Array.from(cur), clone))
    } else if (cur instanceof Set) {
      o2[k] = new Set(cloneArray(Array.from(cur), clone))
    } else if (ArrayBuffer.isView(cur)) {
      o2[k] = copyBuffer(cur)
    } else {
      const i = refs.indexOf(cur)
      if (i !== -1) {
        o2[k] = refsNew[i]
      } else {
        o2[k] = clone(cur)
      }
    }
  }
  refs.pop()
  refsNew.pop()
  return o2
}
