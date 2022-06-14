export function omit <T extends object, K extends keyof T> (obj: T, ...props: K[]): Omit<T, K> {
  const ret: any = { ...obj }
  for (const prop of props) delete ret[prop]
  return ret
}
