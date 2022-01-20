/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Cache, sleep } from '../lib'
import { expect } from 'chai'
import Memcached from 'memcached-mock'

async function timed (callback: () => Promise<void>) {
  const startTime = new Date()
  await callback()
  return new Date().getTime() - startTime.getTime()
}
const sleeptime = 25

describe('cache', () => {
  const doublingCache = new Cache(async (n: number) => n * 2)
  const delayedDoublingCache = new Cache(async (n: number) => {
    await sleep(sleeptime)
    return n * 2
  })
  let expiringCount = 0
  const expiringCache = new Cache(async (n: number) => {
    expiringCount++
    return n * 2
  }, { freshseconds: 0.05, staleseconds: 0.05 })
  const singleValueCache = new Cache(async () => {
    return { key: 'value' }
  })
  const throwingCache = new Cache(async () => {
    await sleep(10)
    throw new Error('testing throws')
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
    expect(elapsed).to.be.lessThan(sleeptime)
    expect(four).to.equal(4)
  })
  it('should clear the cache', async () => {
    await delayedDoublingCache.set(2, 4)
    let four
    let elapsed = await timed(async () => {
      four = await delayedDoublingCache.get(2)
    })
    expect(elapsed).to.be.lessThan(sleeptime)
    expect(four).to.equal(4)
    await delayedDoublingCache.clear()
    elapsed = await timed(async () => {
      four = await delayedDoublingCache.get(2)
    })
    expect(elapsed).to.be.gte(sleeptime)
    expect(four).to.equal(4)
  })
  it('should support caches that do not need multiple values stored', async () => {
    const obj = await singleValueCache.get()
    const obj2 = await singleValueCache.get()
    expect(obj?.key).to.equal('value')
    expect(obj2?.key).to.equal('value')
  })
  it('should support set on caches that do not need multiple values stored', async () => {
    await singleValueCache.set({ key: 'anothervalue' })
    const obj = await singleValueCache.get()
    const obj2 = await singleValueCache.get()
    expect(obj?.key).to.equal('anothervalue')
    expect(obj2?.key).to.equal('anothervalue')
  })
  it('should call the onRefresh callback', async () => {
    let refreshCount = 0
    const onRefreshCache = new Cache(async () => 4, {
      onRefresh: () => { refreshCount++ }
    })
    expect(refreshCount).to.equal(0)
    await onRefreshCache.get()
    expect(refreshCount).to.equal(1)
    await onRefreshCache.get()
    expect(refreshCount).to.equal(1)
    await onRefreshCache.refresh()
    expect(refreshCount).to.equal(2)
  })
  it('should be able to use a helper object to fetch, without adding the helper to the key', async () => {
    const helperCache = new Cache(async (n: number, helper?: boolean) => {
      if (helper) return 2 * n
      else return 0
    })
    expect(await helperCache.get(2, true)).to.equal(4)
    expect(await helperCache.get(2, false)).to.equal(4)
    expect(await helperCache.get(2)).to.equal(4)
    await helperCache.clear()
    expect(await helperCache.get(2, false)).to.equal(0)
    await helperCache.clear()
    expect(await helperCache.get(2)).to.equal(0)
    expect(Object.keys((helperCache as any).storage.storage)).to.deep.equal(['2'])
  })
  it('should properly remove objects that have expired', async () => {
    expiringCount = 0
    const ten = await expiringCache.get(5)
    expect(ten).to.equal(10)
    const eight = await expiringCache.get(4)
    expect(eight).to.equal(8)
    expect(expiringCount).to.equal(2)
    await expiringCache.get(5)
    expect(expiringCount).to.equal(2)
    await sleep(100)
    await expiringCache.set(2, 4) // it only prunes after each set
    expect((expiringCache as any).storage.storage).not.to.have.keys(['5'])
    expect((expiringCache as any).storage.oldest.keystr).to.equal('2')
    await expiringCache.get(5)
    expect(expiringCount).to.equal(3)
  })
  it('should throw when the cached function throws', async () => {
    try {
      await throwingCache.get()
      expect(false).to.be.true('boolean', 'throwingCache did not throw on get()')
    } catch (e) {
      expect(true).to.be.true
    }
  })
  it('should reject all simultaneous gets when cached function throws', async () => {
    const p1 = throwingCache.get()
    const p2 = throwingCache.get()
    try {
      await p1
      expect(false).to.be.true('boolean', 'throwingCache did not throw on the first get()')
    } catch {
      expect(true).to.be.true
    }
    try {
      await p2
      expect(false).to.be.true('boolean', 'throwingCache did not throw on the second get()')
    } catch {
      expect(true).to.be.true
    }
  })
})
describe('cache w/memcache', () => {
  const doublingMemCache = new Cache(async (n: number) => n * 2, {
    storageClass: new Memcached('localhost:11211')
  })
  const delayedDoublingMemCache = new Cache(async (n: number) => {
    await sleep(sleeptime)
    return n * 2
  }, {
    storageClass: new Memcached('localhost:11211')
  })
  const singleValueCacheMemCache = new Cache(async () => {
    return { key: 'value' }
  }, {
    storageClass: new Memcached('localhost:11211')
  })
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
    expect(elapsed).to.be.lessThan(sleeptime)
    expect(four).to.equal(4)
  })
  it('should clear memcached', async () => {
    await delayedDoublingMemCache.set(2, 4)
    let four
    let elapsed = await timed(async () => {
      four = await delayedDoublingMemCache.get(2)
    })
    expect(elapsed).to.be.lessThan(sleeptime)
    expect(four).to.equal(4)
    await delayedDoublingMemCache.clear()
    elapsed = await timed(async () => {
      four = await delayedDoublingMemCache.get(2)
    })
    expect(elapsed).to.be.gte(sleeptime)
    expect(four).to.equal(4)
  })
  it('should support caches that do not need multiple values stored in memcached', async () => {
    const obj = await singleValueCacheMemCache.get()
    const obj2 = await singleValueCacheMemCache.get()
    expect(obj?.key).to.equal('value')
    expect(obj2?.key).to.equal('value')
  })
})
