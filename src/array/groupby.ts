import { dotprop } from '../object'

function vivifyadd (hash: any, key: any, val: any) {
  hash[key] ??= []
  hash[key].push(val)
}

/**
 * A function to group array rows by property value (or result of a function)
 *
 * Returns an object whose keys are the return value of the extractor function
 * and values are each an array of entries that produced that value. For example:
 *
 * const books = [{ ... details ..., genre: 'mystery' }, { ... more books ... }]
 * const booksByGenre = groupby(books, book => book.genre)
 * const alsoBooksByGenre = groupby(books, 'genre')
 * console.log(booksByGenre) // { mystery: [ ... mystery books ... ], adventure: [ ... adventure books ... ] }
 */
export function groupby <ObjectType extends object> (objArray: ObjectType[]|undefined, key: keyof ObjectType): { [keys: string]: ObjectType[] }
export function groupby <ObjectType> (objArray: ObjectType[]|undefined, keyOrExtractor: string|number|symbol|((obj: ObjectType) => string|number|undefined)): { [keys: string]: ObjectType[] }
export function groupby <ObjectType> (objArray: ObjectType[]|undefined, keyOrExtractor: string|number|symbol|((obj: ObjectType) => string|number|undefined)) {
  const hash: Record<string|number, ObjectType[]> = Object.create(null)
  if (!Array.isArray(objArray)) return hash
  if (typeof keyOrExtractor === 'function') {
    for (const obj of objArray) {
      const key = keyOrExtractor(obj)
      if (key != null) vivifyadd(hash, key, obj)
    }
  } else if (typeof keyOrExtractor === 'number' || typeof keyOrExtractor === 'symbol') {
    for (const obj of objArray) {
      const potentialkey = (obj as any)[keyOrExtractor]
      if (['string', 'number'].includes(typeof potentialkey)) vivifyadd(hash, potentialkey, obj)
    }
  } else {
    for (const obj of objArray) {
      const potentialkey: string|number|undefined = dotprop(obj, keyOrExtractor)
      if (['string', 'number'].includes(typeof potentialkey)) vivifyadd(hash, potentialkey, obj)
    }
  }
  return hash
}
