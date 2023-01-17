import { expect } from 'chai'
import { csvEscape, csvLine, csvParse } from '../lib'

describe('CSV creation', () => {
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

describe('CSV parsing', () => {
  it('should be able to parse a CSV with no quoted values', () => {
    expect(csvParse('a,b,c')).to.deep.equal([['a', 'b', 'c']])
  })
  it('should be able to parse a CSV with different line break styles', () => {
    expect(csvParse('a,b,c\r\nd,e,f')).to.deep.equal([['a', 'b', 'c'], ['d', 'e', 'f']])
    expect(csvParse('a,b,c\rd,e,f')).to.deep.equal([['a', 'b', 'c'], ['d', 'e', 'f']])
    expect(csvParse('a,b,c\nd,e,f')).to.deep.equal([['a', 'b', 'c'], ['d', 'e', 'f']])
  })
  it('should be able to parse a CSV with quoted values', () => {
    expect(csvParse('a,"b",c')).to.deep.equal([['a', 'b', 'c']])
  })
  it('should be able to parse a CSV with quoted values that contain escaped quotes', () => {
    expect(csvParse('a,"jack and ""jill""",c')).to.deep.equal([['a', 'jack and "jill"', 'c']])
  })
})
