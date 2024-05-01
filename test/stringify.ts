import { expect } from 'chai'
import { ensureString, stringify } from '../lib'

describe('stringify', function () {
  it('should work for a scalar', () => {
    expect(stringify('test')).to.equal(JSON.stringify('test'))
    expect(stringify(2)).to.equal(JSON.stringify(2))
    expect(stringify(true)).to.equal(JSON.stringify(true))
  })
  it('should support bigint if a replacer is provided', () => {
    function bigintReplacer (key: string, value: any) {
      return typeof value === 'bigint'
        ? value.toString()
        : value
    }
    expect(stringify(BigInt(5), bigintReplacer)).to.equal(JSON.stringify(BigInt(5), bigintReplacer))
  })
  it('should work for an array', () => {
    expect(stringify([1, 2, 3])).to.equal(JSON.stringify([1, 2, 3]))
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
  it('should match JSON.stringify on null input', () => {
    expect(stringify(null)).to.equal(JSON.stringify(null))
  })
  it('should always return a string even though JSON.stringify returns undefined for undefined', () => {
    expect(stringify(undefined)).to.equal(JSON.stringify(null))
  })
  it('should match JSON.stringify when a property value is undefined or null', () => {
    const o = {
      hello: undefined,
      world: null
    }
    expect(stringify(o)).to.equal(JSON.stringify(o))
  })
  it('should match JSON.stringify when given a quoted string', () => {
    expect(stringify('"test"')).to.equal(JSON.stringify('"test"'))
  })
  it('should match JSON.stringify when given a symbol as a key', () => {
    const obj = { [Symbol.for('key')]: 'hello' }
    expect(stringify(obj)).to.equal(JSON.stringify(obj))
  })
  it('should match JSON.stringify when given a symbol as a value', () => {
    const obj = { key: Symbol.for('hello') }
    expect(stringify(obj)).to.equal(JSON.stringify(obj))
  })
  it('should not change when symbols have different order', () => {
    const obj1 = { [Symbol.for('key1')]: 'hello', [Symbol.for('key2')]: 'world' }
    const obj2 = { [Symbol.for('key2')]: 'world', [Symbol.for('key1')]: 'hello' }
    expect(stringify(obj1)).to.equal(stringify(obj2))
  })
  it('should detect a cycle instead of throwing an error, this is a departure from JSON.stringify', () => {
    const obj1 = { obj2: {} }
    const obj2 = { obj1 }
    obj1.obj2 = obj2
    expect(stringify(obj1)).to.equal('{"obj2":{"obj1":"__cycle__"}}')
  })
  it('should not detect a cycle when a subobject appears multiple times but not in a cycle', () => {
    const subobj = { hi: 'there' }
    const obj = { deep: { subobj }, subobj }
    expect(stringify(obj)).to.equal(JSON.stringify(obj))
  })
})
describe('ensureString', () => {
  it('should not add quotes to a string', () => {
    expect(ensureString('test')).to.equal('test')
  })
})
