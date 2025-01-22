/* eslint-disable @typescript-eslint/no-unused-expressions */
import { keyby, unique, shuffle, toArray, groupby, findIndex, splice, mapkeyby, mapgroupby, batch, shuffleInPlace } from '../lib'
import { expect } from 'chai'

describe('keyby', () => {
  const sym = Symbol('id')
  const records = [
    { [sym]: 1, idnum: 1, idstr: 'one', name: 'One', deep: { id: 1 } },
    { [sym]: 2, idnum: 2, idstr: 'two', name: 'Two', deep: { id: 2 } },
    { [sym]: 3, idnum: 3, idstr: 'three', name: 'Three', deep: { id: 3 } },
    { [sym]: 4, idnum: 4, idstr: 'four', name: 'Four' }
  ]
  it('should work with a shallow string property that returns numbers', () => {
    const hashed = keyby(records, 'idnum')
    expect(Object.keys(hashed)).to.have.lengthOf(4)
    expect(hashed[1].name).to.equal('One')
  })
  it('should work with a shallow symbol property that returns numbers', () => {
    const hashed = keyby(records, sym)
    expect(Object.keys(hashed)).to.have.lengthOf(4)
    expect(hashed[1].name).to.equal('One')
  })
  it('should work with a shallow string properties that returns strings', () => {
    const hashed = keyby(records, 'idstr')
    expect(Object.keys(hashed)).to.have.lengthOf(4)
    expect(hashed.one.name).to.equal('One')
  })
  it('should work with deep properties', () => {
    const hashed = keyby(records, 'deep.id')
    expect(Object.keys(hashed)).to.have.lengthOf(3)
    expect(hashed[1].name).to.equal('One')
  })
  it('should work with an extractor function', () => {
    const hashed = keyby(records, record => record?.deep?.id)
    expect(Object.keys(hashed)).to.have.lengthOf(3)
    expect(hashed[1].name).to.equal('One')
  })
  it('should be null safe', () => {
    const hashed = keyby(undefined, 'id')
    expect(hashed).to.be.a('object')
    expect(Object.keys(hashed)).to.have.lengthOf(0)
  })
  it('should map to booleans when given an array of numbers or strings', () => {
    const hashed = keyby([1, 3, 5, 7])
    expect(hashed[3]).to.equal(true)
    expect(hashed[4]).to.equal(undefined)
  })
})

describe('mapkeyby', () => {
  const sym = Symbol('id')
  const records = [
    { [sym]: 1, idnum: 1, idstr: 'one', name: 'One', deep: { id: 1 } },
    { [sym]: 2, idnum: 2, idstr: 'two', name: 'Two', deep: { id: 2 } },
    { [sym]: 3, idnum: 3, idstr: 'three', name: 'Three', deep: { id: 3 } },
    { [sym]: 4, idnum: 4, idstr: 'four', name: 'Four' }
  ]
  it('should work with a shallow string property that returns numbers', () => {
    const mapped = mapkeyby(records, 'idnum')
    expect(mapped.size).to.equal(4)
    expect(mapped.get(1)!.name).to.equal('One')
  })
  it('should work with a shallow symbol property that returns numbers', () => {
    const mapped = mapkeyby(records, sym)
    expect(mapped.size).to.equal(4)
    expect(mapped.get(1)!.name).to.equal('One')
  })
  it('should work with a shallow string properties that returns strings', () => {
    const mapped = mapkeyby(records, 'idstr')
    expect(mapped.size).to.equal(4)
    expect(mapped.get('one')!.name).to.equal('One')
  })
  it('should work with deep properties', () => {
    const mapped = mapkeyby(records, 'deep.id')
    expect(mapped.size).to.equal(3)
    expect(mapped.get(1)!.name).to.equal('One')
  })
  it('should work with an extractor function', () => {
    const mapped = mapkeyby(records, record => record?.deep?.id)
    expect(mapped.size).to.equal(3)
    expect(mapped.get(1)!.name).to.equal('One')
  })
  it('should be null safe', () => {
    const mapped = mapkeyby(undefined, 'id')
    expect(mapped).to.be.a('Map')
    expect(mapped.size).to.equal(0)
  })
  it('should map to booleans when given an array of numbers or strings', () => {
    const mapped = mapkeyby([1, 3, 5, 7])
    expect(mapped.get(3)!).to.equal(true)
    expect(mapped.get(4)!).to.equal(undefined)
  })
})

