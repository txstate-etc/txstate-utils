import { extractors } from './extractors.js'

/**
 * fast O(n) non-mutating convert an array to an object with keys
 * defined by a property, dot-prop path, or extractor function
 *
 * An alternate usage exists when given an array of string or number:
 * in that case the return object maps the value to `true`. May be better
 * to use a Set for these cases.
 */
export function keyby (objArray: (string|number|undefined|null)[]|undefined): { [keys: string]: boolean }
export function keyby <ObjectType extends object> (objArray: ObjectType[]|undefined, key: keyof ObjectType): { [keys: string]: ObjectType }
export function keyby <ObjectType> (objArray: ObjectType[]|undefined, keyOrExtractor: string|number|symbol|((obj: ObjectType) => string|number|undefined)): { [keys: string]: ObjectType }
export function keyby <ObjectType> (objArray: ObjectType[]|undefined, keyOrExtractor?: string|number|symbol|((obj: ObjectType) => string|number|undefined)) {
  const hash: Record<string|number, ObjectType|boolean> = {}
  if (!Array.isArray(objArray)) return hash
  const extractor = extractors[typeof keyOrExtractor](keyOrExtractor)
  for (const obj of objArray) {
    const potentialkey = extractor(obj)
    if (
      potentialkey != null &&
      (typeof potentialkey === 'string' ||
      typeof potentialkey === 'number')
    ) hash[potentialkey] = keyOrExtractor == null ? true : obj
  }
  return hash
}

/**
 * @deprecated use keyby()
 */
export const hashify = keyby
