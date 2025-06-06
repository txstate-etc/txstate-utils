import { extractors } from './extractors.js'

/**
 * A function to group array rows by property value (or result of a function)
 *
 * Returns a `Map` whose keys are the property value (or the return from the
 * extractor function) and values are each an array of entries that produced
 * that value. For example:
 *
 * Example:
 * const books = [{ ... details ..., genre: 'mystery' }, { ... more books ... }]
 *
 * // extract the genre by providing a function that returns the genre
 * const booksByGenre = mapgroupby(books, book => book.genre)
 *
 * // extract the genre by providing the property name as a string
 * // this can also be a dot-separated path to a nested property
 * const alsoBooksByGenre = mapgroupby(books, 'genre')
 *
 * console.log(booksByGenre)
 * // Map(2) { mystery => [ ... mystery books ... ], adventure => [ ... adventure books ... ] }
 */
export function mapgroupby <ObjectType extends object, Key extends keyof ObjectType> (objArray: ObjectType[] | undefined, key: Key): Map<NonNullable<ObjectType[Key]>, ObjectType[]>
export function mapgroupby <ObjectType, KeyType = string | number | symbol | undefined> (objArray: ObjectType[] | undefined, key: string): Map<NonNullable<KeyType>, ObjectType[]>
export function mapgroupby <KeyType, ObjectType> (objArray: ObjectType[] | undefined, extractor: (obj: ObjectType) => KeyType): Map<NonNullable<KeyType>, ObjectType[]>
export function mapgroupby <KeyType, ObjectType> (objArray: ObjectType[] | undefined, keyOrExtractor: string | number | symbol | ((obj: ObjectType) => KeyType)) {
  const map = new Map<KeyType, ObjectType[]>()
  if (!Array.isArray(objArray)) return map
  const extractor = extractors[typeof keyOrExtractor](keyOrExtractor)
  for (const obj of objArray) {
    const key = extractor(obj) as KeyType
    if (key != null) {
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(obj)
    }
  }
  return map
}
