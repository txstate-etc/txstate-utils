import { expect } from 'chai'
import { destroyNulls } from '../lib'

describe('destroyNulls', function () {
  it('should change null to undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(destroyNulls(null)).to.equal(undefined)
  })
  it('should remove null properties from objects', () => {
    expect(JSON.stringify(destroyNulls({ test: null }))).to.equal('{}')
  })
  it('should not interfere with stringification of an array', () => {
    expect(JSON.stringify(destroyNulls([1, 2, null]))).to.equal('[1,2,null]')
  })
  it('should not interfere with stringification of a nested array', () => {
    expect(JSON.stringify(destroyNulls({ test: [1, 2, null] }))).to.equal('{"test":[1,2,null]}')
  })
})
