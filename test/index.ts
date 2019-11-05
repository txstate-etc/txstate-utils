import { Cache } from '../lib/cache'
import { sleep } from '../lib/util'
import { expect } from 'chai'

describe('cache', () => {
  const doublingCache = new Cache(async (n:number) => {
    await sleep(500)
    return n * 2
  })
  it('should return transformed values', async () => {
    const four = await doublingCache.get(2)
    expect(four).to.equal(4)
  })
  it('should return a cache hit quickly', async () => {
    const startTime = new Date()
    const four = await doublingCache.get(2)
    const endTime = new Date()
    const elapsed = endTime.getTime() - startTime.getTime()
    expect(elapsed).to.be.lessThan(500)
    expect(four).to.equal(4)
  })
  it('should support multiple keys', async () => {
    const eight = await doublingCache.get(4)
    expect(eight).to.equal(8)
  })
  after(async () => await doublingCache.destroy())
})
