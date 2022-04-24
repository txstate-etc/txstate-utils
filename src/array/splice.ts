/**
 * A non-mutating alternative to Array.splice. Returns the new array.
 */
export function splice <T> (arr: T[], start: number, deleteCount?: number): T[]
export function splice <T> (arr: T[], start: number, deleteCount: number, ...items: T[]): T[]
export function splice <T> (arr: T[], start: number, deleteCount?: number, ...items: T[]) {
  const newArr = [...arr]
  if (deleteCount == null) newArr.splice(start)
  else newArr.splice(start, deleteCount, ...items)
  return newArr
}
