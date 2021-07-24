/**
 * works like Array.filter but expects a Promise<boolean> from each element
 * instead of a synchronous boolean
 *
 * Uses Promise.all; if you need an in-flight limit, use filterConcurrent
 * instead
 */
export async function filterAsync<ItemType> (items: ItemType[], callback: (item: ItemType) => Promise<boolean>) {
  const bools = await Promise.all(items.map(async item => {
    return await callback(item)
  }))
  return items.filter((item, index) => bools[index])
}

/**
 * modeled after rescue keyword from Ruby
 *
 * Provide a promise - if it successfully resolves the value is passed
 * through, but if it rejects the error will be caught and the default value
 * (or undefined) will be returned
 */
export async function rescue<ItemType> (promise: Promise<ItemType>): Promise<ItemType|undefined>
export async function rescue<ItemType, DefaultType> (promise: Promise<ItemType>, defaultValue: DefaultType): Promise<ItemType|DefaultType>
export async function rescue (promise: Promise<any>, defaultValue?: any) {
  try {
    return await promise
  } catch {
    return defaultValue
  }
}
