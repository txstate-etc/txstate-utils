import pLimit from 'p-limit'
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
export function eachConcurrent<ItemType, ReturnType> (items: ItemType[], inFlightLimitOrCallback: number|eachFunction<ItemType, ReturnType>, callback?: eachFunction<ItemType, ReturnType>) {
  const inFlightLimit = callback ? inFlightLimitOrCallback as number : 10
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
export function mapConcurrent<ItemType, ReturnType> (items: ItemType[], inFlightLimitOrCallback: number|eachFunction<ItemType, ReturnType>, callback?: eachFunction<ItemType, ReturnType>) {
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
export async function filterConcurrent<ItemType> (items: ItemType[], inFlightLimitOrCallback: number|eachFunction<ItemType, boolean>, callback?: eachFunction<ItemType, boolean>) {
  const inFlightLimit = callback ? inFlightLimitOrCallback as number : 10
  const each = callback ?? inFlightLimitOrCallback as eachFunction<ItemType, boolean>
  const bools = await eachConcurrent(items, inFlightLimit, async item => {
    return !!(await each(item))
  })
  return items.filter((item, index) => bools[index])
}
