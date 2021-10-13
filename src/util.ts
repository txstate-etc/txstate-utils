/**
 * returns a promise that will resolve in the specified number of
 * milliseconds
 */
export function sleep (milliseconds = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

/**
 * generates a random string guaranteed to start with an alpha
 * character, which makes it suitable for HTML `id` attribute
 */
export function randomid (length = 10) {
  return String.fromCharCode(97 + Math.floor(Math.random() * 26)) + Math.random().toString(36).slice(2, length + 1)
}

/**
 * useful for checking for empty strings, though in modern javascript
 * optional chaining may be easier: if (!str?.trim().length) ...
 */
export function isBlank (str: string|undefined|null): str is ''|undefined|null {
  return !str || !str.trim || str.trim().length === 0
}

/**
 * useful for checking for empty strings, though in modern javascript
 * optional chaining may be easier: if (str?.trim().length) ...
 */
export function isNotBlank <T extends string|undefined|null> (str: T): str is Exclude<T, undefined|null> {
  return !isBlank(str)
}

/**
 * useful for chaining Array.filter(isTruthy).map when using typescript; the map
 * variable will no longer be marked as optional
 *
 * also see: isNotNull
 */
export function isTruthy <T> (str: T): str is Exclude<T, undefined|null> {
  return Boolean(str)
}

/**
 * useful for checking if an object, string, or array is empty,
 * undefined, or null
 */
export function isEmpty (obj: any): boolean {
  if (obj == null) return true
  if (typeof obj === 'number') return false
  if (typeof obj === 'string') return isBlank(obj)
  if (typeof obj.length === 'number') return !obj.length
  if (typeof obj.isEmpty === 'function') return obj.isEmpty()
  if (typeof obj.size === 'function') return !obj.size()
  if (typeof obj === 'object') return !Object.keys(obj).length
  return !obj
}

/**
 * useful for checking if an object, string, or array is empty,
 * undefined, or null
 */
export function isNotEmpty <T> (obj: T): obj is Exclude<T, undefined|null> {
  return !isEmpty(obj)
}

/**
 * undefined and null both treated as null
 */
export function isNull (obj: any): obj is undefined|null {
  return obj == null
}

/**
 * undefined and null both treated as null
 */
export function isNotNull <T> (obj: T): obj is Exclude<T, undefined|null> {
  return obj != null
}

/**
 * only checks for valid syntax
 */
export function isEmail <T extends string|undefined|null> (email: T): email is Exclude<T, undefined|null> {
  return !!email && /^[a-z0-9!#$%&'*+/=?^_‘{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_‘{|}~-]+)*@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(email)
}

/**
 * escape a string to put inside a csv cell, adds quotes around it only
 * when necessary
 */
export function csvEscape (str: string) {
  if (!/[,\n"]/.test(str)) return str
  return '"' + str.replace(/"/g, '""') + '"'
}

/**
 * encode a full line of csv with properly escaped strings, adds an
 * appropriate line break at the end
 */
export function csvLine (values: string[]) {
  return values.map(csvEscape).join(',') + '\r\n'
}

/**
 * encode a full csv file with proper line breaks and escaped strings
 */
export function csv (lines: string[][]) {
  return lines.map(csvLine).join('')
}

/**
 * Convert something to a string but convert null|undefined to undefined instead of creating
 * 'undefined' and 'null' strings
 */
interface Stringable {
  toString: (...args: any) => string
}
export function optionalString (str: number|string|boolean|Stringable): string
export function optionalString (str: undefined|null): undefined
export function optionalString (str: any): string|undefined
export function optionalString (str: any): string|undefined|null {
  return str == null ? undefined : String(str)
}
