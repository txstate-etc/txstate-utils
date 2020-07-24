/* eslint-disable @typescript-eslint/no-unused-expressions */
import { sleep, randomid, hashify, isEmpty, isBlank } from '../src'
import { expect } from 'chai'

describe('sleep', () => {
  it('should sleep for the correct amount of time', async () => {
    const startTime = new Date()
    await sleep(30)
    const endTime = new Date()
    const elapsed = endTime.getTime() - startTime.getTime()
    expect(elapsed).to.be.lessThan(45)
    expect(elapsed).to.be.greaterThan(15)
  })
})

describe('randomid', () => {
  it('should always begin with a lowercase letter and be greater than 4 characters', () => {
    const id = randomid()
    expect(id).to.match(/^[a-z]/)
    expect(id.length).to.be.gte(4)
  })
})

describe('isBlank', () => {
  it('should return true for null or undefined', () => {
    expect(isBlank(null)).to.be.true
    expect(isBlank(undefined)).to.be.true
  })
  it('should return true when only whitespace', () => {
    expect(isBlank(' ')).to.be.true
    expect(isBlank(' \t')).to.be.true
  })
  it('should return false when any non-whitespace characters are present in the string', () => {
    expect(isBlank(' a')).to.be.false
    expect(isBlank(' b\t')).to.be.false
    expect(isBlank(' \tc')).to.be.false
  })
})

describe('isEmpty', () => {
  class ComplexObj {
    protected list: any[]
    constructor (list: any[]) {
      this.list = list
    }

    public isEmpty () {
      return !this.list.length
    }
  }
  const emptyObj = new ComplexObj([])
  const notEmptyObj = new ComplexObj([1, 2])
  it('should work for plain objects', () => {
    expect(isEmpty({})).to.be.true
    expect(isEmpty({ hi: 'there' })).to.be.false
  })
  it('should work for arrays', () => {
    expect(isEmpty([])).to.be.true
    expect(isEmpty([1, 2])).to.be.false
  })
  it('should work for complex objects with an isEmpty method', () => {
    expect(isEmpty(emptyObj)).to.be.true
    expect(isEmpty(notEmptyObj)).to.be.false
  })
  it('should return false for the number 0', () => {
    expect(isEmpty(0)).to.be.false
  })
})

describe('hashify', () => {
  const sym = Symbol('id')
  const records = [
    { [sym]: 1, idnum: 1, idstr: 'one', name: 'One', deep: { id: 1 } },
    { [sym]: 2, idnum: 2, idstr: 'two', name: 'Two', deep: { id: 2 } },
    { [sym]: 3, idnum: 3, idstr: 'three', name: 'Three', deep: { id: 3 } },
    { [sym]: 4, idnum: 4, idstr: 'four', name: 'Four', deep: { id: 4 } }
  ]
  it('should work with a shallow string property that returns numbers', () => {
    const hashed = hashify(records, sym)
    expect(Object.keys(hashed)).to.have.lengthOf(4)
    expect(hashed[1].name).to.equal('One')
  })
  it('should work with a shallow symbol property that returns numbers', () => {
    const hashed = hashify(records, 'idnum')
    expect(Object.keys(hashed)).to.have.lengthOf(4)
    expect(hashed[1].name).to.equal('One')
  })
  it('should work with a shallow string properties that returns strings', () => {
    const hashed = hashify(records, 'idstr')
    expect(Object.keys(hashed)).to.have.lengthOf(4)
    expect(hashed.one.name).to.equal('One')
  })
  it('should work with deep properties', () => {
    const hashed = hashify(records, 'deep.id')
    expect(Object.keys(hashed)).to.have.lengthOf(4)
    expect(hashed[1].name).to.equal('One')
  })
  it('should work with an extractor function', () => {
    const hashed = hashify(records, record => record.deep.id)
    expect(Object.keys(hashed)).to.have.lengthOf(4)
    expect(hashed[1].name).to.equal('One')
  })
})
