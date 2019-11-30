import { Cache } from '../src/cache'
import { sleep } from '../src/util'
import { expect } from 'chai'

describe('cache', () => {
  const doublingCache = new Cache(async (n: number) => {
    return n * 2
  })
  const delayedDoublingCache = new Cache(async (n: number) => {
    await sleep(300)
    return n * 2
  })
  it('should return transformed values', async () => {
    const four = await doublingCache.get(2)
    expect(four).to.equal(4)
  })
  it('should support multiple keys', async () => {
    const eight = await doublingCache.get(4)
    expect(eight).to.equal(8)
  })
  it('should return a cache hit quickly', async () => {
    await delayedDoublingCache.get(2)
    const startTime = new Date()
    const four = await delayedDoublingCache.get(2)
    const endTime = new Date()
    const elapsed = endTime.getTime() - startTime.getTime()
    expect(elapsed).to.be.lessThan(300)
    expect(four).to.equal(4)
  })
  after(async () => {
    await Promise.all([
      doublingCache.destroy(),
      delayedDoublingCache.destroy()
    ])
  })
})
