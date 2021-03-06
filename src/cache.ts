const newerThan = (dt: Date, seconds: number) => new Date().getTime() - dt.getTime() < (seconds * 1000)
const tostr = (key: any) => typeof key === 'string' ? key : JSON.stringify(key)

type OnRefreshFunction<KeyType, ReturnType> = (key?: KeyType, value?: ReturnType) => void|Promise<void>

interface CacheOptions <KeyType, ReturnType, StorageEngineType extends StorageEngine<ReturnType>> {
  freshseconds?: number
  staleseconds?: number
  storageClass?: StorageEngineType
  onRefresh?: OnRefreshFunction<KeyType, ReturnType>
}
interface CacheOptionsInternal {
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
        : [T, V]|[]
      // V is not optional
      : [T, V]
    // T is optional
    : V extends undefined
      // V is optional or undefined
      ? undefined extends V
        // V is undefined
        ? [T]|[]
        // V is optional
        : [T, V]|[T]|[]
      // V is not optional
      : [T, V]
  // T is not optional
  : V extends undefined
    // V is optional or undefined
    ? undefined extends V
      // V is undefined
      ? [T]
      // V is optional
      : [T, V]|[T]
    // V is not optional
    : [T, V]

type FetcherFunction<KeyType, ReturnType, HelperType> =
  ((key: KeyType) => Promise<ReturnType>) |
  ((key: KeyType, helper: HelperType) => Promise<ReturnType>) |
  (() => Promise<ReturnType>)

export class Cache<KeyType = undefined, ReturnType = any, HelperType = undefined> {
  private fetcher: FetcherFunction<KeyType, ReturnType, HelperType>
  private options: CacheOptionsInternal
  private storage: StorageEngine<Storage<ReturnType>>
  private active: { [keys: string]: Promise<ReturnType> }
  private onRefresh?: OnRefreshFunction<KeyType, ReturnType>

  constructor (fetcher: FetcherFunction<KeyType, ReturnType, HelperType>, options: CacheOptions<KeyType, ReturnType, any> = {}) {
    this.fetcher = fetcher
    this.options = {
      freshseconds: options.freshseconds ?? 5 * 60,
      staleseconds: (options.staleseconds ?? 10 * 60) || Infinity
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
    this.onRefresh = options.onRefresh
    this.active = {}
  }

  async get (...params: OptionalArgBoth<KeyType, HelperType>) {
    const key = params[0]
    const keystr = tostr(key)
    const stored = await this.storage.get(keystr)
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
          console.log(error)
        })
        return stored.data
      }
    }
    return this.refresh(...params)
  }

  async set (...params: OptionalArgPlus<KeyType, ReturnType>) {
    const key = params.length > 1 ? params[0] as KeyType : undefined
    const data = (params.length > 1 ? params[1] : params[0]) as ReturnType
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

  async refresh (...params: OptionalArgBoth<KeyType, HelperType>) {
    const key = params[0] as KeyType
    const helper = params[1] as HelperType
    const keystr = tostr(key)
    if (typeof this.active[keystr] !== 'undefined') return await this.active[keystr]
    this.active[keystr] = this.fetcher(key, helper)
    try {
      const data = await this.active[keystr]
      const refreshPromise = this.onRefresh?.(key, data)
      if (refreshPromise) refreshPromise.catch?.(e => console.error(e))
      await this.set(...[key, data] as any)
      return data
    } finally {
      delete this.active[keystr]
    }
  }

  private fresh (stored: Storage<ReturnType>) {
    return newerThan(stored.fetched, this.options.freshseconds)
  }

  private valid (stored: Storage<ReturnType>) {
    return newerThan(stored.fetched, this.options.staleseconds)
  }
}
