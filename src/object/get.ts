import { pathSeperatorRegex } from './common'

/**
 * tiny alternative to dot-prop or lodash.get that only works with
 * JSON-compatible objects
 */
export function get<InputType, Accessor extends keyof InputType> (root: InputType, path: Accessor, defaultValue?: InputType[Accessor]): InputType[Accessor]
export function get<ReturnType = any> (root: any, path: string | number | (string|number)[], defaultValue?: ReturnType): ReturnType
export function get<ReturnType = any> (root: any, path: string | number | (string|number)[], defaultValue?: ReturnType) {
  try {
    if (Array.isArray(path)) path = "['" + path.join("']['") + "']"
    if (path in root || typeof path === 'number') return root[path as string]
    let obj = root
    path.replace(
      pathSeperatorRegex,
      (whole, _quotationMark, quotedProp, namedProp, index) => {
        obj = obj[quotedProp || namedProp || index]
        return whole
      }
    )
    return obj ?? defaultValue
  } catch (err) {
    return defaultValue
  }
}
