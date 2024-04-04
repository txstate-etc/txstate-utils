import type { StringifyDates } from './typeutils.js'

/**
 * Return the date offset of the current device, e.g. '-0600'
 *
 * You might want to consider Intl.DateTimeFormat().resolvedOptions().timeZone which will
 * return e.g. 'America/Chicago'
 */
function dateOffset (dt: Date) {
  const offset = dt.getTimezoneOffset()
  if (offset === 0) return 'Z'
  const sign = offset < 0 ? '+' : '-'
  return `${sign}${String(Math.floor(offset / 60)).padStart(2, '0')}${String(offset % 60).padStart(2, '0')}`
}

/**
 * Convert a date to a string while retaining the timezone offset.
 *
 * For example, instead of converting to UTC and ending the string with a 'Z', like
 * JSON.stringify would do, this function will keep the timezone and append '-0600'
 * to signify that it was recorded on a device that was 6 hours off from UTC.
 */
export function dateToISOWithTZ (dt: Date) {
  return `${String(dt.getFullYear()).padStart(4, '0')}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}T${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}:${String(dt.getSeconds()).padStart(2, '0')}.${String(dt.getMilliseconds()).padStart(3, '0')}${dateOffset(dt)}`
}

/**
 * This function may be passed to JSON.stringify's second parameter to make Date
 * objects stringify with their time zone offset in tact.
 *
 * JSON.stringify(someobj, stringifyDateWithTZ)
 */
export function stringifyDateWithTZ (key: string, value: any) {
  if (value instanceof Date) return dateToISOWithTZ(value)
  return value
}

/**
 * Recurse through an object to find Date objects and convert them to strings
 * with dateToISOWithTZ
 */
export function stringifyDates<T> (obj: T): StringifyDates<T> {
  if (obj instanceof Date) return dateToISOWithTZ(obj) as any

  if (typeof obj === 'object' && obj != null) {
    for (const [key, val] of Object.entries(obj)) {
      ;(obj as any)[key] = stringifyDates(val)
    }
  }
  return obj as any
}
