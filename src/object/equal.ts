export function equal (a: any, b: any): boolean
export function equal (a: any, b: any, compared?: { a: Set<any>, b: Set<any> }) {
  if (a === b) return true

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (a.constructor !== b.constructor) return false

    compared ??= { a: new Set(), b: new Set() }
    if (compared.a.has(a) && compared.b.has(b)) return true
    compared.a.add(a)
    compared.b.add(b)

    let length, i
    if (Array.isArray(a)) {
      length = a.length
      if (length !== b.length) return false
      for (i = length; i-- !== 0;) { if (!(equal as any)(a[i], b[i], compared)) return false }
      return true
    }

    if ((a instanceof Map) && (b instanceof Map)) {
      if (a.size !== b.size) return false
      for (i of a.entries()) { if (!b.has(i[0])) return false }
      for (i of a.entries()) { if (!(equal as any)(i[1], b.get(i[0]), compared)) return false }
      return true
    }

    if ((a instanceof Set) && (b instanceof Set)) {
      if (a.size !== b.size) return false
      for (i of a.entries()) { if (!b.has(i[0])) return false }
      return true
    }

    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf()
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString()

    const keys = nonNullKeys(a)
    length = keys.length
    const bkeys = nonNullKeys(b)
    if (length !== bkeys.length) return false

    for (i = length; i-- !== 0;) { if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false }

    for (i = length; i-- !== 0;) {
      const key = keys[i]

      if (!(equal as any)(a[key], b[key], compared)) return false
    }

    return true
  }

  // true if both NaN, false otherwise
  // eslint-disable-next-line no-self-compare
  return a !== a && b !== b
}

function nonNullKeys (a: any) {
  const ret: string[] = []
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  for (const k of Object.keys(a)) if (a[k] != null) ret.push(k)
  return ret
}
