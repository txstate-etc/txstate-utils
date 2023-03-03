import Queue from './queue.js'
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
export function eachConcurrent<ItemType, ReturnType> (items: ItemType[], inFlightLimitOrCallback: number | eachFunction<ItemType, ReturnType>, callback?: eachFunction<ItemType, ReturnType>) {
  const inFlightLimit = callback ? inFlightLimitOrCallback as number || 10 : 10
  const each = callback ?? inFlightLimitOrCallback as eachFunction<ItemType, ReturnType>
  const limit = pLimit(inFlightLimit)
  const qitems = items.map(item => limit(() => each(item)))
  return Promise.all(qitems)
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
export function mapConcurrent<ItemType, ReturnType> (items: ItemType[], inFlightLimitOrCallback: number | eachFunction<ItemType, ReturnType>, callback?: eachFunction<ItemType, ReturnType>) {
  return eachConcurrent(items, inFlightLimitOrCallback as number, callback as eachFunction<ItemType, ReturnType>)
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

type pLimitFn = (..._: any[]) => any
export function pLimit (concurrency: number) {
  const queue = new Queue<pLimitFn>()
  let activeCount = 0

  const next = () => {
    activeCount--
    queue.dequeue()?.()
  }

  const run = async (fn: pLimitFn, resolve: pLimitFn, args: any) => {
    activeCount++
    const result = (async () => fn(...args))()
    resolve(result)

    try {
      await result
    } catch {}

    next()
  }

  const enqueue = (fn: pLimitFn, resolve: pLimitFn, args: any) => {
    queue.enqueue(run.bind(undefined, fn, resolve, args));

    (async () => {
      await Promise.resolve()

      if (activeCount < concurrency) {
        queue.dequeue()?.()
      }
    })().catch(console.error)
  }

  const generator = (fn: pLimitFn, ...args: any[]) => new Promise(resolve => {
    enqueue(fn, resolve, args)
  })

  Object.defineProperties(generator, {
    activeCount: {
      get: () => activeCount
    },
    pendingCount: {
      get: () => queue.size
    },
    clearQueue: {
      value: () => {
        queue.clear()
      }
    }
  })

  return generator as { (fn: pLimitFn, ...args: any[]): Promise<unknown>, activeCount: number, pendingCount: number, clearQueue: () => void }
}
