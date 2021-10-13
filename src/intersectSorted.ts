/* eslint-disable no-var */
/*
 * adapted from https://github.com/mafintosh/sorted-intersect
 * removed options and added types
 */
type Comparable = string|number|Date

function gallop (list: Comparable[], val: Comparable, offset: number) {
  if (offset >= list.length) return list.length

  let inc = 1
  let low = offset
  let high = offset + inc
  let mid

  while (high < list.length && list[high] < val) {
    low = high
    high += inc
    inc *= 2
  }

  if (high >= list.length) high = list.length - 1

  while (low < high) { // binary search
    mid = (low + high) >> 1
    if (val < list[mid]) {
      high = mid - 1
      continue
    }
    if (val > list[mid]) {
      low = mid + 1
      continue
    }

    return mid
  }

  if (list[low] >= val) return low
  return low + 1
}

/**
 * fast non-mutating intersection of multiple sorted arrays
 *
 * only works with array elements that can be compared with < and >
 *
 * returns incorrect result if any input array is out of order
 */
export function intersectSorted <T extends Comparable> (lists: T[][]) {
  const result: T[] = []
  const offsets: number[] = []

  for (let i = 0; i < lists.length; i++) offsets[i] = 0

  if (!lists.length) return result
  if (lists.length === 1) return lists[0]

  let matches = 0
  let done = false
  while (!done) {
    for (var j = 0; j < lists.length - 1; j++) {
      var listA = lists[j]
      var listB = lists[j + 1]
      var offsetA = offsets[j]
      var offsetB = offsets[j + 1]
      done = true

      while (offsetA < listA.length && offsetB < listB.length) {
        var valA = listA[offsetA]
        var valB = listB[offsetB]

        if (valA > valB) {
          matches = 0
          offsetB = gallop(listB, valA, offsetB)
          continue
        }
        if (valB > valA) {
          matches = 0
          offsetA = gallop(listA, valB, offsetA)
          continue
        }

        offsets[j] = offsetA
        offsets[j + 1] = offsetB
        done = false

        if (++matches === lists.length) {
          matches = 0
          result.push(lists[0][offsets[0]])
          for (var i = 0; i < offsets.length; i++) offsets[i]++
        }

        break
      }
      if (done) break
    }
  }

  return result
}
