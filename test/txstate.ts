/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import { isNetID, extractNetIDFromFederated } from '../src'

describe('netid utils', () => {
  it('should detect good netids', () => {
    expect(isNetID('ab1234')).to.be.true
    expect(isNetID('a_b1234')).to.be.true
    expect(isNetID('a_b123')).to.be.true
    expect(isNetID('ab13')).to.be.true
  })
  it('should ignore case in netids', () => {
    expect(isNetID('aB1234')).to.be.true
    expect(isNetID('A_B1234')).to.be.true
    expect(isNetID('A_B123')).to.be.true
    expect(isNetID('Ab13')).to.be.true
  })
  it('should not ignore trimmable whitespace during detection', () => {
    expect(isNetID('a_b123 ')).to.be.false
    expect(isNetID(' a_b123 ')).to.be.false
    expect(isNetID('\na_b123 \n')).to.be.false
  })
  it('should detect bad netids', () => {
    expect(isNetID('ab1234567')).to.be.false
    expect(isNetID('a-b123')).to.be.false
    expect(isNetID('a_b1w34')).to.be.false
    expect(isNetID('a_b123 4')).to.be.false
    expect(isNetID('ab_13')).to.be.false
    expect(isNetID('a13')).to.be.false
  })
  it('should extract a netid from a federated login', () => {
    expect(extractNetIDFromFederated('ab1234@txstate.edu')).to.equal('ab1234')
    expect(extractNetIDFromFederated('a_b1234@txstate.edu')).to.equal('a_b1234')
  })
  it('should trim before extracting a netid from a federated login', () => {
    expect(extractNetIDFromFederated('ab1234@txstate.edu \n')).to.equal('ab1234')
    expect(extractNetIDFromFederated(' \nab1234@txstate.edu')).to.equal('ab1234')
    expect(extractNetIDFromFederated('a_b1234 @txstate.edu')).to.be.undefined
  })
  it('should return undefined on emails or federated logins from other domains', () => {
    expect(extractNetIDFromFederated('abby@txstate.edu')).to.be.undefined
    expect(extractNetIDFromFederated('a_b1234@tsus.edu')).to.be.undefined
    expect(extractNetIDFromFederated('abb1@gmail.com')).to.be.undefined
  })
  it('should normalize returned netid to lower case', () => {
    expect(extractNetIDFromFederated('AB1234@txstate.edu')).to.equal('ab1234')
    expect(extractNetIDFromFederated('a_B1234@txstate.edu')).to.equal('a_b1234')
  })
})
