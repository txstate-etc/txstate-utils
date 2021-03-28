const { isArray } = Array

type ObjectOrArray = Record<string, any> | Array<any> | null | undefined
const clone = (objectOrArray: ObjectOrArray): ObjectOrArray =>
  isArray(objectOrArray) ? Array.from(objectOrArray) : Object.assign({}, objectOrArray)

const pathSeperatorRegex = /\[\s*(['"])(.*?)\1\s*\]|(?:^|\.)\s*(\w+)\s*(?=\.|\[|$)|\[\s*(-?\d+)\s*\]/g

/**
 * tiny alternative to dot-prop or lodash.get that only works with
 * JSON-compatible objects
 */
export function get<ReturnType = any> (root: any, path: string | number | (string|number)[], defaultValue?: ReturnType) {
  try {
    if (isArray(path)) path = "['" + path.join("']['") + "']"
    if (path in root || typeof path === 'number') return root[path as string]
    let obj = root
    path.replace(
      pathSeperatorRegex,
      // @ts-expect-error
      (_whole, _quotationMark, quotedProp, namedProp, index) => {
        obj = obj[quotedProp || namedProp || index]
      }
    )
    return obj ?? defaultValue
  } catch (err) {
    return defaultValue
  }
}

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
  if (isArray(path)) path = "['" + path.join("']['") + "']"
  const newRoot: any = clone(root)

  if (path in newRoot || typeof path === 'number') {
    // Just set it directly: no need to loop
    newRoot[path as string] = newValue
    return newRoot
  }

  let currentParent: any = newRoot
  let previousKey: string
  let previousKeyIsArrayIndex: boolean = false
  path.replace(
    pathSeperatorRegex,
    // @ts-expect-error
    (wholeMatch, _quotationMark, quotedProp, namedProp, index) => {
      if (previousKey) {
        // Clone (or create) the object/array that we were just at: this lets us keep it attached to its parent.
        const previousValue = currentParent[previousKey]
        currentParent[previousKey] = previousValue
          ? clone(previousValue)
          : previousKeyIsArrayIndex
            ? []
            : {}

        // Now advance
        currentParent = currentParent[previousKey]
      }

      previousKey = namedProp || quotedProp || index
      previousKeyIsArrayIndex = !!index
    }
  )

  currentParent[previousKey!] = newValue
  return newRoot
}
