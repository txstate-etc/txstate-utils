/**
 * returns a promise that will resolve in the specified number of
 * milliseconds
 */
export function sleep (milliseconds = 0) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
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
export function isBlank (str: string | undefined | null): str is '' | undefined | null {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return !str || !str.trim || str.trim().length === 0
}

/**
 * useful for checking for empty strings, though in modern javascript
 * optional chaining may be easier: if (str?.trim().length) ...
 */
export function isNotBlank <T extends string | undefined | null> (str: T): str is Exclude<T, undefined | null> {
  return !isBlank(str)
}

/**
 * useful for chaining Array.filter(isTruthy).map when using typescript; the map
 * variable will no longer be marked as optional
 *
 * also see: isNotNull
 */
export function isTruthy <T> (str: T): str is Exclude<T, undefined | null> {
  return Boolean(str)
}

/**
 * undefined and null both treated as null
 */
export function isNull (obj: any): obj is undefined | null {
  return obj == null
}

/**
 * undefined and null both treated as null
 */
export function isNotNull <T> (obj: T): obj is Exclude<T, undefined | null> {
  return obj != null
}

/**
 * only checks for valid syntax
 */
export function isEmail <T extends string | undefined | null> (email: T): email is Exclude<T, undefined | null> {
  return !!email && /^[a-z0-9!#$%&'*+/=?^_‘{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_‘{|}~-]+)*@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(email)
}

interface Stringable {
  toString: (...args: any) => string
}
/**
 * Convert something to a string but convert null|undefined to undefined instead of creating
 * 'undefined' and 'null' strings
 */
export function optionalString (str: number | string | boolean | Stringable): string
export function optionalString (str: undefined | null): undefined
export function optionalString (str: any): string | undefined
export function optionalString (str: any): string | undefined | null {
  return str == null ? undefined : String(str)
}

/**
 * Print a variable if a condition is met
 *
 * Optionally provide a boolean as the first parameter to control whether to print anything.
 * For example, `printIf(mystate.showcontent, mystate.content)` will print the contents of
 * mystate.content only if mystate.showcontent is truthy.
 *
 * Always outputs an empty string instead of 'undefined' or 'null', so you do not have to
 * explicitly check mystate.content against null.
 *
 * Generally shorter/easier than (mystate.showcontent && mystate.content != null ? mystate.content : '')
 * 
 * @note This isn't intended for use with string interpolation as the interpolation will evaluate
 * as a parameter to the function before entering this function and testing the conditional.
 */
export function printIf (condition: any, str: number | string | boolean | Stringable | undefined | null): string
export function printIf (str: number | string | boolean | Stringable | undefined | null): string
export function printIf (...args: any[]): string {
  if (args.length === 1) return args[0] == null ? '' : String(args[0])
  return args[0] && args[1] != null ? String(args[1]) : ''
}

export function roundTo (num: number, digits = 0) {
  const conversion = Math.pow(10, digits)
  return Math.round((num + Number.EPSILON) * conversion) / conversion
}

export function bytesToHuman (bytes: number) {
  if (!bytes) return '0 bytes'
  const scales = [' bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const scale = Math.min(5, Math.floor(Math.log(bytes) / Math.log(1024)))
  return String(parseFloat((bytes / Math.pow(1024, scale)).toPrecision(3))) + scales[scale]
}
