/* eslint-disable @typescript-eslint/no-unused-expressions */
import { hashify } from '../src'
import { expect } from 'chai'

describe('hashify', () => {
  const sym = Symbol('id')
  const records = [
    { [sym]: 1, idnum: 1, idstr: 'one', name: 'One', deep: { id: 1 } },
    { [sym]: 2, idnum: 2, idstr: 'two', name: 'Two', deep: { id: 2 } },
    { [sym]: 3, idnum: 3, idstr: 'three', name: 'Three', deep: { id: 3 } },
    { [sym]: 4, idnum: 4, idstr: 'four', name: 'Four' }
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
    expect(Object.keys(hashed)).to.have.lengthOf(3)
    expect(hashed[1].name).to.equal('One')
  })
  it('should work with an extractor function', () => {
    const hashed = hashify(records, record => record?.deep?.id)
    expect(Object.keys(hashed)).to.have.lengthOf(3)
    expect(hashed[1].name).to.equal('One')
  })
  it('should be null safe', () => {
    const hashed = hashify(undefined, 'id')
    expect(hashed).to.be.a('object')
    expect(Object.keys(hashed)).to.have.lengthOf(0)
  })
  it('should map to booleans when given an array of numbers or strings', () => {
    const hashed = hashify([1, 3, 5, 7])
    expect(hashed[3]).to.equal(true)
    expect(hashed[4]).to.equal(undefined)
  })
})
