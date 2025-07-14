/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import { decompose, toQuery, get, omit, pick, recompose, fromQuery, set, deleteEmpty } from '../lib'

describe('object', () => {
  const complexobject = {
    shallow: 'hello',
    array: [1, 2],
    deep: {
      shallow: 'hello',
      array: [1, 2, 3],
      deeper: {
        shallow: 'hello',
        arrayWithObjectInside: [1, 2, 3, 4, {
          shallow: 'hello',
          array: [1, 2, 3, 4, 5]
        }]
      }
    }
  }
  describe('get', () => {
    it('should get shallow properties, dot-separated style', () => {
      expect(get(complexobject, 'shallow')).to.equal('hello')
    })
    it('should get shallow properties, path array style', () => {
      expect(get(complexobject, ['shallow'])).to.equal('hello')
    })
    it('should get deep properties, dot-separated style', () => {
      expect(get(complexobject, 'deep.shallow')).to.equal('hello')
    })
    it('should get deep properties, path array style', () => {
      expect(get(complexobject, ['deep', 'shallow'])).to.equal('hello')
    })
    it('should get deep properties, bracket style', () => {
      expect(get(complexobject, 'deep["shallow"]')).to.equal('hello')
      expect(get(complexobject, '["deep"]["shallow"]')).to.equal('hello')
    })
    it('should get deeper properties, dot-separated style', () => {
      expect(get(complexobject, 'deep.deeper.shallow')).to.equal('hello')
    })
    it('should get deeper properties, path array style', () => {
      expect(get(complexobject, ['deep', 'deeper', 'shallow'])).to.equal('hello')
    })
    it('should get deeper properties, bracket style', () => {
      expect(get(complexobject, 'deep["deeper"]["shallow"]')).to.equal('hello')
      expect(get(complexobject, "['deep']['deeper']['shallow']")).to.equal('hello')
    })
    it('should return arrays', () => {
      expect(get(complexobject, 'array')).to.deep.equal([1, 2])
    })
    it('should return array elements, dot-separated style', () => {
      expect(get(complexobject, 'array.1')).to.equal(2)
    })
    it('should return array elements, path array style', () => {
      expect(get(complexobject, ['array', 1])).to.equal(2)
    })
    it('should return array elements, bracket style', () => {
      expect(get(complexobject, 'array[1]')).to.equal(2)
      expect(get(complexobject, '["array"][1]')).to.equal(2)
    })
    it('should be able to mix dot-separated and bracket styles', () => {
      expect(get(complexobject, 'deep.array[2]')).to.equal(3)
      expect(get(complexobject, '["deep"].deeper.arrayWithObjectInside[4].shallow')).to.equal('hello')
    })
    it('should traverse through arrays containing objects, dot-separated style', () => {
      expect(get(complexobject, 'deep.deeper.arrayWithObjectInside.4.shallow')).to.equal('hello')
      expect(get(complexobject, 'deep.deeper.arrayWithObjectInside[4].array[3]')).to.equal(4)
    })
    it('should traverse through arrays containing objects, path array style', () => {
      expect(get(complexobject, ['deep', 'deeper', 'arrayWithObjectInside', 4, 'shallow'])).to.equal('hello')
      expect(get(complexobject, ['deep', 'deeper', 'arrayWithObjectInside', 4, 'array', 3])).to.equal(4)
    })
    it('should traverse through arrays containing objects, bracket style', () => {
      expect(get(complexobject, '["deep"]["deeper"]["arrayWithObjectInside"][4]["shallow"]')).to.equal('hello')
      expect(get(complexobject, '["deep"]["deeper"]["arrayWithObjectInside"][4]["array"][3]')).to.equal(4)
    })
    it('should return undefined for properties that do not exist', () => {
      expect(get(complexobject, 'test')).to.be.undefined
      expect(get(complexobject, 'test.more')).to.be.undefined
      expect(get(complexobject, 'deep.test')).to.be.undefined
      expect(get(complexobject, 'deep.test.more')).to.be.undefined
    })
    it('should return undefined when given an undefined object', () => {
      expect(get(undefined, 'shallow')).to.be.undefined
    })
    it('should return defaultValue for properties that do not exist', () => {
      expect(get(complexobject, 'test', 'default')).to.equal('default')
      expect(get(complexobject, 'test.more', 'default')).to.equal('default')
      expect(get(complexobject, 'deep.test', 'default')).to.equal('default')
      expect(get(complexobject, 'deep.test.more', 'default')).to.equal('default')
    })
    it('should return defaultValue when given an undefined object', () => {
      expect(get(undefined, 'shallow', 'default')).to.equal('default')
    })
  })

  describe('set', () => {
    it('should set a property without mutating', () => {
      const newobject = set(complexobject, 'shallow', 'there')
      expect(complexobject.shallow).to.equal('hello')
      expect(newobject.shallow).to.equal('there')
    })
    it('should set a deep property without mutating, dot-separated style', () => {
      const newobject = set(complexobject, 'deep.shallow', 'there')
      expect(complexobject.deep.shallow).to.equal('hello')
      expect(newobject.deep.shallow).to.equal('there')
    })
    it('should work when the root object is an array', () => {
      const object = [{ match: { active: true } }]
      const newobject = set(object, '0.match.classification', 'academic')
      expect(newobject).to.deep.equal([{ ...object[0], match: { ...object[0].match, classification: 'academic' } }])
    })
    it('should work when a property has a $ in it', () => {
      const object = { $match: { active: true } }
      const newobject = set(object, '$match.classification', 'academic')
      expect(newobject).to.deep.equal({ ...object, $match: { ...object.$match, classification: 'academic' } })
    })
    it('should work when a property has a - in it', () => {
      const object = { 'my-match': { active: true } }
      const newobject = set(object, 'my-match.classification', 'academic')
      expect(newobject).to.deep.equal({ ...object, 'my-match': { ...object['my-match'], classification: 'academic' } })
    })
    it('should set a new array element without mutating, dot-separated style', () => {
      const newobject = set(complexobject, 'array.2', 3)
      expect(complexobject.array.length).to.equal(2)
      expect(newobject.array.length).to.equal(3)
    })
    it('should set a new array element without mutating, bracket style', () => {
      const newobject = set(complexobject, 'array[2]', 3)
      expect(complexobject.array.length).to.equal(2)
      expect(newobject.array.length).to.equal(3)
    })
    it('should alter an array element without mutating, bracket style', () => {
      const newobject = set(complexobject, 'array[1]', 5)
      expect(complexobject.array[1]).to.equal(2)
      expect(newobject.array[1]).to.equal(5)
    })
    it('should return an object if given an undefined', () => {
      const newobject = set<{ deep: any }>(undefined, 'deep.shallow', 'there')
      expect(newobject).to.deep.equal({ deep: { shallow: 'there' } })
    })
    it('should create an array when path does not exist already and not using bracket syntax', () => {
      const newobject = set<typeof complexobject & { anotherobject: { 1: string } }>(complexobject, 'anotherobject.1', 'hello')
      expect(newobject.anotherobject).to.be.an('array')
      expect(newobject).to.haveOwnProperty('anotherobject')
      expect(complexobject).to.not.haveOwnProperty('anotherobject')
    })
    it('should create an object when path does not exist already and using bracket syntax with quoted string', () => {
      const newobject = set<typeof complexobject & { anotherobject: { 1: string } }>(complexobject, 'anotherobject["1"]', 'hello')
      expect(newobject.anotherobject).to.not.be.an('array')
      expect(newobject).to.haveOwnProperty('anotherobject')
      expect(complexobject).to.not.haveOwnProperty('anotherobject')
    })
    it('should create an array when path does not exist already and using bracket syntax with unquoted number', () => {
      const newobject = set<typeof complexobject & { anotherobject: string[] }>(complexobject, 'anotherobject[1]', 'hello')
      expect(newobject.anotherobject).to.be.an('array')
      expect(newobject).to.haveOwnProperty('anotherobject')
      expect(complexobject).to.not.haveOwnProperty('anotherobject')
    })
    it('should create an array with object inside when path does not exist already and using bracket syntax with unquoted number', () => {
      const newobject = set<typeof complexobject & { anotherobject: { hello: string }[] }>(complexobject, 'anotherobject[1].hello', 'there')
      expect(newobject.anotherobject).to.be.an('array')
      expect(newobject).to.haveOwnProperty('anotherobject')
      expect(complexobject).to.not.haveOwnProperty('anotherobject')
      expect(newobject.anotherobject[1].hello).to.equal('there')
    })
    it('should create an array at the base using bracket syntax with unquoted number', () => {
      const newobject = set<{ hello: string }[]>(undefined, '[1].hello', 'there')
      expect(newobject).to.be.an('array')
      expect(newobject[1].hello).to.equal('there')
    })
    it('should create an array and keep moving', () => {
      const newobject = set<typeof complexobject & { anotherobject: { hello: string }[] }>(complexobject, 'anotherobject[1].hello', 'world')
      expect(newobject.anotherobject).to.be.an('array')
      expect(newobject.anotherobject).to.deep.equal([undefined, { hello: 'world' }])
      expect(newobject).to.haveOwnProperty('anotherobject')
      expect(complexobject).to.not.haveOwnProperty('anotherobject')
    })
    it('should work when given a path with slashes in it, but the slashes do NOT operate as separators', () => {
      const newobject = set(complexobject, '//main', 'world')
      expect(newobject).to.deep.equal({ ...complexobject, '//main': 'world' })
    })
  })
  describe('deleteEmpty', () => {
    it('should delete empty properties from an object', () => {
      const obj = { a: 1, b: '', c: null, d: undefined, e: [], f: {}, g: { h: 2, i: '' }, j: { k: 3, l: null }, m: [1, 2, '', null, undefined, {}, []] }
      const result = deleteEmpty(obj)
      expect(result).to.deep.equal({ a: 1, g: { h: 2 }, j: { k: 3 }, m: [1, 2] })
    })
    it('should delete empty properties from an array', () => {
      const arr = [1, '', null, undefined, {}, [], { a: 2, b: '' }, { c: 3, d: null }]
      const result = deleteEmpty(arr)
      expect(result).to.deep.equal([1, { a: 2 }, { c: 3 }])
    })
    it('should handle nested objects and arrays', () => {
      const nested = { a: { b: '', c: { d: null, e: 4 } }, f: [1, '', { g: null, h: 2 }] }
      const result = deleteEmpty(nested)
      expect(result).to.deep.equal({ a: { c: { e: 4 } }, f: [1, { h: 2 }] })
    })
    it('should return a clone of the original object if no empty properties are found', () => {
      const obj = { a: 1, b: 'text', c: true, d: new Date() }
      const result = deleteEmpty(obj)
      expect(result).to.not.equal(obj)
      expect(result).to.deep.equal(obj)
    })
    it('should return a clone of the original array if no empty elements are found', () => {
      const arr = [1, 'text', true, new Date()]
      const result = deleteEmpty(arr)
      expect(result).to.not.equal(arr)
      expect(result).to.deep.equal(arr)
    })
    it('should handle objects with only empty properties', () => {
      const emptyObj = { a: '', b: null, c: undefined }
      const result = deleteEmpty(emptyObj)
      expect(result).to.deep.equal({})
    })
    it('should handle arrays with only empty elements', () => {
      const emptyArr = ['', null, undefined, {}]
      const result = deleteEmpty(emptyArr)
      expect(result).to.deep.equal([])
    })
    it('should not modify the original object or array', () => {
      const obj = { a: 1, b: '', c: null }
      const originalObj = structuredClone(obj)
      deleteEmpty(obj)
      expect(obj).to.deep.equal(originalObj)
      const arr = [1, '', null]
      const originalArr = [...arr]
      deleteEmpty(arr)
      expect(arr).to.deep.equal(originalArr)
    })
    it('should handle objects with properties that are objects with toJSON methods', () => {
      const obj = {
        a: 1,
        b: {
          toJSON: () => 'not empty'
        },
        c: {
          toJSON: () => ''
        },
        d: null,
        e: {
          toJSON: () => ({ obj: 'not empty' })
        },
        f: {
          toJSON: () => ({ obj: '' })
        }
      }
      const result = deleteEmpty(obj)
      expect(result).to.deep.equal({ a: 1, b: 'not empty', e: { obj: 'not empty' } })
    })
  })
  describe('decompose / recompose', () => {
    it('should decompose objects into an array of paths and scalars and recompose to the original', () => {
      expect(complexobject).to.deep.equal(recompose(decompose(complexobject)))
      const simplearray = [1, 2, 3]
      expect(decompose(simplearray)).to.deep.equal([['0', 1], ['1', 2], ['2', 3]])
      expect(simplearray).to.deep.equal(recompose(decompose(simplearray)))
    })
    it('should decompose properties containing dots by quoting them', () => {
      const obj = { 'has.dot': 4 }
      const decomposed = decompose(obj)
      expect(decomposed).to.deep.equal([['["has.dot"]', 4]])
      expect(recompose(decomposed)).to.deep.equal(obj)
    })
    it('should decompose and recompose an object with undefined properties', () => {
      expect(recompose(decompose({ hi: undefined }))).to.deep.equal({})
    })
    it('should decompose and recompose an array with undefined elements', () => {
      expect(recompose(decompose([1, 2, undefined, 4]))).to.deep.equal([1, 2, undefined, 4])
    })
    it('should decompose null, undefined, empty string, empty object, empty array into an empty array and recompose to an empty object', () => {
      expect(decompose(null)).to.deep.equal([])
      expect(decompose(undefined)).to.deep.equal([])
      expect(decompose([])).to.deep.equal([])
      expect(decompose({})).to.deep.equal([])
      expect(decompose('')).to.deep.equal([])
      expect(recompose([])).to.deep.equal({})
    })
    it('should decompose a date properly even if it has some own properties', () => {
      const date = new Date('2024-06-24T12:00:00-0500')
      date.toJSON = function () {
        return `${this.getFullYear()}-${(this.getMonth() + 1).toString().padStart(2, '0')}-${this.getDate().toString().padStart(2, '0')}T${(this.getHours() - 5).toString().padStart(2, '0')}:${this.getMinutes().toString().padStart(2, '0')}:${this.getSeconds().toString().padStart(2, '0')}-0500`
      }
      const decomposed = decompose({ date })
      expect(decomposed).to.deep.equal([['date', date]])
      expect(recompose(decomposed)).to.deep.equal({ date })
    })
  })
  describe('toQuery / fromQuery', () => {
    it('should decompose objects into a string representation recompose to the original', () => {
      const obj = { colors: ['Blue', '2', true, new Date('2024-06-24T12:00:00-0500'), 'false', '"hi"', '"2"'] }
      expect(toQuery(obj)).to.equal('colors.0=Blue&colors.1=%222%22&colors.2=true&colors.3=2024-06-24T17%3A00%3A00.000Z&colors.4=%22false%22&colors.5=%22%2522hi%2522%22&colors.6=%22%25222%2522%22')
      expect(fromQuery(toQuery(obj))).to.deep.equal(obj)
    })
    it('should stringify and parse an object with properties that look like numbers or booleans', () => {
      const obj = { 2: '3', 5: 4, true: 5, 7: false, 9: 0 }
      expect(fromQuery(toQuery(obj))).to.deep.equal(obj)
    })
    it('should stringify and parse an object with undefined or null properties by dropping those properties', () => {
      expect(fromQuery(toQuery({ hi: undefined, there: null }))).to.deep.equal({})
    })
    it('should treat empty values as if the pair did not exist at all', () => {
      expect(fromQuery('color=')).to.deep.equal({})
      expect(fromQuery('colors.2=')).to.deep.equal({})
    })
    it('should stringify and parse an array with undefined elements', () => {
      expect(fromQuery(toQuery([1, 2, undefined, 4]))).to.deep.equal([1, 2, undefined, 4])
    })
    it('should not recognize a number as a date', () => {
      expect(fromQuery(toQuery({ search: 'abc 123' }))).to.deep.equal({ search: 'abc 123' })
    })
    it('should encode and decode a date using a custom toJSON', () => {
      const date = new Date('2024-06-24T12:00:00-0500')
      date.toJSON = function () {
        return `${this.getFullYear()}-${(this.getMonth() + 1).toString().padStart(2, '0')}-${this.getDate().toString().padStart(2, '0')}T${this.getHours().toString().padStart(2, '0')}:${this.getMinutes().toString().padStart(2, '0')}:${this.getSeconds().toString().padStart(2, '0')}${this.getTimezoneOffset() < 0 ? '+' : '-'}${Math.abs(this.getTimezoneOffset() * 5 / 3).toString().padStart(4, '0')}`
      }
      const obj = { f: { date } }
      // can't match full string because `npm t` may be executed in any timezone
      // but it should certainly end with a timezone offset and parse back to the same epoch
      expect(toQuery(obj)).to.match(/(-|\+)\d{4}$/)
      expect(fromQuery(toQuery(obj))).to.deep.equal(obj)
    })
    it('should encode and decode a date using a custom toJSON after using deleteEmpty', () => {
      const date = new Date('2024-06-24T12:00:00-0500')
      date.toJSON = function () {
        return `${this.getFullYear()}-${(this.getMonth() + 1).toString().padStart(2, '0')}-${this.getDate().toString().padStart(2, '0')}T${this.getHours().toString().padStart(2, '0')}:${this.getMinutes().toString().padStart(2, '0')}:${this.getSeconds().toString().padStart(2, '0')}${this.getTimezoneOffset() < 0 ? '+' : '-'}${Math.abs(this.getTimezoneOffset() * 5 / 3).toString().padStart(4, '0')}`
      }
      const obj = deleteEmpty({ f: { date }, t: '' }) as { f: { date: Date } }
      // can't match full string because `npm t` may be executed in any timezone
      // but it should certainly end with a timezone offset and parse back to the same epoch
      expect(toQuery(obj)).to.match(/(-|\+)\d{4}$/)
      expect(fromQuery(toQuery(obj))).to.deep.equal(obj)
    })
  })
  describe('pick', () => {
    it('should pick properties without mutating', () => {
      const obj = { one: 1, two: 2, three: 3 }
      expect(pick(obj, 'one')).to.deep.equal({ one: 1 })
      expect(pick(obj, 'one', 'three')).to.deep.equal({ one: 1, three: 3 })
      expect(obj).to.deep.equal({ one: 1, two: 2, three: 3 })
    })
    it('should pick symbol properties', () => {
      const sym = Symbol('test symbol')
      const obj = { one: 1, two: 2, three: 3, [sym]: 4 }
      expect(pick(obj, sym)).to.deep.equal({ [sym]: 4 })
      // typescript Pick doesn't seem to support mixed string and symbol for now
      // expect(pick(obj, 'one', sym)).to.deep.equal({ one: 1, [sym]: 4 })
      expect(obj).to.deep.equal({ one: 1, two: 2, three: 3, [sym]: 4 })
    })
    it('should return empty object when no props given', () => {
      expect(pick({ one: 1 })).to.deep.equal({})
    })
    it('should pick multiple properties', () => {
      const obj = { one: 1, two: 2, three: 3 }
      const newobj = pick(obj, 'two', 'three')
      expect(newobj).to.deep.equal({ two: 2, three: 3 })
    })
    it('should not add properties for picks that are undefined', () => {
      const obj = { one: 1, two: 2, three: 3, four: undefined }
      const newobj = pick(obj, 'two', 'four')
      expect(Object.keys(newobj)).to.deep.equal(['two'])
    })
    it('should not add properties for picks that are null', () => {
      const obj = { one: 1, two: 2, three: 3, four: null }
      const newobj = pick(obj, 'two', 'four')
      expect(Object.keys(newobj)).to.deep.equal(['two'])
    })
  })
  describe('omit', () => {
    it('should omit properties without mutating', () => {
      const obj = { one: 1, two: 2, three: 3 }
      expect(omit(obj, 'one')).to.deep.equal({ two: 2, three: 3 })
      expect(omit(obj, 'one', 'three')).to.deep.equal({ two: 2 })
      expect(obj).to.deep.equal({ one: 1, two: 2, three: 3 })
    })
    it('should omit symbol properties', () => {
      const sym = Symbol('test symbol')
      const obj = { one: 1, two: 2, three: 3, [sym]: 4 }
      expect(omit(obj, sym)).to.deep.equal({ one: 1, two: 2, three: 3 })
      // typescript Omit doesn't seem to support mixed string and symbol for now
      // expect(pick(obj, 'one', sym)).to.deep.equal({ two: 2, three: 3 })
      expect(obj).to.deep.equal({ one: 1, two: 2, three: 3, [sym]: 4 })
    })
    it('should return a clone when no props given', () => {
      const obj = { one: 1 }
      expect(omit(obj)).to.deep.equal(obj)
      expect(omit(obj)).not.to.equal(obj)
    })
    it('should omit multiple properties', () => {
      const obj = { one: 1, two: 2, three: 3 }
      const newobj = omit(obj, 'two', 'three')
      expect(newobj).to.deep.equal({ one: 1 })
    })
  })
})
