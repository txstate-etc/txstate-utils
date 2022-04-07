/**
 * A stable stringify function that sorts object keys before stringifying
 * so that identical objects with different key ordering will stringify to identical
 * strings.
 *
 * If the object being stringified contains cycles, the deeper appearance
 * of the cycled object will be replaced with the string '__cycle__'
 */
export function stringify (data: undefined): undefined
export function stringify (data: any): string
export function stringify (data: any) {
  const seen: any[] = []
  return (function stringify (node: any) {
    if (typeof node?.toJSON === 'function') {
      node = node.toJSON()
    }

    if (node === undefined) return
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    if (typeof node === 'number') return isFinite(node) ? '' + node : 'null'
    if (typeof node !== 'object') return JSON.stringify(node)

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
