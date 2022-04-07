import { stringify } from './stringify.js'
import { isNotNull } from './util.js'
import { toArray } from './array/index.js'

/**
 * Return the intersection of all given arrays. Output array will never contain undefined.
 *
 * Accepts an optional options object as the first argument:
 * * `by` is a function that transforms a complex object into something uniquely
 * identifying for the comparison. default is fast-json-stable-stringify. If the function
 * returns undefined, the item will not be included in the return array.
 * * `skipEmpty` changes the default behavior when one of the input arrays is empty,
 * normally an empty input array would mean the intersection is empty, but in some cases
 * (like specifying optional filters) an empty array should be ignored instead
 */
export function intersect <T = any> (options: { by?: (itm: T) => string|number|undefined|null, skipEmpty?: boolean }, ...arrs: (T[]|undefined|null)[]): T[]
export function intersect <T = any> (...arrs: (T[]|undefined|null)[]): T[]
export function intersect (...args: any[]) {
  const options = Array.isArray(args[0]) ? {} : args[0]
  options.by ??= stringify
  const arrs = Array.isArray(args[0]) ? args : args.slice(1)
  const arrsToUse = options.skipEmpty ? arrs.filter(arr => arr?.length) : arrs.map(arr => toArray(arr))
  if (arrsToUse.length === 0) return []
  else if (arrsToUse.length === 1) return arrsToUse[0].filter(isNotNull)
  let seen = new Set<string|number>(arrsToUse[0].filter(isNotNull).map(options.by).filter(isNotNull))
  let working = arrsToUse[0]
  const filterFn = (itm: any) => seen.has(options.by(itm))
  for (let i = 1; i < arrsToUse.length; i++) {
    working = arrsToUse[i].filter(filterFn)
    seen = new Set(working.filter(isNotNull).map(options.by).filter(isNotNull))
  }
  return working
}
