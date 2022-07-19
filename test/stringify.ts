import { expect } from 'chai'
import { ensureString, stringify } from '../lib'

describe('stringify', function () {
  it('should work for a scalar', () => {
    expect(stringify('test')).to.equal(JSON.stringify('test'))
    expect(stringify(2)).to.equal(JSON.stringify(2))
  })
  it('should work for a deep object', () => {
    const obj = { should: { be: 'deep' } }
    expect(stringify(obj)).to.equal(JSON.stringify(obj))
  })
  it('should provide consistent key ordering', () => {
    const obj1 = { test: 'object', should: { be: 'deep' } }
    const obj2 = { should: { be: 'deep' }, test: 'object' }
    expect(stringify(obj1)).to.equal(stringify(obj2))
    expect(JSON.stringify(obj1)).to.not.equal(JSON.stringify(obj2))
  })
  it('should not reorder arrays', () => {
    const obj = { array: [5, 4, 3, 2, 1] }
    expect(stringify(obj)).to.equal(JSON.stringify(obj))
  })
  it('should match JSON.stringify on null and undefined inputs', () => {
    expect(stringify(null)).to.equal(JSON.stringify(null))
    expect(stringify(undefined)).to.equal(JSON.stringify(undefined))
  })
  it('should match JSON.stringify when given a quoted string', () => {
    expect(stringify('"test"')).to.equal(JSON.stringify('"test"'))
  })
})
describe('ensureString', () => {
  it('should not add quotes to a string', () => {
    expect(ensureString('test')).to.equal('test')
  })
})
