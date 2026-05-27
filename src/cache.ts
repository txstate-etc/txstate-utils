import { Queue } from './queue.js'
import { ensureString } from './stringify.js'
import { sleep } from './util.js'

const newerThan = (dt: Date, seconds: number) => new Date().getTime() - dt.getTime() < (seconds * 1000)

type OnRefreshFunction<KeyType, ReturnType> = (key?: KeyType, value?: ReturnType) => void | Promise<void>

interface CacheOptions<KeyType, ReturnType, StorageEngineType extends (StorageEngine<ReturnType> | SyncStorageEngine<ReturnType>)> {
  freshseconds?: number
  staleseconds?: number
  storageClass?: StorageEngineType
  retries?: number
  autoRefreshKeys?: KeyType[]
  onRefresh?: OnRefreshFunction<KeyType, ReturnType>
}
interface MinimalStorage<ReturnType = any> {
  fetched: Date
  data: ReturnType
}
interface Storage<ReturnType> extends MinimalStorage<ReturnType> {
  prev?: string
  next?: string
}

export interface StorageEngine<StorageType> {
  get: (keystr: string) => Promise<StorageType | undefined>
  set: (keystr: string, data: StorageType) => Promise<void>
  del: (keystr: string) => Promise<void>
  clear: () => Promise<void>
}

export interface SyncStorageEngine<StorageType> {
  get: (keystr: string) => StorageType | undefined
  set: (keystr: string, data: StorageType) => void
  del: (keystr: string) => void
  clear: () => void
}

interface SimpleStorageNode<StorageType> {
  data: StorageType
  expires: Date
  keystr: string
  next?: SimpleStorageNode<StorageType>
  prev?: SimpleStorageNode<StorageType>
}
class SimpleStorage<StorageType> implements SyncStorageEngine<StorageType> {
  private storage: Record<string, SimpleStorageNode<StorageType>>
  private oldest?: SimpleStorageNode<StorageType>
  private newest?: SimpleStorageNode<StorageType>
  private maxAge: number

  constructor (maxAge: number) {
    this.maxAge = maxAge
    this.storage = {}
  }

  get (keystr: string) {
    return this.storage[keystr]?.data
  }

  set (keystr: string, data: StorageType) {
    this.del(keystr)
    const expires = new Date(new Date().getTime() + (this.maxAge * 1000))
    const curr: SimpleStorageNode<StorageType> = { keystr, data, expires }
    if (this.newest) {
      this.newest.next = curr
      curr.prev = this.newest
    } else {
      this.oldest = curr
    }
    this.newest = curr
    this.storage[keystr] = curr
    this.prune()
  }

  del (keystr: string) {
    const curr = this.storage[keystr]
    if (curr) {
      // remove from linked list and repair list
      if (curr.prev) curr.prev.next = curr.next
      if (curr.next) curr.next.prev = curr.prev

      // repair oldest/newest links
      if (this.newest === curr) this.newest = curr.prev
      if (this.oldest === curr) this.oldest = curr.next

      // delete from map

      delete this.storage[keystr]
    }
  }

  clear () {
    this.storage = {}
    this.newest = undefined
    this.oldest = undefined
  }

  private prune () {
    const now = new Date()
    while (this.oldest && this.oldest.expires < now) {
      this.del(this.oldest.keystr)
    }
  }
}

class MemcacheWrapper<StorageType> implements StorageEngine<StorageType> {
  private client: any
  private maxAge: any
  constructor (client: any, maxAge: number) {
    this.client = client
    this.maxAge = maxAge
  }

