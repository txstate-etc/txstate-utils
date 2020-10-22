/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import { eachConcurrent, sleep, mapConcurrent, filterConcurrent } from '../src'

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
})