describe('unique', () => {
  function getarray () {
    return [
      { netid: 'ab01', deep: { netid: 'ab01' }, firstname: 'Nick', lastname: 'Wing' },
      { netid: 'ab02', deep: { netid: 'ab02' }, firstname: 'Nick', lastname: 'Wing' },
      { netid: 'ab03', deep: { netid: 'ab03' }, firstname: 'Nick', lastname: 'Wing' },
      { netid: 'ab02', deep: { netid: 'ab02' }, lastname: 'Wing', firstname: 'Nick' }
    ]
  }
  it('should remove duplicates based on a property name', () => {
    const arr = unique(getarray(), 'netid')
    expect(arr).to.have.lengthOf(3)
  })
  it('should remove duplicates based on a function', () => {
    const arr = unique(getarray(), u => u.netid)
    expect(arr).to.have.lengthOf(3)
  })
  it('should remove duplicates based on the stable stringification of an object returned by the function', () => {
    const arr = unique(getarray(), u => u.deep)
    expect(arr).to.have.lengthOf(3)
  })
  it('should remove duplicates based on a dot-separated path', () => {
    const arr = unique(getarray(), 'deep.netid')
    expect(arr).to.have.lengthOf(3)
  })
  it('should remove duplicates based on stable json stringification', () => {
    const arr = unique(getarray())
    expect(arr).to.have.lengthOf(3)
  })
})
describe('shuffle', () => {
  function getarray () {
    return Array.from(Array(20).keys())
  }
  it('should shuffle an array without mutating it', () => {
    const unshuffled = getarray()
    const shuffled = shuffle(unshuffled)
    const check = getarray()
    expect(unshuffled).to.deep.equal(check)
    expect(shuffled).to.not.deep.equal(check)
    expect(shuffled).to.have.lengthOf(check.length)
    for (const n of check) expect(shuffled).to.contain(n)
  })
  it('should shuffle an array in place', () => {
    const toShuffle = getarray()
    shuffleInPlace(toShuffle)
    expect(toShuffle).to.not.deep.equal(getarray())
  })
})
describe('toArray', () => {
  it('should convert undefined to empty array', () => {
    expect(toArray(undefined)).to.deep.equal([])
  })
  it('should convert null to empty array', () => {
    expect(toArray(null)).to.deep.equal([])
  })
  it('should convert an object to an array with the object', () => {
    expect(toArray({ hello: 'world' })).to.deep.equal([{ hello: 'world' }])
  })
  it('should convert 0 to [0]', () => {
    expect(toArray(0)).to.deep.equal([0])
  })
  it('should convert "" to [""]', () => {
    expect(toArray('')).to.deep.equal([''])
  })
  it('should leave an array alone', () => {
    expect(toArray([1, 2, 3])).to.deep.equal([1, 2, 3])
  })
  it('should leave an empty array alone', () => {
    expect(toArray([])).to.deep.equal([])
  })
})
describe('groupby', () => {
  const rows = [
    { id: 1, fruit: 'apple', vegetable: 'cucumber', deep: { fruit: 'apple' } },
    { id: 2, fruit: 'orange', vegetable: 'green bean', deep: { fruit: 'orange' } },
    { id: 3, fruit: 'apple', vegetable: 'lima bean', deep: { fruit: 'apple' } },
    { id: 4, fruit: 'apple', vegetable: 'artichoke', deep: { fruit: 'apple' } },
    { id: 5, fruit: 'banana', vegetable: 'artichoke', deep: { fruit: 'banana' } },
    { id: 6, fruit: 'banana', vegetable: 'lettuce', deep: { fruit: 'banana' } }
  ]
  it('should group rows with matching keys into the same array', () => {
    const grouped = groupby(rows, 'fruit')
    expect(Object.keys(grouped)).to.have.lengthOf(3)
    expect(grouped.apple).to.have.lengthOf(3)
    expect(grouped.banana).to.have.lengthOf(2)
    expect(grouped.orange).to.have.lengthOf(1)
  })
  it('should group rows with matching keys into the same array, function extractor', () => {
    const grouped = groupby(rows, r => r.fruit)
    expect(Object.keys(grouped)).to.have.lengthOf(3)
    expect(grouped.apple).to.have.lengthOf(3)
    expect(grouped.banana).to.have.lengthOf(2)
    expect(grouped.orange).to.have.lengthOf(1)
  })
  it('should group rows with matching keys into the same array, dotprop extractor', () => {
    const grouped = groupby(rows, 'deep.fruit')
    expect(Object.keys(grouped)).to.have.lengthOf(3)
    expect(grouped.apple).to.have.lengthOf(3)
    expect(grouped.banana).to.have.lengthOf(2)
    expect(grouped.orange).to.have.lengthOf(1)
  })
})
describe('mapgroupby', () => {
  const rows = [
    { id: 1, fruit: 'apple', vegetable: 'cucumber', deep: { fruit: 'apple' } },
    { id: 2, fruit: 'orange', vegetable: 'green bean', deep: { fruit: 'orange' } },
    { id: 3, fruit: 'apple', vegetable: 'lima bean', deep: { fruit: 'apple' } },
    { id: 4, fruit: 'apple', vegetable: 'artichoke', deep: { fruit: 'apple' } },
    { id: 5, fruit: 'banana', vegetable: 'artichoke', deep: { fruit: 'banana' } },
    { id: 6, fruit: 'banana', vegetable: 'lettuce', deep: { fruit: 'banana' } }
  ]
  it('should group rows with matching keys into the same array', () => {
    const grouped = mapgroupby(rows, 'fruit')
    expect(grouped.size).to.equal(3)
    expect(grouped.get('apple')).to.have.lengthOf(3)
    expect(grouped.get('banana')).to.have.lengthOf(2)
    expect(grouped.get('orange')).to.have.lengthOf(1)
  })
  it('should group rows with matching keys into the same array, function extractor', () => {
    const grouped = mapgroupby(rows, r => r.fruit)
    expect(grouped.size).to.equal(3)
    expect(grouped.get('apple')).to.have.lengthOf(3)
    expect(grouped.get('banana')).to.have.lengthOf(2)
    expect(grouped.get('orange')).to.have.lengthOf(1)
  })
  it('should group rows with matching keys into the same array, dotprop extractor', () => {
    const grouped = mapgroupby(rows, 'deep.fruit')
    expect(grouped.size).to.equal(3)
    expect(grouped.get('apple')).to.have.lengthOf(3)
    expect(grouped.get('banana')).to.have.lengthOf(2)
    expect(grouped.get('orange')).to.have.lengthOf(1)
  })
})

