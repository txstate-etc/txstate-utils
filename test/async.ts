/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import { filterAsync, rescue } from '../src'

describe('async utils', () => {
  const items = Array.from(Array(20).keys())

  it('filterAsync should filter when the return value is falsy', async () => {
    const filtered = await filterAsync(items, async item => !!(item % 2))
    expect(filtered).to.have.lengthOf(10)
    for (const num of filtered) {
      expect(num % 2).to.equal(1)
    }
  })

  it('rescue returns the value when the promise is resolved', async () => {
    const a = await rescue(new Promise<number>(resolve => resolve(2)))
    expect(a).to.equal(2)
  })
  it('rescue returns the value when the promise is resolved, even if there is a default', async () => {
    const a = await rescue(new Promise<number>(resolve => resolve(2)), 5)
    expect(a).to.equal(2)
  })
  it('rescue returns undefined when the promise is rejected', async () => {
    const a = await rescue(new Promise<number>((resolve, reject) => reject(new Error('rejected!'))))
    expect(a).to.be.undefined
  })
  it('rescue returns a default value when the promise is rejected', async () => {
    const a = await rescue(new Promise<number>((resolve, reject) => reject(new Error('rejected!'))), 5)
    expect(a).to.equal(5)
  })
})
