const newerThan = (dt: Date, seconds: number) => (new Date()).getTime() - dt.getTime() < seconds * 1000
const tostr = (key: any) => typeof key === 'string' ? key : JSON.stringify(key)

type FetcherFunction<KeyType, ReturnType> = (key: KeyType) => Promise<ReturnType>
interface CacheOptions<ReturnType> {
  freshseconds?: number
  staleseconds?: number
  storageClass?: StorageEngine<any> | any
}
interface CacheOptionsInternal<ReturnType> {
  freshseconds: number
  staleseconds: number
}
interface Storage<ReturnType> {
  data: ReturnType
  fetched: Date
  prev?: string
  next?: string
}

export interface StorageEngine<StorageType> {
  get: (keystr: string) => Promise<StorageType>
  set: (keystr: string, data: StorageType) => Promise<void>
  del: (keystr: string) => Promise<void>
  clear: () => Promise<void>
}
interface SimpleStorageNode<StorageType> {
  data: StorageType
  expires: Date
  keystr: string
  next?: SimpleStorageNode<StorageType>
  prev?: SimpleStorageNode<StorageType>
}
class SimpleStorage<StorageType> implements StorageEngine<StorageType> {
  private storage: { [keys: string]: SimpleStorageNode<StorageType> }
  private oldest?: SimpleStorageNode<StorageType>
  private newest?: SimpleStorageNode<StorageType>
  private maxAge: number

  constructor (maxAge: number) {
    this.maxAge = maxAge
    this.storage = {}
  }

  async get (keystr: string) {
    return this.storage[keystr]?.data
  }

  async set (keystr: string, data: StorageType) {
    await this.del(keystr)
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
    await this.prune()
  }

  async del (keystr: string) {
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

  async clear () {
    this.storage = {}
    this.newest = undefined
    this.oldest = undefined
  }

  private async prune () {
    const now = new Date()
    while (this.oldest && this.oldest.expires < now) {
      await this.del(this.oldest.keystr)
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
    const ret: Promise<StorageType> = new Promise((resolve, reject) => {
      this.client.get(keystr, (err: Error, data: StorageType) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
    return ret
  }

  async set (keystr: string, data: StorageType) {
    await new Promise((resolve, reject) => {
      this.client.set(keystr, data, this.maxAge, (err: Error) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  async del (keystr: string) {
    await new Promise((resolve, reject) => {
      this.client.del(keystr, (err: Error) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  async clear () {
    await new Promise((resolve, reject) => {
      this.client.flush((err: Error) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

class LRUWrapper<StorageType> implements StorageEngine<StorageType> {
  private client: any
  constructor (client: any) {
    this.client = client
  }

  async get (keystr: string) {
    return this.client.get(keystr)
  }

  async set (keystr: string, data: StorageType) {
    this.client.set(keystr, data)
  }

  async del (keystr: string) {
    this.client.del(keystr)
  }

  async clear () {
    this.client.reset()
  }
}

export class Cache<KeyType = any, ReturnType = any> {
  private fetcher: FetcherFunction<KeyType, ReturnType>
  private options: CacheOptionsInternal<ReturnType>
  private storage: StorageEngine<Storage<ReturnType>>
  private active: { [keys: string]: Promise<ReturnType> }

  constructor (fetcher: FetcherFunction<KeyType, ReturnType>, options: CacheOptions<ReturnType> = {}) {
    this.fetcher = fetcher
    this.options = {
      freshseconds: options.freshseconds ?? 5 * 60,
      staleseconds: options.staleseconds ?? 10 * 60
    }
    const storageClass = options.storageClass || new SimpleStorage<Storage<ReturnType>>(this.options.staleseconds)
    if (storageClass.reset && storageClass.dump) {
      // lru-cache instance
      this.storage = new LRUWrapper(storageClass)
    } else if (storageClass.flush) {
      // memcached client
      this.storage = new MemcacheWrapper(storageClass, this.options.staleseconds)
    } else {
      this.storage = new SimpleStorage<Storage<ReturnType>>(this.options.staleseconds)
    }
    this.active = {}
  }

  async get (key: KeyType) {
    const keystr = tostr(key)
    const stored = await this.storage.get(keystr)
    if (stored) {
      if (this.fresh(stored)) {
        return stored.data
      } else if (this.valid(stored)) {
        // background task - do NOT await the refresh
        this.refresh(key).catch(error => {
          // since this is a background refresh, errors are invisible to
          // the cache client
          // client will receive errors normally on the first call or
          // after the stored value goes invalid
          console.log(error)
        })
        return stored.data
      }
    }
    return this.refresh(key)
  }

  async set (key: KeyType|string, data: ReturnType) {
    const keystr = tostr(key)
    await this.storage.set(keystr, { fetched: new Date(), data })
  }

  async invalidate (key: KeyType | string) {
    if (!key) {
      await this.storage.clear()
      return
    }
    const keystr = tostr(key)
    await this.storage.del(keystr)
  }

  async clear () {
    await this.storage.clear()
  }

  private async refresh (key: KeyType) {
    const keystr = tostr(key)
    if (typeof this.active[keystr] !== 'undefined') return this.active[keystr]
    this.active[keystr] = this.fetcher(key)
    try {
      const data = await this.active[keystr]
      await this.set(keystr, data)
      return data
    } finally {
      delete this.active[keystr]
    }
  }

  private fresh (stored: Storage<ReturnType>) {
    if (!this.options.freshseconds) return true
    return newerThan(stored.fetched, this.options.freshseconds)
  }

  private valid (stored: Storage<ReturnType>) {
    if (!this.options.staleseconds) return true
    return newerThan(stored.fetched, this.options.staleseconds)
  }
}
