import { get } from './get'

/**
 * A wrapper around get that works properly on mongoose
 * objects (for which you must call .toObject() before traversing)
 */
export function dotprop<ObjectType, Key extends keyof ObjectType> (obj: ObjectType, key: Key): ObjectType[Key]
export function dotprop<ObjectType> (obj: ObjectType, key: string): any
export function dotprop<ObjectType> (obj: ObjectType, key: string) {
  const usableObject = (obj as any).toObject ? (obj as any).toObject() : obj
  return get(usableObject, key)
}
