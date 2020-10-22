export async function filterAsync<ItemType> (items: ItemType[], callback: (item: ItemType) => Promise<boolean>) {
  const bools = await Promise.all(items.map(async item => {
    return await callback(item)
  }))
  return items.filter((item, index) => bools[index])
}
