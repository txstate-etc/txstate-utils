/**
 * Divide an array into an array of batch arrays
 *
 * For example:
 * batch([1, 2, 3, 4, 5, 6, 7, 8, 9], 3) -> [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
 */
export function batch<T = any> (input: T[], batchSize = 100) {
  const ret: T[][] = []
  if (!input?.length) return [[]]
  for (let i = 0; i < input.length; i += batchSize) {
    ret.push(input.slice(i, i + batchSize))
  }
  return ret
}
