import { extractors } from './extractors.js'

/**
 * A function to group array rows by property value (or result of a function)
 *
 * Returns an object whose keys are the property value (or the return from the
 * extractor function) and values are each an array of entries that produced
 * that value. For example:
 *
 * Example:
 * const books = [{ ... details ..., genre: 'mystery' }, { ... more books ... }]
 *
 * // extract the genre by providing a function that returns the genre
 * const booksByGenre = groupby(books, book => book.genre)
 *
 * // extract the genre by providing the property name as a string
 * // this can also be a dot-separated path to a nested property
 * const alsoBooksByGenre = groupby(books, 'genre')
 *
 * console.log(booksByGenre)
 * // { mystery: [ ... mystery books ... ], adventure: [ ... adventure books ... ] }
 */
export function groupby <ObjectType extends object> (objArray: ObjectType[] | undefined, key: keyof ObjectType): Record<string, ObjectType[]>
export function groupby <ObjectType> (objArray: ObjectType[] | undefined, keyOrExtractor: string | number | symbol | ((obj: ObjectType) => string | number | undefined)): Record<string, ObjectType[]>
export function groupby <ObjectType> (objArray: ObjectType[] | undefined, keyOrExtractor: string | number | symbol | ((obj: ObjectType) => string | number | undefined)) {
  const hash: Record<string | number, ObjectType[]> = {}
  if (!Array.isArray(objArray)) return hash
  const extractor = extractors[typeof keyOrExtractor](keyOrExtractor)
  for (const obj of objArray) {
    const key = extractor(obj)
    const keytype = typeof key
    if (key != null && (keytype === 'string' || keytype === 'number')) {
      hash[key] ??= []
      hash[key].push(obj)
    }
  }
  return hash
}
