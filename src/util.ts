export function sleep (milliseconds = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

export function randomid () {
  return String.fromCharCode(97 + Math.floor(Math.random() * 26)) + Math.random().toString(36).slice(2, 11)
}

export function isBlank (str: string|undefined|null): str is ''|undefined|null {
  return !str || !str.trim || str.trim().length === 0
}

export function isNotBlank <T extends string|undefined|null> (str: T): str is Exclude<T, undefined|null> {
  return !isBlank(str)
}

export function isTruthy <T> (str: T): str is Exclude<T, undefined|null> {
  return Boolean(str)
}

export function isEmpty (obj: any): boolean {
  if (typeof obj === 'undefined' || obj === null) return true
  if (typeof obj === 'number') return false
  if (typeof obj === 'string') return isBlank(obj)
  if (typeof obj.length === 'number') return !obj.length
  if (typeof obj.isEmpty === 'function') return obj.isEmpty()
  if (typeof obj.size === 'function') return !obj.size()
  if (typeof obj === 'object') return !Object.keys(obj).length
  return !obj
}

export function isNotEmpty <T> (obj: T): obj is Exclude<T, undefined|null> {
  return !isEmpty(obj)
}

export function isEmail <T extends string|undefined|null> (email: T): email is Exclude<T, undefined|null> {
  return !!email && /^[a-z0-9!#$%&'*+/=?^_‘{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_‘{|}~-]+)*@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(email as string)
}

export function csvEscape (str: string) {
  if (!/[,\n"]/.test(str)) return str
  return '"' + str.replace(/"/g, '""') + '"'
}

export function csvLine (values: string[]) {
  return values.map(csvEscape).join(',') + '\r\n'
}

export function csv (lines: string[][]) {
  return lines.map(csvLine).join('')
}
