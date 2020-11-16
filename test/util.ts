/* eslint-disable @typescript-eslint/no-unused-expressions */
import { sleep, randomid, isEmpty, isBlank, isNotBlank, csvEscape, csvLine, isEmail } from '../src'
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
  it('should just sleep for a tick if called without parameter', async () => {
    const startTime = new Date()
    await sleep()
    const endTime = new Date()
    const elapsed = endTime.getTime() - startTime.getTime()
    expect(elapsed).to.be.lessThan(10)
    expect(elapsed).to.be.greaterThan(0)
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
  it('should provide a typeguard on the notted version', () => {
    let val: string|undefined = ''
    val = 'notblank'
    if (isNotBlank(val)) {
      expect(val).to.equal('notblank')
    } else {
      expect(false)
    }
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

describe('isEmail', () => {
  it('should be able to detect email', () => {
    expect(isEmail('abc123@txstate.edu')).to.be.true
    expect(isEmail('abc123@qual.txstate.edu')).to.be.true
    expect(isEmail('123@gmail.com')).to.be.true
    expect(isEmail('abc@education.tx.us')).to.be.true
  })
  it('should reject things that are not email', () => {
    expect(isEmail('@')).to.be.false
    expect(isEmail('abc123@')).to.be.false
    expect(isEmail('abc123@com')).to.be.false
    expect(isEmail('abc123')).to.be.false
  })
  it('should be null safe', () => {
    expect(isEmail(undefined)).to.be.false
    expect(isEmail(null)).to.be.false
    expect(isEmail('')).to.be.false
  })
  it('should typeguard', () => {
    const email: string|undefined = 'test@txstate.edu'
    if (isEmail(email)) {
      expect(email.toLocaleLowerCase()).to.equal(email)
    }
  })
})

describe('CSV functions', () => {
  it('should be able to escape values for CSV', () => {
    expect(csvEscape('hello')).to.equal('hello')
    expect(csvEscape('"hello"')).to.equal('"""hello"""')
    expect(csvEscape('hello\nfriend')).to.equal('"hello\nfriend"')
    expect(csvEscape('hello, friend')).to.equal('"hello, friend"')
    expect(csvEscape('hello, "friend"')).to.equal('"hello, ""friend"""')
  })
  it('should be able to construct a full CSV line', () => {
    expect(csvLine(['apple', 'banana', 'onion, sweet'])).to.equal('apple,banana,"onion, sweet"\r\n')
  })
})
