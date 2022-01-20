import { expect } from 'chai'
import { intersectSorted } from '../lib'

describe('intersectSorted', function () {
  it('should compute sorted intersections correctly', () => {
    expect(intersectSorted([
      [1, 2, 3],
      [1, 2, 4],
      [4, 5, 6]
    ])).to.deep.equal([])

    expect(intersectSorted([
      [1, 2, 3],
      [2, 3, 4],
      [0, 1, 2, 3, 4]
    ])).to.deep.equal([2, 3])

    expect(intersectSorted([
      [1, 2, 3],
      [1, 2, 3],
      [1, 2, 3]
    ])).to.deep.equal([1, 2, 3])

    expect(intersectSorted([
      [1, 2, 3],
      [1, 2, 3],
      []
    ])).to.deep.equal([])

    expect(intersectSorted([
      [1, 2, 3, 4, 5],
      [1, 2, 3],
      [5, 6, 7, 8],
      [9, 10, 11, 12]
    ])).to.deep.equal([])

    expect(intersectSorted([
      [1, 3],
      [1, 2, 3],
      [1, 2, 3],
      [1, 2, 4]
    ])).to.deep.equal([1])

    expect(intersectSorted([
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8]
    ])).to.deep.equal([])
  })
})
