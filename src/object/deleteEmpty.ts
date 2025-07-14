import { isNotEmpty } from './empty.js'

export function deleteEmpty (payload: any): any {
  if (payload != null && typeof payload === 'object' && !(payload instanceof Date)) {
    if (Array.isArray(payload)) {
      return payload.map(deleteEmpty).filter(isNotEmpty)
    } else if (payload.toJSON && typeof payload.toJSON === 'function') {
      // If the object has a toJSON method, use it to get a clean representation
      const json = payload.toJSON()
      return deleteEmpty(json)
    } else {
      return Object.fromEntries(Object.entries(payload as object).map(([key, val]) => [key, deleteEmpty(val)]).filter(([key, val]) => isNotEmpty(val)))
    }
  }
  return payload
}
