import { ensureString } from './stringify.js'
const newerThan = (dt: Date, seconds: number) => new Date().getTime() - dt.getTime() < (seconds * 1000)

type OnRefreshFunction<KeyType, ReturnType> = (key?: KeyType, value?: ReturnType) => void | Promise<void>

interface CacheOptions <KeyType, ReturnType, StorageEngineType extends (StorageEngine<ReturnType> | SyncStorageEngine<ReturnType>)> {
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

type FetcherFunction<KeyType, ReturnType, HelperType> =
  ((key: KeyType) => Promise<ReturnType>) |
  ((key: KeyType, helper: HelperType) => Promise<ReturnType>) |
  (() => Promise<ReturnType>)

export class Cache<KeyType = undefined, ReturnType = any, HelperType = undefined> {
  private fetcher: FetcherFunction<KeyType, ReturnType, HelperType>
  private options: CacheOptionsInternal
  private storage: StorageEngine<Storage<ReturnType>> | SyncStorageEngine<Storage<ReturnType>>
  private activeWork = new Map<string, Promise<ReturnType>>()
  private activeGets = new Map<string, Promise<Storage<ReturnType> | undefined>>()
  private onRefresh?: OnRefreshFunction<KeyType, ReturnType>

  constructor (fetcher: FetcherFunction<KeyType, ReturnType, HelperType>, options: CacheOptions<KeyType, ReturnType, any> = {}) {
    this.fetcher = fetcher
    const freshseconds = options.freshseconds ?? 5 * 60
    this.options = {
      freshseconds,
      staleseconds: (options.staleseconds ?? (freshseconds * 2)) || Infinity
    }
    const storageClass = options.storageClass || new SimpleStorage<Storage<ReturnType>>(this.options.staleseconds)
    if (storageClass.clear && storageClass.dump) {
      // lru-cache instance
      this.storage = storageClass
    } else if (storageClass.flush) {
      // memcached client
      this.storage = new MemcacheWrapper(storageClass, this.options.staleseconds)
    } else {
      this.storage = new SimpleStorage<Storage<ReturnType>>(this.options.staleseconds)
    }
    this.onRefresh = options.onRefresh
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
        } catch {
          this.activeGets.delete(keystr)
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
    this.activeWork.set(keystr, this.fetcher(key, helper))
    try {
      const data = await this.activeWork.get(keystr)!
      const refreshPromise = this.onRefresh?.(key, data)
      if (refreshPromise) refreshPromise.catch?.(e => { console.error(e) })
      await this.set(...[key, data] as any)
      return data
    } finally {
      this.activeWork.delete(keystr)
    }
  }

  private fresh (stored: Storage<ReturnType>) {
    return newerThan(stored.fetched, this.options.freshseconds)
  }

  private valid (stored: Storage<ReturnType>) {
    return newerThan(stored.fetched, this.options.staleseconds)
  }
}
