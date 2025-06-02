export type SortableTypes = boolean | string | number | Date

export const comparators: Record<string, (a: any, b: any) => number> = {
  boolean: (a: boolean, b: boolean) => Number(a) - Number(b),
  string: (a: string, b: string) => a.localeCompare(b),
  number: (a: number, b: number) => a - b,
  object: (a: any, b: any) => a - b
}
