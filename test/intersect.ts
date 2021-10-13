import { expect } from 'chai'
import { intersect } from '../src'

describe('intersect', function () {
  it('should compute intersections correctly', () => {
    expect(intersect(
      [1, 2, 3],
      [1, 2, 4],
      [4, 5, 6]
    )).to.deep.equal([])

    expect(intersect(
      [1, 2, 3],
      [2, 3, 4],
      [0, 1, 2, 3, 4]
    )).to.deep.equal([2, 3])

    expect(intersect(
      [1, 2, 3],
      [1, 2, 3],
      [1, 2, 3]
    )).to.deep.equal([1, 2, 3])

    expect(intersect(
      [1, 2, 3],
      [1, 2, 3],
      []
    )).to.deep.equal([])

    expect(intersect(
      [1, 2, 3, 4, 5],
      [1, 2, 3],
      [5, 6, 7, 8],
      [9, 10, 11, 12]
    )).to.deep.equal([])

    expect(intersect(
      [1, 3],
      [1, 2, 3],
      [1, 2, 3],
      [1, 2, 4]
    )).to.deep.equal([1])

    expect(intersect(
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8]
    )).to.deep.equal([])
  })
  it('should ignore empty arrays when the skipEmpty option is true', () => {
    expect(intersect({ skipEmpty: true }, [1, 2], [2, 3], []))
      .to.deep.equal([2])
  })
  it('should use the by function for comparisons when provided', () => {
    expect(intersect({ by: itm => itm.id },
      [{ id: 1, otherprop: 'hi' }, { id: 2, otherprop: 'there' }],
      [{ id: 1, otherprop: 'there' }, { id: 2, otherprop: 'hi' }]
    )).to.have.lengthOf(2)
  })
  it('should remove undefined from any of the input arrays', () => {
    expect(intersect([undefined, 1, 2], [undefined, 2, 3]))
      .to.deep.equal([2])
    expect(intersect([undefined, 1, 2]))
      .to.deep.equal([1, 2])
  })
})
