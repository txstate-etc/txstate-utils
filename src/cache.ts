import { sleep } from './util'

const newerThan = (dt:Date, seconds:number) => (new Date()).getTime() - dt.getTime() < seconds * 1000
const tostr = (key:any) => typeof key === 'string' ? key : JSON.stringify(key)

type FetcherFunction<KeyType, ReturnType> = (key:KeyType) => Promise<ReturnType>
interface CacheOptions<ReturnType> {
  freshseconds?: number
  staleseconds?: number
  cleanupseconds?: number
  storageClass?: StorageEngine<any>
}
interface CacheOptionsInternal<ReturnType> extends CacheOptions<ReturnType> {
  freshseconds: number
  staleseconds: number
  cleanupseconds: number
  storageClass: StorageEngine<any>
}
interface Storage<ReturnType> {
  data: ReturnType
  fetched: Date
}

interface StorageEngine<StorageType> {
  get (keystr:string): Promise<StorageType>
  set (keystr:string, data:StorageType): Promise<void>
  delete (keystr:string): Promise<void>
  clear (): Promise<void>
  entries (): Promise<[string, StorageType][]>
}
class MemoryStorage<StorageType> implements StorageEngine<StorageType> {
  private storage:{ [keys:string]: StorageType }

  constructor () {
    this.storage = {}
  }

  async get (keystr:string) {
    return this.storage[keystr]
  }

  async set (keystr:string, data: StorageType) {
    this.storage[keystr] = data
  }

  async delete (keystr:string) {
    delete this.storage[keystr]
  }

  async clear () {
    this.storage = {}
  }

  async entries () {
    return Object.entries(this.storage)
  }
}

export class Cache<KeyType = any, ReturnType = any> {
  private fetcher:FetcherFunction<KeyType, ReturnType>
  private options:CacheOptionsInternal<ReturnType>
  private storage:StorageEngine<Storage<ReturnType>>
  private active:{ [keys:string]: Promise<ReturnType> }
  private cleanuptimer:NodeJS.Timeout

  constructor (fetcher:FetcherFunction<KeyType, ReturnType>, options:CacheOptions<ReturnType> = {}) {
    this.fetcher = fetcher
    this.options = {
      freshseconds: options.freshseconds || 5 * 60,
      staleseconds: options.staleseconds || 10 * 60,
      cleanupseconds: options.cleanupseconds || 10,
      storageClass: options.storageClass || new MemoryStorage<Storage<ReturnType>>()
    }
    this.storage = this.options.storageClass
    this.active = {}
    this.cleanuptimer = setTimeout(() => this.schedulenextcleanup(), this.options.cleanupseconds * 1000)
  }

  async get (key:KeyType) {
    return this.fetch(key)
  }

  async set (key:KeyType, data:ReturnType) {
    const keystr = tostr(key)
    await this.storage.set(keystr, { fetched: new Date(), data })
  }

  async fetch (key:KeyType) {
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

  async invalidate (key:KeyType|string) {
    if (!key) {
      await this.storage.clear()
      return
    }
    const keystr = tostr(key)
    await this.storage.delete(keystr)
  }

  async refresh (key:KeyType) {
    const keystr = tostr(key)
    if (this.active[keystr]) return this.active[keystr]
    this.active[keystr] = this.fetcher(key)
    try {
      const data = await this.active[keystr]
      await this.storage.set(keystr, { fetched: new Date(), data })
      return data
    } finally {
      delete this.active[keystr]
    }
  }

  async destroy() {
    clearTimeout(this.cleanuptimer)
    await this.storage.clear()
  }

  private fresh (stored:Storage<ReturnType>) {
    return newerThan(stored.fetched, this.options.freshseconds)
  }

  private valid (stored:Storage<ReturnType>) {
    return newerThan(stored.fetched, this.options.staleseconds)
  }

  private async schedulenextcleanup () {
    for (const [key, stored] of await this.storage.entries()) {
      if (!this.valid(stored)) await this.invalidate(key)
    }
    this.cleanuptimer = setTimeout(() => this.schedulenextcleanup(), this.options.cleanupseconds * 1000)
  }
}
