import { comparators, type SortableTypes } from './array/comparators.js'
import { extractors } from './array/extractors.js'

export class PriorityQueue<T = any> {
  #heap: (T | undefined)[]
  #length: number
  #compare: (a: T | undefined, b: T | undefined) => number
  #comparator!: (a: SortableTypes, b: SortableTypes) => number

  constructor (compareby?: number | symbol | string | ((a: T) => SortableTypes | undefined | null)) {
    this.#heap = []
    this.#length = 0
    const extract = extractors[typeof compareby](compareby)
    this.#compare = (a, b) => {
      const aval: SortableTypes = extract(a)
      const bval: SortableTypes = extract(b)
      if (aval == null && bval == null) return 0
      if (this.#comparator == null) {
        let t = typeof aval
        t ??= typeof bval
        this.#comparator = comparators[t]
      }
      if (aval == null) return 1
      if (bval == null) return -1
      return this.#comparator(aval, bval)
    }
  }

  enqueue (item: T) {
    this.#heap.push(item)
    this.#up(this.#length++)
  }

  dequeue () {
    if (this.#length === 0) return undefined

    const top = this.#heap[0]
    const bottom = this.#heap.pop()

    if (--this.#length > 0) {
      this.#heap[0] = bottom
      this.#down(0)
    }

    return top
  }

  peek () {
    return this.#heap[0]
  }

  clear () {
    this.#heap = []
    this.#length = 0
  }

  get size () {
    return this.#length
  }

  * [Symbol.iterator] (): Generator<T> {
    while (this.#length > 0) {
      yield this.dequeue()!
    }
  }

  #up (idx: number) {
    const item = this.#heap[idx]

    while (idx > 0) {
      const parent = (idx - 1) >> 1
      const current = this.#heap[parent]
      if (this.#compare(item, current) >= 0) break
      this.#heap[idx] = current
      idx = parent
    }

    this.#heap[idx] = item
  }

  #down (idx: number) {
    const midpoint = this.#length >> 1
    const item = this.#heap[idx]

    while (idx < midpoint) {
      let candidate = (idx << 1) + 1
      const right = candidate + 1

      if (right < this.#length && this.#compare(this.#heap[right], this.#heap[candidate]) < 0) {
        candidate = right
      }
      if (this.#compare(this.#heap[candidate], item) >= 0) break

      this.#heap[idx] = this.#heap[candidate]
      idx = candidate
    }

    this.#heap[idx] = item
  }
}
