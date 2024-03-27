import type { DestroyNulls } from '../typeutils'

export function destroyNulls<T> (obj: T): DestroyNulls<T> {
  if (obj == null) return undefined as any

  if (obj.constructor.name === 'Object') {
    for (const key in obj) {
      obj[key] = destroyNulls(obj[key]) as any
    }
  }
  return obj as any
}
