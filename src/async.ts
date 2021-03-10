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
