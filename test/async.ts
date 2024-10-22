/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import { filterAsync, someAsync, rescue } from '../lib'

describe('async utils', () => {
  const items = Array.from(Array(20).keys())

  it('filterAsync should filter when the return value is falsy', async () => {
    const filtered = await filterAsync(items, async item => !!(item % 2))
    expect(filtered).to.have.lengthOf(10)
    for (const num of filtered) {
      expect(num % 2).to.equal(1)
    }
  })

  it('someAsync should return true when any return value is truthy', async () => {
    const result = await someAsync(items, async item => !!(item % 2))
    expect(result).to.be.true
  })

  it('someAsync should return false when no return value is truthy', async () => {
    const result = await someAsync(items, async item => false)
    expect(result).to.be.false
  })

  it('rescue returns the value when the promise is resolved', async () => {
    const a = await rescue(new Promise<number>(resolve => { resolve(2) }))
    expect(a).to.equal(2)
  })
  it('rescue returns the value when the promise is resolved, even if there is a default', async () => {
    const a = await rescue(new Promise<number>(resolve => { resolve(2) }), 5)
    expect(a).to.equal(2)
  })
  it('rescue returns undefined when the promise is rejected', async () => {
    const a = await rescue(new Promise<number>((resolve, reject) => { reject(new Error('rejected!')) }))
    expect(a).to.be.undefined
  })
  it('rescue returns a default value when the promise is rejected', async () => {
    const a = await rescue(new Promise<number>((resolve, reject) => { reject(new Error('rejected!')) }), 5)
    expect(a).to.equal(5)
  })
  it('rescue returns a default value when passed an options object', async () => {
    const a = await rescue(new Promise<number>((resolve, reject) => { reject(new Error('rejected!')) }), { defaultValue: 5 })
    expect(a).to.equal(5)
  })
  it('rescue returns a default value only when the error passes a condition', async () => {
    const a = await rescue(new Promise<number>((resolve, reject) => { reject(new Error('rejected!')) }), { defaultValue: 5, condition: e => e.message?.startsWith('rej') })
    expect(a).to.equal(5)
    try {
      await rescue(new Promise<number>((resolve, reject) => { reject(new Error('denied!')) }), { defaultValue: 5, condition: e => e.message?.startsWith('rej') })
      expect.fail('should have thrown since error did not start with "rej"')
    } catch (e: any) {
      expect(e.message).to.equal('denied!')
    }
  })
  it('rescue returns null when an options object is passed with a default value of null', async () => {
    const a = await rescue(new Promise<number>((resolve, reject) => { reject(new Error('rejected!')) }), { defaultValue: null })
    expect(a).to.be.null
  })
})
