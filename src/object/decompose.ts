import { isNotBlank } from '../util.js'
import { set } from './set.js'

type DecomposableScalar = string | number | boolean | Date | undefined | null
type Decomposable = DecomposableScalar | { [key: string]: Decomposable } | Decomposable[]

export function decompose (payload: Decomposable | undefined): [string, DecomposableScalar][] {
  if (typeof payload !== 'object' || payload == null || payload instanceof Date) return payload != null && (typeof payload !== 'string' || isNotBlank(payload)) ? [['', payload]] : []
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
  return ret ?? {}
}

export function toQuery (payload: Decomposable) {
  return decompose(payload)
    .filter(([path, val]) => val != null)
    .map(([path, val]) => [path, val instanceof Date ? val.toISOString() : typeof val === 'string' && val.length && (!isNaN(Number(val)) || ['true', 'false'].includes(val) || val.includes('"')) ? '"' + encodeURIComponent(val) + '"' : String(val)])
    .map(([path, val]) => encodeURIComponent(path) + '=' + encodeURIComponent(val))
    .join('&')
}

export function fromQuery (str: string | undefined) {
  return recompose(
    (str ?? '').split('&').filter(isNotBlank).map(pair => pair.split('=').map(decodeURIComponent))
      .filter(([key, val]) => isNotBlank(val))
      .map(([key, val]) => [key, /^".*?"$/.test(val) ? decodeURIComponent(val.slice(1, -1)) : val.length && !isNaN(Number(val)) ? Number(val) : ['true', 'false'].includes(val) ? val === 'true' : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d{3})?(Z|[-+]\d{4})$/.test(val) ? new Date(val) : val])
  )
}
