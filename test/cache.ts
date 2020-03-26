import { Cache } from '../src/cache'
import { sleep } from '../src/util'
import { expect } from 'chai'
import Memcached from 'memcached-mock'

async function timed (callback: () => Promise<void>) {
  const startTime = new Date()
  await callback()
  return new Date().getTime() - startTime.getTime()
}

describe('cache', () => {
  const doublingCache = new Cache(async (n: number) => n * 2)
  const delayedDoublingCache = new Cache(async (n: number) => {
    await sleep(100)
    return n * 2
  })
  const doublingMemCache = new Cache(async (n: number) => n * 2, {
    storageClass: new Memcached('localhost:11211')
  })
  const delayedDoublingMemCache = new Cache(async (n: number) => {
    await sleep(100)
    return n * 2
  }, {
    storageClass: new Memcached('localhost:11211')
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
    await delayedDoublingCache.set(2, 4)
    let four
    const elapsed = await timed(async () => {
      four = await delayedDoublingCache.get(2)
    })
    expect(elapsed).to.be.lessThan(100)
    expect(four).to.equal(4)
  })
  it('should clear the cache', async () => {
    await delayedDoublingCache.set(2, 4)
    let four
    let elapsed = await timed(async () => {
      four = await delayedDoublingCache.get(2)
    })
    expect(elapsed).to.be.lessThan(100)
    expect(four).to.equal(4)
    await delayedDoublingCache.clear()
    elapsed = await timed(async () => {
      four = await delayedDoublingCache.get(2)
    })
    expect(elapsed).to.be.gte(100)
    expect(four).to.equal(4)
  })

  /* Memcached tests */
  it('should return transformed values from memcached', async () => {
    const four = await doublingMemCache.get(2)
    expect(four).to.equal(4)
  })
  it('should support multiple keys from memcached', async () => {
    const eight = await doublingMemCache.get(4)
    expect(eight).to.equal(8)
  })
  it('should return a cache hit quickly from memcached', async () => {
    await delayedDoublingMemCache.set(2, 4)
    let four
    const elapsed = await timed(async () => {
      four = await delayedDoublingMemCache.get(2)
    })
    expect(elapsed).to.be.lessThan(100)
    expect(four).to.equal(4)
  })
  it('should clear memcached', async () => {
    await delayedDoublingMemCache.set(2, 4)
    let four
    let elapsed = await timed(async () => {
      four = await delayedDoublingMemCache.get(2)
    })
    expect(elapsed).to.be.lessThan(100)
    expect(four).to.equal(4)
    await delayedDoublingMemCache.clear()
    elapsed = await timed(async () => {
      four = await delayedDoublingMemCache.get(2)
    })
    expect(elapsed).to.be.gte(100)
    expect(four).to.equal(4)
  })
})
