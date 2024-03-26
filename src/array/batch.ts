export function batch<T = any> (input: T[], batchSize = 100) {
  const ret: T[][] = []
  if (!input?.length) return [[]]
  for (let i = 0; i < input.length; i += batchSize) {
    ret.push(input.slice(i, i + batchSize))
  }
  return ret
}
