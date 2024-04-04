/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import { dateToISOWithTZ, stringifyDateWithTZ, stringifyDates } from '../lib'

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

describe('stringifyDates', () => {
  it('should not change the output when a date is not present', () => {
    const payload = { a: '1', b: 1, c: { d: true } }
    expect(stringifyDates(structuredClone(payload))).to.deep.equal(payload)
  })
  it('should stringify a date inside an object', () => {
    const dt = new Date()
    const payload = { dt }
    expect(stringifyDates(payload)).to.deep.equal({ dt: dateToISOWithTZ(dt) })
  })
  it('should stringify a date inside an array', () => {
    const dt = new Date()
    const payload = [dt]
    expect(stringifyDates(payload)).to.deep.equal([dateToISOWithTZ(dt)])
  })
  it('should stringify a date inside an object inside an array', () => {
    const dt = new Date()
    const payload = [{ dt }]
    expect(stringifyDates(payload)).to.deep.equal([{ dt: dateToISOWithTZ(dt) }])
  })
  it('should stringify a date inside an array inside an object', () => {
    const dt = new Date()
    const payload = { dt: [dt] }
    expect(stringifyDates(payload)).to.deep.equal({ dt: [dateToISOWithTZ(dt)] })
  })
})
