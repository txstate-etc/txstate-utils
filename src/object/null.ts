import type { DestroyNulls } from '../typeutils.js'

export function destroyNulls<T> (obj: T): DestroyNulls<T> {
  if (obj == null) return undefined as any

  if (typeof obj === 'object' && !(obj instanceof Date)) {
    for (const [key, val] of Object.entries(obj)) {
      ;(obj as any)[key] = destroyNulls(val)
    }
  }
  return obj as any
}
