/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import { isEmpty, isNotEmpty, isPracticallyEmpty } from '../lib'

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
  it('should return true when an object has only undefined properties', () => {
    expect(isEmpty({ hello: undefined })).to.be.true
    expect(isEmpty({ hello: undefined, foo: 'bar' })).to.be.false
  })
  it('should return false when an object has only blank properties', () => {
    expect(isEmpty({ hello: '' })).to.be.false
    expect(isEmpty({ hello: ' ' })).to.be.false
  })
})

describe('isPracticallyEmpty', () => {
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
    expect(isPracticallyEmpty({})).to.be.true
    expect(isPracticallyEmpty({ hi: 'there' })).to.be.false
  })
  it('should work for arrays', () => {
    expect(isPracticallyEmpty([])).to.be.true
    expect(isPracticallyEmpty([1, 2])).to.be.false
  })
  it('should work for complex objects with an isEmpty method', () => {
    expect(isPracticallyEmpty(emptyObj)).to.be.true
    expect(isPracticallyEmpty(notEmptyObj)).to.be.false
  })
  it('should return false for the number 0', () => {
    expect(isPracticallyEmpty(0)).to.be.false
  })
  it('should return true when an object has only undefined properties', () => {
    expect(isPracticallyEmpty({ hello: undefined })).to.be.true
    expect(isPracticallyEmpty({ hello: undefined, foo: 'bar' })).to.be.false
  })
  it('should return true when an object has only blank properties', () => {
    expect(isPracticallyEmpty({ hello: '' })).to.be.true
    expect(isPracticallyEmpty({ hello: ' ' })).to.be.true
    expect(isPracticallyEmpty({ hello: '', foo: 'bar' })).to.be.false
    expect(isPracticallyEmpty({ hello: ' ', foo: 'bar' })).to.be.false
  })
})

describe('typeguards', () => {
  it('should properly typeguard when using isNotEmpty', () => {
    // eslint-disable-next-line prefer-const
    let obj: { hello: string } | undefined
    if (isEmpty(obj)) expect(obj).to.be.undefined
    obj = { hello: 'world' }
    if (isNotEmpty(obj)) expect(obj.hello).to.equal('world')
  })
})
