/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import { get, omit, pick, set } from '../lib'

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
    it('should create an object when path does not exist already and not using bracket syntax', () => {
      const newobject = set<typeof complexobject & { anotherobject: { 1: string } }>(complexobject, 'anotherobject.1', 'hello')
      expect(newobject.anotherobject).to.not.be.an('array')
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
    it('should create an array and keep moving', () => {
      const newobject = set<typeof complexobject & { anotherobject: { hello: string }[] }>(complexobject, 'anotherobject[1].hello', 'world')
      expect(newobject.anotherobject).to.be.an('array')
      expect(newobject.anotherobject).to.deep.equal([undefined, { hello: 'world' }])
      expect(newobject).to.haveOwnProperty('anotherobject')
      expect(complexobject).to.not.haveOwnProperty('anotherobject')
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
  })
})
