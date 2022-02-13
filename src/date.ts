function dateOffset (dt: Date) {
  const offset = dt.getTimezoneOffset()
  if (offset === 0) return 'Z'
  const sign = offset < 0 ? '+' : '-'
  return `${sign}${String(Math.floor(offset / 60)).padStart(2, '0')}${String(offset % 60).padStart(2, '0')}`
}

export function dateToISOWithTZ (dt: Date) {
  return `${String(dt.getFullYear()).padStart(4, '0')}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}T${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}:${String(dt.getSeconds()).padStart(2, '0')}.${String(dt.getMilliseconds()).padStart(3, '0')}${dateOffset(dt)}`
}

export function stringifyDateWithTZ (key: string, value: any) {
  if (value instanceof Date) return dateToISOWithTZ(value)
  return value
}
