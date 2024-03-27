import type { DestroyNulls } from '../typeutils'

export function destroyNulls<T> (obj: T): DestroyNulls<T> {
  if (obj == null) return undefined as any

  if (typeof obj === 'object') {
    for (const key in obj) {
      obj[key] = destroyNulls(obj[key]) as any
    }
  }
  return obj as any
}
