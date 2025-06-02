import { comparators, type SortableTypes } from './comparators.js'
import { extractors } from './extractors.js'

/**
 * Sort array by a specific property or transformation
 *
 * May also provide an array of properties or transformations to provide tiebreakers.
 *
 * Follow any property or transformation with a `true` argument if you want a descending sort.
 *
 * Comparison algorithm is chosen automatically and supports strings, numbers, and
 * dates.
 *
 * undefined or null will always sort to the bottom. If you want them to sort to the top, you
 * can .reverse() the output array and invert your descending booleans.
 *
 * Examples:
 *
 * simple sort by a property
 * sortby(myarray, 'myproperty')
 *
 * simple descending sort
 * sortby(myarray, 'myproperty', true)
 *
 * sort with a tiebreaker property
 * sortby(myarray, 'myproperty', 'mynextproperty')
 *
 * sort descending with a tiebreaker
 * sortby(myarray, 'myproperty', true, 'mynextproperty')
 *
 * sort with a descending tiebreaker
 * sortby(myarray, 'myproperty', 'mynextproperty', true)
 *
 * sort with a transformation
 * sortby(myarray, itm => itm.count - 100)
 */
export function sortby <T> (collection: T[], ...args: (boolean | keyof T | string | ((obj: T) => SortableTypes | undefined | null))[]) {
  const extractorlist: (keyof T | string | ((obj: T) => SortableTypes | undefined | null))[] = []
  const descending: boolean[] = []
  for (const arg of args) {
    if (arg === true) {
      descending[descending.length - 1] = true
    } else if (arg !== false) {
      extractorlist.push(arg)
      descending.push(false)
    }
  }
  const sortMap = new Map<T, (SortableTypes | undefined)[]>()
  for (const itm of collection) sortMap.set(itm, [])
  const compares: ((a: SortableTypes, b: SortableTypes) => number)[] = []
  for (const extract of extractorlist) {
    let comparechosen: undefined | 'string' | 'number' | 'object' | 'boolean'
    const handleval = function (val: SortableTypes | undefined, itm: T) {
      const t = typeof val
      if (t !== 'undefined') {
        if (!comparechosen) {
          compares.push(comparators[t])
          comparechosen = t as 'string' | 'number' | 'object' | 'boolean'
        } else if (comparechosen !== t) {
          compares[compares.length - 1] = comparators.number
        }
      }
      sortMap.get(itm)!.push(val)
    }
    const extractor = extractors[typeof extract](extract)
    for (const itm of collection) {
      handleval(extractor(itm) as SortableTypes | undefined ?? undefined, itm)
    }
  }
  return collection.sort((a: T, b: T) => {
    const avals = sortMap.get(a)!
    const bvals = sortMap.get(b)!
    for (let i = 0; i < compares.length; i++) {
      const aval = avals[i]
      const bval = bvals[i]
      const desc = (descending[i] ? -1 : 1)
      if (aval == null) {
        if (bval == null) continue
        return 1
      }
      if (bval == null) return -1
      const cmp = compares[i](aval, bval)
      if (cmp !== 0) return cmp * desc
    }
    return 0
  })
}
