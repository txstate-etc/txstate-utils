import { ObjectOrArray, pathSeperatorRegex } from './common'

const clone = (objectOrArray: ObjectOrArray): ObjectOrArray =>
  Array.isArray(objectOrArray) ? Array.from(objectOrArray) : Object.assign({}, objectOrArray)

/**
 * tiny non-mutating alternative to dot-prop or lodash.set that only
 * works with JSON-compatible objects
 *
 * accepts a generic to optionally set the output type, otherwise assumes
 * your mutation will not alter the object's type
 */
export function set<O = undefined, T extends ObjectOrArray = ObjectOrArray> (
  root: T,
  path: string | number | Array<string | number>,
  newValue: unknown
): (O extends undefined ? T : O) {
  if (Array.isArray(path)) path = "['" + path.join("']['") + "']"
  const newRoot: any = clone(root)

  if (path in newRoot || typeof path === 'number') {
    // Just set it directly: no need to loop
    newRoot[path as string] = newValue
    return newRoot
  }

  let currentParent: any = newRoot
  let previousKey: string
  path.replace(
    pathSeperatorRegex,
    (whole, _quotationMark, quotedProp, namedProp, index) => {
      if (previousKey) {
        // Clone (or create) the object/array that we were just at: this lets us keep it attached to its parent.
        const previousValue = currentParent[previousKey]
        currentParent[previousKey] = previousValue
          ? clone(previousValue)
          : index
            ? []
            : {}

        // Now advance
        currentParent = currentParent[previousKey]
      }
      previousKey = namedProp || quotedProp || index
      return whole
    }
  )

  currentParent[previousKey!] = newValue
  return newRoot
}
