type StringifyReplacer = (this: any, key: string, value: any) => any

/**
 * A stable stringify function that sorts object keys before stringifying
 * so that identical objects with different key ordering will stringify to identical
 * strings.
 *
 * If the object being stringified contains cycles, the deeper appearance
 * of the cycled object will be replaced with the string '__cycle__'
 */
export function stringify (data: any, replacer?: StringifyReplacer) {
  const seen: any[] = []
  return (function stringify (node: any) {
    if (typeof node?.toJSON === 'function') {
      node = node.toJSON()
    }

    if (node === undefined) return 'undefined'
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    if (typeof node === 'number') return isFinite(node) ? '' + node : 'null'
    if (typeof node !== 'object') return JSON.stringify(node, replacer)

    let i, out
    if (Array.isArray(node)) {
      out = '['
      for (i = 0; i < node.length; i++) {
        if (i) out += ','
        out += stringify(node[i]) ?? 'null'
      }
      return out + ']'
    }

    if (node === null) return 'null'

    if (seen.includes(node)) {
      return JSON.stringify('__cycle__')
    }

    const seenIndex = seen.push(node) - 1
    const keys = Object.keys(node).sort()
    out = ''
    for (i = 0; i < keys.length; i++) {
      const key = keys[i]
      const value = stringify(node[key])

      if (!value) continue
      if (out) out += ','
      out += JSON.stringify(key) + ':' + value
    }
    seen.splice(seenIndex, 1)
    return '{' + out + '}'
  })(data)
}

/**
 * Frequently you just want to make sure you have a string in order
 * to key an object, but it's not technically for JSON purposes and
 * you don't want to add quotes around an existing string.
 *
 * stringify('mystring') === '"mystring"'
 * ensureString('mystring') === 'mystring'
 */
export function ensureString (data: undefined): undefined
export function ensureString (data: any): string
export function ensureString (data: any): string | undefined {
  return typeof data === 'string' ? data : stringify(data)
}
