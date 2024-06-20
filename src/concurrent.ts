/* eslint-disable @typescript-eslint/promise-function-async */
/** Functions for helping deal with promises */

type eachFunction<ItemType, ReturnType> = (item: ItemType) => Promise<ReturnType>
/**
 * Works like Array.forEach() except runs things concurrently / in parallel.
 * Limits operations to a configurable in-flight maximum.
 *
 * Callback should return a promise
 *
 * Returns a promise containing the array of results
 */
export function eachConcurrent<ItemType, ReturnType> (items: ItemType[], inFlightLimit: number, callback: eachFunction<ItemType, ReturnType>): Promise<ReturnType[]>
export function eachConcurrent<ItemType, ReturnType> (items: ItemType[], callback: eachFunction<ItemType, ReturnType>): Promise<ReturnType[]>
export async function eachConcurrent<ItemType, ReturnType> (items: ItemType[], inFlightLimitOrCallback: number | eachFunction<ItemType, ReturnType>, callback?: eachFunction<ItemType, ReturnType>) {
  const inFlightLimit = callback ? inFlightLimitOrCallback as number || 10 : 10
  const each = callback ?? inFlightLimitOrCallback as eachFunction<ItemType, ReturnType>
  const limit = pLimit(inFlightLimit)
  const qitems = items.map(async item => await limit(async () => await each(item)))
  return await Promise.all(qitems)
}

/**
 * Works like Array.map() except runs things concurrently / in parallel.
 * Limits operations to a configurable in-flight maximum.
 *
 * Callback should return a promise
 *
 * Returns a promise containing the array of results
 */
export function mapConcurrent<ItemType, ReturnType> (items: ItemType[], inFlightLimit: number, callback: eachFunction<ItemType, ReturnType>): Promise<ReturnType[]>
export function mapConcurrent<ItemType, ReturnType> (items: ItemType[], callback: eachFunction<ItemType, ReturnType>): Promise<ReturnType[]>
export async function mapConcurrent<ItemType, ReturnType> (items: ItemType[], inFlightLimitOrCallback: number | eachFunction<ItemType, ReturnType>, callback?: eachFunction<ItemType, ReturnType>) {
  return await eachConcurrent(items, inFlightLimitOrCallback as number, callback!)
}

/**
 * Works like Array.filter() except runs things concurrently / in parallel.
 * Limits operations to a configurable in-flight maximum.
 *
 * Callback should return a promise
 *
 * Returns a promise containing the array of items that returned true
 */
export async function filterConcurrent<ItemType> (items: ItemType[], inFlightLimit: number, callback: eachFunction<ItemType, boolean>): Promise<ItemType[]>
export async function filterConcurrent<ItemType> (items: ItemType[], callback: eachFunction<ItemType, boolean>): Promise<ItemType[]>
export async function filterConcurrent<ItemType> (items: ItemType[], inFlightLimitOrCallback: number | eachFunction<ItemType, boolean>, callback?: eachFunction<ItemType, boolean>) {
  const inFlightLimit = callback ? inFlightLimitOrCallback as number : 10
  const each = callback ?? inFlightLimitOrCallback as eachFunction<ItemType, boolean>
  const bools = await eachConcurrent(items, inFlightLimit, async item => {
    return !!(await each(item))
  })
  return items.filter((_, index) => bools[index])
}

/**
 * Works like Array.some() except runs things concurrently / in parallel.
 * Limits operations to a configurable in-flight maximum.
 *
 * Callback should return a promise
 *
 * Returns a promise containing the array of items that returned true
 */
export async function someConcurrent<ItemType> (items: ItemType[], inFlightLimit: number, callback: eachFunction<ItemType, boolean>): Promise<boolean>
export async function someConcurrent<ItemType> (items: ItemType[], callback: eachFunction<ItemType, boolean>): Promise<boolean>
export async function someConcurrent<ItemType> (items: ItemType[], inFlightLimitOrCallback: number | eachFunction<ItemType, boolean>, callback?: eachFunction<ItemType, boolean>) {
  const inFlightLimit = callback ? inFlightLimitOrCallback as number : 10
  const each = callback ?? inFlightLimitOrCallback as eachFunction<ItemType, boolean>
  const bools = await eachConcurrent(items, inFlightLimit, async item => {
    return !!(await each(item))
  })
  return items.some((_, index) => bools[index])
}

interface Node<T = any, A extends unknown[] = any> {
  /** input function, returns a promise when run */
  fn: (...args: A) => Promise<T>
  /** desired arguments for the input function */
  args: A
  /** function to resolve returned promise */
  resolve: (value: T) => void
  /** function to reject returned promise */
  reject: (reason: any) => void
  /** pointer to the next node */
  next?: Node<T>
}

type pLimitFn <T = any, A extends unknown[] = unknown[]> = (..._: A) => Promise<T>

export function pLimit (concurrency: number) {
  let active = 0
  let size = 0
  let head: Node | undefined
  let tail: Node | undefined

  const afterRun = () => {
    active--
    if (--size) run()
  }

  const run = () => {
    if (!head || active >= concurrency) return
    active++
    const pop = head
    head = head.next
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    void pop.fn(...pop.args).then(pop.resolve, pop.reject).then(afterRun)
  }

  const generator = <T, A extends unknown[]> (fn: pLimitFn<T, A>, ...args: A) => new Promise<T>((resolve, reject) => {
    const node: Node<T, A> = { fn, args, resolve, reject }
    if (head) {
      tail = tail!.next = node
    } else {
      tail = head = node
    }
    size++
    run()
  })

  Object.defineProperties(generator, {
    activeCount: {
      get: () => active
    },
    pendingCount: {
      get: () => size - active
    },
    clearQueue: {
      value: () => {
        head = tail = undefined
        size = active
      }
    }
  })

  return generator as { <T, A extends unknown[]>(fn: pLimitFn<T, A>, ...args: A): Promise<T>, activeCount: number, pendingCount: number, clearQueue: () => void }
}
