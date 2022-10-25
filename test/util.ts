/* eslint-disable @typescript-eslint/no-unused-expressions */
import { sleep, hashid, randomid, isEmpty, isBlank, isNotBlank, csvEscape, csvLine, isEmail, isNotEmpty, isTruthy, isNull, isNotNull, optionalString, roundTo, printIf } from '../lib'
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
    expect(elapsed).to.be.gte(0)
  })
})

describe('randomid', () => {
  it('should always begin with a lowercase letter and be greater than 4 characters', () => {
    const id = randomid()
    expect(id).to.match(/^[a-z]/)
    expect(id.length).to.be.gte(4)
  })
})

describe('hashid', () => {
  it('should always begin with a lowercase letter and be greater than 4 characters', () => {
    const id = hashid('test')
    expect(id).to.match(/^[a-z]/)
    expect(id.length).to.be.gte(4)
  })
  it('should produce different output for different input', () => {
    const id1 = hashid('test my input string')
    const id2 = hashid('test my input string again')
    expect(id1).not.to.equal(id2)
  })
  it('should produce the same output for the same input', () => {
    const id1 = hashid('test my input string')
    const id2 = hashid('test my input string')
    expect(id1).to.equal(id2)
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
    let val: string | undefined = ''
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

describe('isNull', () => {
  it('should return not null for strings, numbers, objects, arrays and functions', () => {
    expect(isNull('string')).to.be.false
    expect(isNull(4)).to.be.false
    expect(isNull([])).to.be.false
    expect(isNull({})).to.be.false
    expect(isNull(() => {})).to.be.false
    expect(isNotNull('string')).to.be.true
    expect(isNotNull(4)).to.be.true
    expect(isNotNull([])).to.be.true
    expect(isNotNull({})).to.be.true
    expect(isNotNull(() => {})).to.be.true
  })
  it('should treat 0 as not null', () => {
    expect(isNull(0)).to.be.false
    expect(isNotNull(0)).to.be.true
  })
  it('should treat null and undefined the same', () => {
    expect(isNull(undefined)).to.equal(isNull(null))
    expect(isNotNull(undefined)).to.equal(isNotNull(null))
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
  it('should properly typeguard when using isTruthy', () => {
    // eslint-disable-next-line prefer-const
    let obj: { hello: string } | undefined
    if (!isTruthy(obj)) expect(obj).to.be.undefined
    obj = { hello: 'world' }
    if (isTruthy(obj)) expect(obj.hello).to.equal('world')
  })
  it('should properly typeguard when using isNull', () => {
    // eslint-disable-next-line prefer-const
    let obj: { hello: string } | undefined
    if (isNull(obj)) expect(obj).to.be.undefined
    obj = { hello: 'world' }
    if (isNotNull(obj)) expect(obj.hello).to.equal('world')
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
    const email: string | undefined = 'test@txstate.edu'
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

let couldBeNull: string | null
describe('optionalString', () => {
  it('should work for primitive types', () => {
    expect(optionalString(2)).to.equal('2')
    const now = new Date()
    expect(optionalString(now)).to.equal(now.toString())
    expect(optionalString(true)).to.equal('true')
    expect(optionalString('3')).to.equal('3')
  })
  it('should return undefined for undefined and null', () => {
    expect(optionalString(null)).to.be.undefined
    expect(optionalString(undefined)).to.be.undefined
    expect(optionalString(couldBeNull)).to.be.undefined
  })
  it('should follow behavior of String() constructor for non-stringable input', () => {
    expect(optionalString({})).to.equal(String({}))
  })
})

describe('printIf', () => {
  it('should work for primitive types', () => {
    expect(printIf(2)).to.equal('2')
    const now = new Date()
    expect(printIf(now)).to.equal(now.toString())
    expect(printIf(true)).to.equal('true')
    expect(printIf('3')).to.equal('3')
  })
  it('should return empty string for undefined and null', () => {
    expect(printIf(null)).to.equal('')
    expect(printIf(undefined)).to.equal('')
    expect(printIf(couldBeNull)).to.equal('')
  })
  it('should follow behavior of String() constructor for non-stringable input', () => {
    expect(printIf({})).to.equal(String({}))
  })
  it('should return empty string when provided a false condition', () => {
    expect(printIf(false, 4)).to.equal('')
  })
  it('should return the string when provided a true condition', () => {
    expect(printIf(true, 4)).to.equal('4')
  })
  it('should return empty string when provided a true condition but undefined value', () => {
    expect(printIf(true, undefined)).to.equal('')
  })
  it('should follow behavior of String() constructor for non-stringable input when provided a condition', () => {
    expect(printIf(true, {})).to.equal(String({}))
  })
})

describe('roundTo', () => {
  it('should round 1.005 to 1.01', () => {
    expect(roundTo(1.005, 2)).to.equal(1.01)
  })
  it('should default to integer rounding', () => {
    expect(roundTo(1234)).to.equal(1234)
    expect(roundTo(1234.0004)).to.equal(1234)
    expect(roundTo(1234.5004)).to.equal(1235)
    expect(roundTo(1234.4004)).to.equal(1234)
  })
  it('should work for positive digits', () => {
    expect(roundTo(1234.94, 1)).to.equal(1234.9)
    expect(roundTo(1234.94698, 2)).to.equal(1234.95)
    expect(roundTo(1234.0987, 3)).to.equal(1234.099)
  })
  it('should work for negative digits', () => {
    expect(roundTo(1234.90, -1)).to.equal(1230)
    expect(roundTo(1234, -2)).to.equal(1200)
    expect(roundTo(1234.0987, -3)).to.equal(1000)
  })
})
