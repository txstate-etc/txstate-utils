/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import { eachConcurrent, sleep, mapConcurrent, filterConcurrent, someConcurrent, pLimit } from '../lib'

describe('concurrent utils', () => {
  const items = Array.from(Array(20).keys())
  const sleeptime = 25
  it('eachConcurrent should go through a list of items with a max concurrency of 5', async () => {
    const starttime = new Date()
    await eachConcurrent(items, 5, () => sleep(sleeptime))
    const endtime = new Date()
    expect(endtime.getTime() - starttime.getTime()).to.be.lessThan(sleeptime * 5).and.gte(sleeptime * 4)
  })

  it('eachConcurrent should default to a max concurrency of 10', async () => {
    const starttime = new Date()
    await eachConcurrent(items, () => sleep(sleeptime))
    const endtime = new Date()
    expect(endtime.getTime() - starttime.getTime()).to.be.lessThan(sleeptime * 3).and.gte(sleeptime * 2)
  })

  it('eachConcurrent should properly return values', async () => {
    const doubles = await eachConcurrent(items, async (item) => item * 2)
    expect(doubles).to.deep.equal(items.map(i => i * 2))
  })

  it('mapConcurrent should properly return values', async () => {
    const doubles = await mapConcurrent(items, async (item) => item * 2)
    expect(doubles).to.deep.equal(items.map(i => i * 2))
  })

  it('filterConcurrent should filter when the return value is falsy', async () => {
    const filtered = await filterConcurrent(items, async item => !!(item % 2))
    expect(filtered).to.have.lengthOf(10)
    for (const num of filtered) {
      expect(num % 2).to.equal(1)
    }
  })

  it('someConcurrent should return true when any return value is truthy', async () => {
    const result = await someConcurrent(items, async item => !!(item % 2))
    expect(result).to.be.true
  })

  it('someConcurrent should return false when no return value is truthy', async () => {
    const result = await someConcurrent(items, async item => false)
    expect(result).to.be.false
  })

  it('eachConcurrent should properly return values with in-flight limit', async () => {
    const doubles = await eachConcurrent(items, 2, async (item) => item * 2)
    expect(doubles).to.deep.equal(items.map(i => i * 2))
  })

  it('mapConcurrent should properly return values with in-flight limit', async () => {
    const doubles = await mapConcurrent(items, 2, async (item) => item * 2)
    expect(doubles).to.deep.equal(items.map(i => i * 2))
  })

  it('filterConcurrent should filter with in-flight limit', async () => {
    const filtered = await filterConcurrent(items, 2, async item => !!(item % 2))
    expect(filtered).to.have.lengthOf(10)
    for (const num of filtered) {
      expect(num % 2).to.equal(1)
    }
  })

  it('someConcurrent should return true when any return value is truthy, with in-flight limit', async () => {
    const result = await someConcurrent(items, 2, async item => !!(item % 2))
    expect(result).to.be.true
  })

  it('someConcurrent should return false when no return value is truthy, with in-flight limit', async () => {
    const result = await someConcurrent(items, 2, async item => false)
    expect(result).to.be.false
  })

  it('pLimit should expose active and pending count', async () => {
    const limit = pLimit(2)
    expect(limit.activeCount).to.equal(0)
    expect(limit.pendingCount).to.equal(0)
    limit(async () => await sleep(500)).catch(console.error)
    await sleep(2)
    expect(limit.activeCount).to.equal(1)
    limit(async () => await sleep(500)).catch(console.error)
    limit(async () => await sleep(500)).catch(console.error)
    await sleep(2)
    expect(limit.activeCount).to.equal(2)
    expect(limit.pendingCount).to.equal(1)
  })
})
