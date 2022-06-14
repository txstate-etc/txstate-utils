export function pick <T extends object, K extends keyof T> (obj: T, ...props: K[]): Pick<T, K> {
  const ret: any = {}
  for (const prop of props) ret[prop] = obj[prop]
  return ret
}
