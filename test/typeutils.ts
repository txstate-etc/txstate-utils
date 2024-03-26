import type { Jsonized } from '../lib'

type AfterJSON = Jsonized<{
  oobj?: {
    dt?: Date
  } | {
    str?: string
  }
  arr: { dt: Date }[]
  str: string
  ostr?: string
  num: number
  onum?: number
  dt: Date
  odt?: Date
  fn: () => void
  ofn?: () => void
  bool: boolean
  obool?: boolean
  obj: {
    num: number
  }
}>

const obj = {} as unknown as AfterJSON
obj.num = 12
