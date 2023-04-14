/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import { htmlDecode, htmlEncode } from '../lib'

describe('htmlEncode', () => {
  it('should encode special characters in a string', () => {
    expect(htmlEncode('7 > 5')).to.equal('7 &gt; 5')
  })
  it('should encode multiple special characters in a string', () => {
    expect(htmlEncode('7 > 5 & 7 < 9')).to.equal('7 &gt; 5 &amp; 7 &lt; 9')
  })
  it('should pass through strings that do not have special characters', () => {
    expect(htmlEncode('7 is greater than 5 and 7 is less than 9')).to.equal('7 is greater than 5 and 7 is less than 9')
  })
  it('should return empty string when undefined or null', () => {
    expect(htmlEncode(undefined)).to.equal('')
    expect(htmlEncode(null)).to.equal('')
  })
})

describe('htmlDecode', () => {
  it('should encode and decode special characters', () => {
    const testStrings = ['7 > 5', '7 = 5', '7 == 5 && 9 != 8', 'copyright ©', '`backticks`']
    for (const str of testStrings) {
      expect(htmlDecode(htmlEncode(str))).to.equal(str)
    }
  })
})
