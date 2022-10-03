/**
 * works like Array.filter but expects a Promise<boolean> from each element
 * instead of a synchronous boolean
 *
 * Uses Promise.all; if you need an in-flight limit, use filterConcurrent
 * instead
 */
export async function filterAsync<ItemType> (items: ItemType[], callback: (item: ItemType) => boolean | Promise<boolean>) {
  const bools = await Promise.all(items.map(callback))
  return items.filter((_, index) => bools[index])
}

/**
 * works like Array.some but expects a Promise<boolean> from each element
 * instead of a synchronous boolean
 *
 * Uses Promise.all; if you need an in-flight limit, use someConcurrent
 * instead
 */
export async function someAsync<ItemType> (items: ItemType[], callback: (item: ItemType) => boolean | Promise<boolean>) {
  const bools = await Promise.all(items.map(callback))
  return items.some((_, index) => bools[index])
}

/**
 * modeled after rescue keyword from Ruby
 *
 * Provide a promise - if it successfully resolves the value is passed
 * through, but if it rejects the error will be caught and the default value
 * (or undefined) will be returned
 *
 * You may optionally provide a condition function to evaluate whether or not
 * to catch the error, and a logRescue function so that you can log the error
 * when it's caught. Note that if either of these functions throw your rescue will
 * also throw instead of returning a value.
 */
interface RescueOptions <DefaultType> {
  defaultValue?: DefaultType
  condition?: (e: Error) => boolean
  logRescue?: (e: Error) => void | Promise<void>
}
export async function rescue<ItemType> (promise: Promise<ItemType>): Promise<ItemType | undefined>
export async function rescue<ItemType, DefaultType> (promise: Promise<ItemType>, options: RescueOptions<DefaultType>): Promise<ItemType | DefaultType>
export async function rescue<ItemType, DefaultType> (promise: Promise<ItemType>, defaultValue: DefaultType): Promise<ItemType | DefaultType>
export async function rescue (promise: Promise<any>, defaultValueOrOptions?: any) {
  if (typeof defaultValueOrOptions !== 'object' || (!defaultValueOrOptions.condition && !defaultValueOrOptions.defaultValue)) {
    defaultValueOrOptions = { defaultValue: defaultValueOrOptions }
  }
  try {
    return await promise
  } catch (e: any) {
    if (!defaultValueOrOptions.condition || defaultValueOrOptions.condition(e)) {
      await defaultValueOrOptions.logRescue?.(e)
      return defaultValueOrOptions.defaultValue
    }
    throw e
  }
}
