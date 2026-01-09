/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Cache, sleep, type StorageEngine } from '../lib'
import { expect } from 'chai'
import { LRUCache } from 'lru-cache'
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
  }, { freshseconds: 0.01, staleseconds: 0.01 })
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
  it('should only do the work once for simultaneous gets', async () => {
    let workCount = 0
    const workCache = new Cache(async (n: number) => {
      workCount++
      await sleep(sleeptime)
      return n * 2
    })
    const firstPromise = workCache.get(3)
    const secondPromise = workCache.get(3)
    const [first, second] = await Promise.all([firstPromise, secondPromise])
    expect(first).to.equal(6)
    expect(second).to.equal(6)
    expect(workCount).to.equal(1)
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
    expect(Object.keys((helperCache as any).storage.storage as object)).to.deep.equal(['2'])
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
    await sleep(sleeptime)
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
  it('should not do the work twice when two simultaneous requests see a cache miss from memcached', async () => {
    class DelayedStorageEngine<StorageType> implements StorageEngine<StorageType> {
      protected storage = new Map<string, StorageType>()
      async get (keystr: string) {
        await sleep(10)
        return this.storage.get(keystr)
      }

      async set (keystr: string, data: StorageType) {
        this.storage.set(keystr, data)
      }

      async del (keystr: string) {
        this.storage.delete(keystr)
      }

      async clear () {
        this.storage.clear()
      }
    }
    let didTheWork = 0
    const delayedStorageCache = new Cache(async (num: number) => {
      didTheWork++
      return num * 2
    }, {
      storageClass: new DelayedStorageEngine()
    })
    const firstPromise = delayedStorageCache.get(3)
    const secondPromise = delayedStorageCache.get(3)
    const [first, second] = await Promise.all([firstPromise, secondPromise])
    expect(first).to.equal(6)
    expect(second).to.equal(6)
    expect(didTheWork).to.equal(1)
  })
})

describe('cache w/LRU', () => {
  const doublingLRUCache = new Cache(async (n: number) => n * 2, {
    storageClass: new LRUCache({ max: 3 })
  })
  const delayedDoublingLRUCache = new Cache(async (n: number) => {
    await sleep(sleeptime)
    return n * 2
  }, {
    storageClass: new LRUCache({ max: 3 })
  })
  const singleValueCacheLRUCache = new Cache(async () => {
    return { key: 'value' }
  }, {
    storageClass: new LRUCache({ max: 3 })
  })
  it('should return transformed values from LRU', async () => {
    const four = await doublingLRUCache.get(2)
    expect(four).to.equal(4)
  })
  it('should support multiple keys from LRU', async () => {
    const eight = await doublingLRUCache.get(4)
    expect(eight).to.equal(8)
  })
  it('should return a cache hit quickly from LRU', async () => {
    await delayedDoublingLRUCache.set(2, 4)
    let four
    const elapsed = await timed(async () => {
      four = await delayedDoublingLRUCache.get(2)
    })
    expect(elapsed).to.be.lessThan(sleeptime)
    expect(four).to.equal(4)
  })
  it('should clear LRU', async () => {
    await delayedDoublingLRUCache.set(2, 4)
    let four
    let elapsed = await timed(async () => {
      four = await delayedDoublingLRUCache.get(2)
    })
    expect(elapsed).to.be.lessThan(sleeptime)
    expect(four).to.equal(4)
    await delayedDoublingLRUCache.clear()
    elapsed = await timed(async () => {
      four = await delayedDoublingLRUCache.get(2)
    })
    expect(elapsed).to.be.gte(sleeptime)
    expect(four).to.equal(4)
  })
  it('should support caches that do not need multiple values stored in LRU', async () => {
    const obj = await singleValueCacheLRUCache.get()
    const obj2 = await singleValueCacheLRUCache.get()
    expect(obj?.key).to.equal('value')
    expect(obj2?.key).to.equal('value')
  })
  it('should only store 3 values in the LRU', async () => {
    const promises = []
    for (let i = 0; i < 5; i++) {
      promises.push(delayedDoublingLRUCache.get(i))
    }
    await Promise.all(promises)
    const elapsed = await timed(async () => {
      await delayedDoublingLRUCache.get(0)
    })
    expect(elapsed).to.be.gte(sleeptime)
  })
  it('should delete entries manually', async () => {
    await delayedDoublingLRUCache.set(2, 4)
    await delayedDoublingLRUCache.invalidate(2)
    const elapsed = await timed(async () => {
      await delayedDoublingLRUCache.get(2)
    })
    expect(elapsed).to.be.gte(sleeptime)
  })
  it('should return cache hit after freshseconds but before staleseconds', async () => {
    let count = 0
    const cache = new Cache(async (n: number) => {
      count++
      await sleep(sleeptime)
      return n * 2
    }, {
      freshseconds: 0.01,
      staleseconds: 5,
      storageClass: new LRUCache({ max: 3 })
    })
    const ten = await cache.get(5)
    expect(ten).to.equal(10)
    expect(count).to.equal(1)
    await sleep(15)
    const elapsed = await timed(async () => {
      const tenagain = await cache.get(5)
      expect(tenagain).to.equal(10)
    })
    expect(elapsed).to.be.lessThan(sleeptime)
    // it should have triggered a refresh
    expect(count).to.equal(2)
  })
  it('should continue to return stale values after an error', async () => {
    let count = 0
    let threwError = false
    const cache = new Cache(async (n: number) => {
      count++
      if (count >= 2) {
        threwError = true
        throw new Error('testing error')
      }
      await sleep(sleeptime)
      return n * 2
    }, {
      freshseconds: 0.01,
      staleseconds: 5,
      storageClass: new LRUCache({ max: 3 })
    })
    const ten = await cache.get(5)
    expect(ten).to.equal(10)
    expect(count).to.equal(1)
    expect(threwError).to.be.false
    await sleep(15)
    const elapsed = await timed(async () => {
      const tenagain = await cache.get(5)
      expect(tenagain).to.equal(10)
    })
    expect(elapsed).to.be.lessThan(sleeptime)
    expect(threwError).to.be.true
    expect(count).to.equal(2)
  })
  it('should clean up stale entries after staleseconds', async () => {
    const lruCache = new LRUCache({ max: 10 })
    const cache = new Cache(async (n: number) => {
      return n * 2
    }, {
      freshseconds: 0.01,
      staleseconds: 0.02,
      storageClass: lruCache
    })
    void cache.get(1)
    void cache.get(2)
    void cache.get(3)
    await sleep(25)
    expect(lruCache.size).to.equal(3)
    await cache.get(4)
    expect(lruCache.size).to.equal(1)
  })
  it('should not crash if a cache entry is deleted and then expires', async () => {
    const lruCache = new LRUCache({ max: 10 })
    const cache = new Cache(async (n: number) => {
      return n * 2
    }, {
      freshseconds: 0.01,
      staleseconds: 0.02,
      storageClass: lruCache
    })
    await cache.get(1)
    await cache.invalidate(1)
    await sleep(25)
    await cache.get(2)
    expect(lruCache.size).to.equal(1)
  })
})
