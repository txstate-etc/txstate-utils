import { extractors } from './extractors.js'

/**
 * fast O(n) non-mutating convert an array to a Map with keys
 * defined by a property, dot-prop path, or extractor function
 *
 * An alternate usage exists when given an array of string or number:
 * in that case the return Map maps the value to `true`. May be better
 * to use a Set for these cases.
 */
export function mapkeyby <ObjectType = string | number | undefined | null> (objArray: ObjectType[] | undefined): Map<ObjectType, boolean>
export function mapkeyby <ObjectType extends object, Key extends keyof ObjectType> (objArray: ObjectType[] | undefined, key: Key): Map<ObjectType[Key], ObjectType>
export function mapkeyby <ObjectType, KeyType = any> (objArray: ObjectType[] | undefined, key: string | number | symbol): Map<KeyType, ObjectType>
export function mapkeyby <ObjectType, KeyType> (objArray: ObjectType[] | undefined, extractor: (obj: ObjectType) => KeyType): Map<KeyType, ObjectType>
export function mapkeyby <ObjectType> (objArray: ObjectType[] | undefined, keyOrExtractor?: string | number | symbol | ((obj: ObjectType) => string | number | undefined)) {
  const map = new Map<string | number, ObjectType | boolean>()
  if (!Array.isArray(objArray)) return map
  const extractor = extractors[typeof keyOrExtractor](keyOrExtractor)
  if (keyOrExtractor == null) {
    for (const obj of objArray) {
      const potentialkey = extractor(obj)
      if (potentialkey != null) map.set(potentialkey, true)
    }
  } else {
    for (const obj of objArray) {
      const potentialkey = extractor(obj)
      if (potentialkey != null) map.set(potentialkey, obj)
    }
  }
  return map
}
