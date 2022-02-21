/**
 * I frequently find myself making a mistake with Array.prototype.findIndex() - it
 * returns -1 when not found and I expect undefined, like I get with Array.prototype.find()
 *
 * This function returns undefined by default, or you can specify the number to return
 * when not found.
 */
export function findIndex <T> (haystack: T[], cb: (itm: T) => boolean, def?: number) {
  const idx = haystack.findIndex(cb)
  return idx < 0 ? def : idx
}