describe('findIndex', () => {
  const arr = [1, 2, 3, 4]
  it('should return an index when callback returns true', () => {
    expect(findIndex(arr, n => n === 2)).to.equal(1)
  })
  it('should return the proper index when callback returns true and default was specified', () => {
    expect(findIndex(arr, n => n === 3, -3)).to.equal(2)
  })
  it('should return undefined when callback never returns true', () => {
    expect(findIndex(arr, n => n === 6)).to.be.undefined
  })
  it('should return a default when not found and default was specified', () => {
    expect(findIndex(arr, n => n === 7, -3)).to.equal(-3)
  })
})

describe('splice', () => {
  it('should not mutate the original array', () => {
    const arr = [1, 2, 3, 4]
    const spliced = splice(arr, 1, 1)
    expect(spliced).to.deep.equal([1, 3, 4])
    expect(arr).to.deep.equal([1, 2, 3, 4])
  })
  it('should work the same as splice with only a start parameter', () => {
    const arr = [1, 2, 3, 4]
    const spliced = splice(arr, 1)
    arr.splice(1)
    expect(spliced).to.deep.equal(arr)
  })
  it('should work the same as splice when inserting and not deleting', () => {
    const arr = [1, 2, 3, 4]
    const spliced = splice(arr, 1, 0, 5)
    arr.splice(1, 0, 5)
    expect(spliced).to.deep.equal(arr)
  })
})

describe('batch', () => {
  it('should batch an array into singles', () => {
    expect(batch([1, 2, 3, 4], 1)).to.deep.equal([[1], [2], [3], [4]])
    expect(batch([1], 1)).to.deep.equal([[1]])
  })
  it('should batch an array into pairs', () => {
    expect(batch([1, 2, 3, 4, 5], 2)).to.deep.equal([[1, 2], [3, 4], [5]])
    expect(batch([1, 2, 3, 4], 2)).to.deep.equal([[1, 2], [3, 4]])
    expect(batch([1, 2, 3], 2)).to.deep.equal([[1, 2], [3]])
    expect(batch([1, 2], 2)).to.deep.equal([[1, 2]])
    expect(batch([1], 2)).to.deep.equal([[1]])
  })
  it('should batch an array into triplets', () => {
    expect(batch([1, 2, 3, 4, 5], 3)).to.deep.equal([[1, 2, 3], [4, 5]])
    expect(batch([1, 2, 3, 4], 3)).to.deep.equal([[1, 2, 3], [4]])
    expect(batch([1, 2, 3], 3)).to.deep.equal([[1, 2, 3]])
    expect(batch([1, 2], 3)).to.deep.equal([[1, 2]])
    expect(batch([1], 3)).to.deep.equal([[1]])
  })
  it('should return a double array for an empty array', () => {
    expect(batch([])).to.deep.equal([[]])
  })
})
