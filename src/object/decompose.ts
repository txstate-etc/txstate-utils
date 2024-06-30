import { set } from './set'

type DecomposableScalar = string | number | boolean | Date
type Decomposable = DecomposableScalar | { [key: string]: Decomposable } | Decomposable[]

export function decompose (payload: Decomposable | undefined): [string, DecomposableScalar][] {
  if (typeof payload !== 'object' || payload instanceof Date) return payload != null ? [['', payload]] : []
  if (Array.isArray(payload)) {
    return payload.flatMap((itm, i) => decompose(itm).map<[string, DecomposableScalar]>(([path, val]) => [i + (!path || path.startsWith('[') ? '' : '.') + path, val]))
  } else {
    return Object.entries(payload).flatMap(([key, itm]) => decompose(itm).map<[string, DecomposableScalar]>(([path, val]) => [(key.includes('.') || !isNaN(Number(key)) ? '["' + key + '"]' : key) + (!path || path.startsWith('[') ? '' : '.') + path, val]))
  }
}

export function recompose (paths: [string, DecomposableScalar][]) {
  let ret: Decomposable | undefined
  for (const [key, val] of paths) {
    ret = set(ret as any, key, val)
  }
  return ret
}

export function toQuery (payload: Decomposable) {
  return decompose(payload)
    .map(([path, val]) => [path, val instanceof Date ? val.toISOString() : typeof val === 'string' && (!isNaN(Number(val)) || ['true', 'false'].includes(val) || val.includes('"')) ? '"' + encodeURIComponent(val) + '"' : String(val)])
    .map(([path, val]) => encodeURIComponent(path) + '=' + encodeURIComponent(val))
    .join('&')
}

export function fromQuery (str: string) {
  return recompose(
    str.split('&').map(pair => pair.split('=').map(decodeURIComponent))
      .map(([key, val]) => [key, /^".*?"$/.test(val) ? decodeURIComponent(val.slice(1, -1)) : !isNaN(Number(val)) ? Number(val) : ['true', 'false'].includes(val) ? val === 'true' : !isNaN(Date.parse(val)) ? new Date(val) : val])
  )
}
