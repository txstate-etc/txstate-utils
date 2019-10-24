import { sleep } from './util'

const newerThan = (dt:Date, seconds:number) => (new Date()).getTime() - dt.getTime() < seconds * 1000
const tostr = (key:any) => typeof key === 'string' ? key : JSON.stringify(key)

type FetcherFunction<KeyType, ReturnType> = (key?:KeyType) => ReturnType
interface CacheOptions {
  freshseconds?: number
  validseconds?: number
  cleanupseconds?: number
}
interface CacheOptionsInternal extends CacheOptions {
  freshseconds: number
  validseconds: number
  cleanupseconds: number
}
interface Storage<ReturnType> {
  data: ReturnType
  fetched: Date
}

export class Cache<KeyType, ReturnType> {
  private fetcher:FetcherFunction<KeyType, Promise<ReturnType>>
  private options:CacheOptionsInternal
  private storage:{ [keys:string]: Storage<ReturnType> }
  private active:{ [keys:string]: Promise<ReturnType> }

  constructor (fetcher:FetcherFunction<KeyType, Promise<ReturnType>>, options:CacheOptions = {}) {
    this.fetcher = fetcher
    this.options = {
      freshseconds: options.freshseconds || 5 * 60,
      validseconds: options.validseconds || 10 * 60,
      cleanupseconds: options.cleanupseconds || 10
    }
    this.storage = {}
    this.active = {}
    this.schedulenextcleanup()
  }

  async get (key?:KeyType) {
    return this.fetch(key)
  }

  async fetch (key?:KeyType) {
    const keystr = tostr(key)
    const stored = this.storage[keystr]
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

  invalidate (key:KeyType|string) {
    if (!key) {
      this.storage = {}
      return
    }
    const keystr = tostr(key)
    delete this.storage[keystr]
  }

  async refresh (key?:KeyType) {
    const keystr = tostr(key)
    if (this.active[keystr]) return this.active[keystr]
    this.active[keystr] = this.fetcher(key)
    try {
      const data = await this.active[keystr]
      this.storage[keystr] = { fetched: new Date(), data }
      return data
    } finally {
      delete this.active[keystr]
    }
  }

  private fresh (stored:Storage<ReturnType>) {
    return newerThan(stored.fetched, this.options.freshseconds)
  }

  private valid (stored:Storage<ReturnType>) {
    return newerThan(stored.fetched, this.options.validseconds)
  }

  private async schedulenextcleanup () {
    await sleep(this.options.cleanupseconds * 1000)
    for (const [key, stored] of Object.entries(this.storage)) {
      if (!this.valid(stored)) this.invalidate(key)
    }
    this.schedulenextcleanup()
  }
}