  async get (keystr: string) {
    return await new Promise<StorageType>((resolve, reject) => {
      this.client.get(keystr, (err: Error, data: StorageType) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  async set (keystr: string, data: StorageType) {
    await new Promise<void>((resolve, reject) => {
      this.client.set(keystr, data, this.maxAge, (err: Error) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  async del (keystr: string) {
    await new Promise<void>((resolve, reject) => {
      this.client.del(keystr, (err: Error) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  async clear () {
    await new Promise<void>((resolve, reject) => {
      this.client.flush((err: Error) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

class MemcacheClientWrapper<StorageType> implements StorageEngine<StorageType> {
  constructor (private client: {
    get: (keystr: string) => Promise<StorageType>
    set: (keystr: string, data: StorageType, opts: { lifetime: number }) => Promise<any>
    delete: (keystr: string) => Promise<any>
    cmd: (command: string) => Promise<any>
  }, private maxAge: number) {
    this.client = client
    this.maxAge = maxAge
  }

  async get (keystr: string) {
    return await this.client.get(keystr)
  }

  async set (keystr: string, data: StorageType) {
    await this.client.set(keystr, data, { lifetime: this.maxAge })
  }

  async del (keystr: string) {
    await this.client.delete(keystr)
  }

  async clear () {
    await this.client.cmd('flush_all')
  }
}

class LRUWrapper<StorageType extends MinimalStorage> implements SyncStorageEngine<StorageType> {
  lruDelete: (keystr: string) => void
  ttlQueue = new Queue<{ fetched: Date, key: string }>()

  constructor (protected lru: any, protected maxAge: number = 0) {
    this.lruDelete = this.lru.delete?.bind(this.lru) ?? this.lru.del.bind(this.lru)
  }

  get (keystr: string) {
    return this.lru.get(keystr)
  }

  set (keystr: string, data: StorageType) {
    this.prune()
    this.ttlQueue.enqueue({ fetched: data.fetched, key: keystr })
    this.lru.set(keystr, data)
  }

  del (keystr: string) {
    this.lruDelete(keystr)
  }

  clear () {
    this.lru.clear()
    this.ttlQueue.clear()
  }

  prune () {
    if (this.ttlQueue.size) {
      const expiredLimit = new Date(new Date().getTime() - (this.maxAge * 1000))
      while (this.ttlQueue.peek()?.fetched != null && this.ttlQueue.peek()!.fetched < expiredLimit) {
        const entry = this.ttlQueue.dequeue()!
        const lruEntry = this.lru.get(entry.key)
        if (lruEntry != null && lruEntry.fetched < expiredLimit) this.lruDelete(entry.key)
      }
    }
  }
}

type OptionalArgPlus<T, V> = T extends undefined
  ? undefined extends T
    ? [V]
    : [T, V]
  : [T, V]
type OptionalArgBoth<T, V> = T extends undefined
  // T is optional or undefined
  ? undefined extends T
    // T is undefined
    ? V extends undefined
      // V is optional or undefined
      ? undefined extends V
        // V is undefined
        ? []
        // V is optional
        : [T, V] | []
      // V is not optional
      : [T, V]
    // T is optional
    : V extends undefined
      // V is optional or undefined
      ? undefined extends V
        // V is undefined
        ? [T] | []
        // V is optional
        : [T, V] | [T] | []
      // V is not optional
      : [T, V]
  // T is not optional
  : V extends undefined
    // V is optional or undefined
    ? undefined extends V
      // V is undefined
      ? [T]
      // V is optional
      : [T, V] | [T]
    // V is not optional
    : [T, V]

type FetcherFunction<KeyType, ReturnType, HelperType>
  = ((key: KeyType) => Promise<ReturnType>)
    | ((key: KeyType, helper: HelperType) => Promise<ReturnType>)
    | (() => Promise<ReturnType>)

export class Cache<KeyType = undefined, ReturnType = any, HelperType = undefined> {
  private fetcher: FetcherFunction<KeyType, ReturnType, HelperType>
  private staleseconds: number
  private freshseconds: number
  private storage: StorageEngine<Storage<ReturnType>> | SyncStorageEngine<Storage<ReturnType>>
  private activeWork = new Map<string, Promise<ReturnType>>()
  private activeGets = new Map<string, Promise<Storage<ReturnType> | undefined>>()
  private onRefresh?: OnRefreshFunction<KeyType, ReturnType>
  private retries: number
  private autoRefreshKeys: KeyType[]
  private autoRefreshTimeout?: NodeJS.Timeout

  constructor (fetcher: FetcherFunction<KeyType, ReturnType, HelperType>, options: CacheOptions<KeyType, ReturnType, any> = {}) {
    this.fetcher = fetcher
    this.freshseconds = options.freshseconds ?? 5 * 60
    this.staleseconds = (options.staleseconds ?? (this.freshseconds * 2)) || Infinity
    this.retries = options.retries ?? 0
    this.autoRefreshKeys = options.autoRefreshKeys ?? []
    const storageClass = options.storageClass ?? {}
    if (storageClass.clear && storageClass.dump) {
      // lru-cache instance

      this.storage = new LRUWrapper<MinimalStorage<ReturnType>>(storageClass, this.staleseconds)
    } else if (storageClass.flush) {
      // memcached client
      this.storage = new MemcacheWrapper<MinimalStorage<ReturnType>>(storageClass, this.staleseconds)
    } else if (storageClass.cmd) {
      // memcache-client client

      this.storage = new MemcacheClientWrapper<MinimalStorage<ReturnType>>(storageClass, this.staleseconds)
    } else if (storageClass.get && storageClass.set && storageClass.del && storageClass.clear) {
      // custom storage engine
      this.storage = storageClass
    } else {
      this.storage = new SimpleStorage<MinimalStorage<ReturnType>>(this.staleseconds)
    }
    this.onRefresh = options.onRefresh
    if (this.autoRefreshKeys.length > 0) {
      this.autoRefreshTimeout = setTimeout(() => { this.autoRefresh() }, 5000)
      this.autoRefresh()
    }
  }

  async get (...params: OptionalArgBoth<KeyType, HelperType>) {
    const key = params[0]
    const keystr = ensureString(key)
    let stored: Storage<ReturnType> | undefined
    if (!this.activeGets.has(keystr)) {
      const storedMaybePromise = this.storage.get(keystr)
      if (storedMaybePromise && 'then' in storedMaybePromise) {
        this.activeGets.set(keystr, storedMaybePromise)
        try {
          stored = await storedMaybePromise
          // this line CANNOT be moved to a `finally` block
          // because that would do it in a later tick which would lead to other "threads"
          // sometimes getting old data
          this.activeGets.delete(keystr)
        } catch (e) {
          this.activeGets.delete(keystr)
          console.warn(e)
        }
      } else {
        stored = storedMaybePromise
      }
    } else {
      stored = await this.activeGets.get(keystr)!
    }
    if (stored) {
      if (this.fresh(stored)) {
        return stored.data
      } else if (this.valid(stored)) {
        // background task - do NOT await the refresh
        this.refresh(...params).catch(error => {
          // since this is a background refresh, errors are invisible to
          // the cache client
          // client will receive errors normally on the first call or
          // after the stored value goes invalid
          console.error(error)
        })
        return stored.data
      }
    }
    return await this.refresh(...params)
  }

  async set (...params: OptionalArgPlus<KeyType, ReturnType>) {
    const key = params.length > 1 ? params[0] as KeyType : undefined
    const data = (params.length > 1 ? params[1] : params[0]) as ReturnType
    const keystr = ensureString(key)
    await this.storage.set(keystr, { fetched: new Date(), data })
  }

  async close () {
    if (this.autoRefreshTimeout) {
      clearTimeout(this.autoRefreshTimeout)
      this.autoRefreshTimeout = undefined
    }
  }

  async invalidate (key: KeyType | string) {
    if (!key) {
      await this.storage.clear()
      return
    }
    const keystr = ensureString(key)
    await this.storage.del(keystr)
  }

  async clear () {
    await this.storage.clear()
  }

  async refresh (...params: OptionalArgBoth<KeyType, HelperType>) {
    const key = params[0] as KeyType
    const helper = params[1] as HelperType
    const keystr = ensureString(key)
    if (this.activeWork.has(keystr)) return await this.activeWork.get(keystr)!
    this.activeWork.set(keystr, this.fetchRetry(key, helper))
    try {
      const data: ReturnType = await this.activeWork.get(keystr)!
      const refreshPromise = this.onRefresh?.(key, data)
      if (refreshPromise) refreshPromise.catch?.(e => { console.error(e) })
      // @ts-expect-error OptionalArgBoth was a bit voodoo; it makes this impossible to generically type
      await this.set(key, data)
      return data
    } finally {
      this.activeWork.delete(keystr)
    }
  }

  private async fetchRetry (key: KeyType, helper: HelperType) {
    let loopNumber = 0

    while (loopNumber <= this.retries) {
      if (loopNumber > 0) {
        const delayMs = 10 * (2 ** loopNumber) // This will start at 20 for the first retry and double each time
        await sleep(delayMs > 1000 ? 1000 : delayMs) // Max one second delay, will kick in at the 7th retry
      }

      try {
        return await this.fetcher(key, helper)
      } catch (e) {
        if (loopNumber >= this.retries) throw e
        console.warn('Cache fetch failed, retrying: ', e)
        loopNumber++
      }
    }

    throw new Error('Max retries reached')
  }

  private fresh (stored: Storage<ReturnType>) {
    return newerThan(stored.fetched, this.freshseconds)
  }

  private valid (stored: Storage<ReturnType>) {
    return newerThan(stored.fetched, this.staleseconds)
  }

  private async autoRefresh () {
    for (const key of this.autoRefreshKeys) {
      let stored: Storage<ReturnType> | undefined
      const keystr = ensureString(key)
      const storedMaybePromise = this.storage.get(keystr)
      if (storedMaybePromise && 'then' in storedMaybePromise) {
        stored = await storedMaybePromise
      } else {
        stored = storedMaybePromise
      }

      if (stored) {
        if (!newerThan(stored.fetched, this.freshseconds + ((this.staleseconds - this.freshseconds) / 2))) {
        // @ts-expect-error OptionalArgBoth was a bit voodoo; it makes this impossible to generically type
          this.refresh(key)
        }
      } else {
        // @ts-expect-error OptionalArgBoth was a bit voodoo; it makes this impossible to generically type
        this.refresh(key)
      }
    }
  }
}
