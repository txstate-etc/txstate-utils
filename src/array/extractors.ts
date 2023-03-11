import { get } from '../object/index.js'

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
