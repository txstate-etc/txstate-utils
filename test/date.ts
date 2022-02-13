/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import { dateToISOWithTZ, stringifyDateWithTZ } from '../lib'

describe('dateToISOWithTZ', () => {
  it('should produce a date string that parses back into the same Date object', () => {
    const now = new Date()
    const nowStr = dateToISOWithTZ(now)
    expect(nowStr).to.be.a('string')
    expect(new Date(nowStr).toISOString()).to.equal(now.toISOString())
  })
})

describe('stringifyDateWithTZ', () => {
  it('should not crash JSON.stringify when no date is present', () => {
    const payload = { a: '1', b: 1 }
    expect(JSON.stringify(payload, stringifyDateWithTZ)).to.equal(JSON.stringify(payload))
  })
  it('should not crash JSON.stringify when a date is present', () => {
    const payload = { dt: new Date() }
    expect(JSON.stringify(payload, stringifyDateWithTZ)).to.be.a('string')
  })
})
