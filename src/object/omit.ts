export function omit <T extends object, K extends keyof T> (obj: T, ...props: K[]): Omit<T, K> {
  const ret: any = { ...obj }
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  for (const prop of props) delete ret[prop]
  return ret
}
