import { expect } from 'chai'
import { titleCase, ucfirst } from '../lib'

describe('ucfirst', function () {
  it('should change the first character of a string to upper case', () => {
    expect(ucfirst('test')).to.equal('Test')
  })
  it('should not change the first character of any words beyond the first', () => {
    expect(ucfirst('test me now')).to.equal('Test me now')
  })
  it('should work on UTF8 characters', () => {
    expect(ucfirst('ñino')).to.equal('Ñino')
  })
})
describe('titleCase', () => {
  it('should Title Case a string, ignoring multiple non-word characters', () => {
    expect(titleCase('This-has-dashes-_+and+such')).to.equal('This Has Dashes And Such')
  })
  it('should convert camelCase to Title Case', () => {
    expect(titleCase('thisIsCamelCase')).to.equal('This Is Camel Case')
  })
  it('should convert camelCase plus numbers', () => {
    expect(titleCase('thisIsCamelCase105')).to.equal('This Is Camel Case 105')
    expect(titleCase('thisIsCamelCase105plus')).to.equal('This Is Camel Case 105 Plus')
    expect(titleCase('thisIsCamelCase105Plus')).to.equal('This Is Camel Case 105 Plus')
  })
  it('should not add extra spaces when a capitalized word follows a non-word character', () => {
    expect(titleCase('thisIsCamel-Case')).to.equal('This Is Camel Case')
  })
  it('should ignore line breaks and carriage returns', () => {
    expect(titleCase('thisIs \nCamelCase')).to.equal('This Is Camel Case')
  })
})
