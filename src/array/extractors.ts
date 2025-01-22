import { get } from '../object/index.js'

/**
 * Used internally by `keyby`, `groupby`, and others to normalize the key argument and
 * determine how to extract the value from an object
 *
 * If the key is a string, the txstate-utils `get` function is used to extract the value
 * If the key is a function, the function is used to extract the value
 * If the key is a number or symbol, the value is extracted directly
 * If the key is undefined, the object itself is returned instead of having a value extracted
 */
export const extractors: Record<string, (arg: any) => ((obj: any) => any)> = {
  undefined: () => {
    return (obj: any) => obj
  },
  function: (extractor: (obj: any) => string | number | undefined) => {
    return extractor
  },
  number: directKey,
  symbol: directKey,
  string: (key: string) => {
    return (obj: any) => get(obj, key)
  }
}

function directKey (key: number | symbol) {
  return (obj: any) => obj[key]
}
