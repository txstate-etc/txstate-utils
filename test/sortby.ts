/* eslint-disable @typescript-eslint/no-unused-expressions */
import { sortby } from '../lib'
import { expect } from 'chai'

describe('sortby', () => {
  function getArray () {
    return [
      { first: 1, second: 3, third: { value: 3 } },
      { first: 5, second: 3, third: { value: 1 } },
      { first: 2, second: 3, third: { value: 1 } },
      { first: 4, second: 3, third: { value: 4 } },
      { first: 3, second: 3, third: { value: 2 } },
      { first: 1, second: 1, third: { value: 5 } }
    ]
  }
  it('should do a sort by property name', () => {
    const sorted = sortby(getArray(), 'first')
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].first).to.be.greaterThanOrEqual(sorted[i - 1].first)
    }
  })
  it('should do a sort by property name with a tiebreaker', () => {
    const sorted = sortby(getArray(), 'second', 'first')
    expect(sorted[sorted.length - 1].first).to.equal(5)
  })
  it('should do a sort by descending property name with a tiebreaker', () => {
    const sorted = sortby(getArray(), 'second', true, 'first')
    expect(sorted[sorted.length - 1].second).to.equal(1)
    expect(sorted[sorted.length - 1].first).to.equal(1)
  })
  it('should do a sort by property name with a descending tiebreaker', () => {
    const sorted = sortby(getArray(), 'second', 'first', true)
    expect(sorted[sorted.length - 1].second).to.equal(3)
    expect(sorted[sorted.length - 1].first).to.equal(1)
  })
  it('should do a descending sort by property name', () => {
    const sorted = sortby(getArray(), 'first', true)
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].first).to.be.lessThanOrEqual(sorted[i - 1].first)
    }
  })
  it('should do a sort by dot-separated path', () => {
    const sorted = sortby(getArray(), 'third.value')
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].third.value).to.be.greaterThanOrEqual(sorted[i - 1].third.value)
    }
  })
  it('should do a sort by transformation', () => {
    const sorted = sortby(getArray(), itm => itm.third.value)
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].third.value).to.be.greaterThanOrEqual(sorted[i - 1].third.value)
    }
  })
  it('should do a sort by property name with a transformation tiebreaker', () => {
    const sorted = sortby(getArray(), 'second', itm => itm.third.value)
    expect(sorted[sorted.length - 1].third.value).to.equal(4)
  })
})
