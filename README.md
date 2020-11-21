# txstate-utils
Lightweight utility functions that can be used in a browser or in node.

## Cache
### Why use this?
Typical caches make users wait when a cache entry has expired, which could be a very long time for some cached processes, and could be a lot of users all waiting. This leads to consistent spikes of bad response times every X seconds or minutes if you graph your response times.

One common solution to this problem is to fill your cache automatically on an interval. However, this requires extra code and does extra work since it runs on a schedule instead of on-demand.

This cache works on-demand by refreshing entries in the background while immediately returning a slightly expired ("stale") result. If the resource is requested frequently, users will never have to wait and the spikes on your graph will vanish.

Additionally, typical caches that store objects lead most often to simple logic like
```javascript
let obj = await cache.search(key)
if (typeof obj === 'undefined') obj = await goGetActualValue(key)
```
This is easy enough, but when you think about concurrent access, you realize that when a cache entry expires, any requests that come in before the cache is refilled (maybe it takes several seconds) will all call `goGetActualValue` instead of just the first one after expiration. This Cache class properly coalesces requests to prevent this issue, in addition to removing the need to write out that cache miss/cache hit boilerplate.

### Overview
Cache entries go through multiple states after being fetched: `fresh`, `stale`, and `expired`. A fresh entry can be returned immediately. A stale entry can be returned immediately, but a new value should be fetched so that the next request might be fresh. An expired entry is not useful and the user must wait for a new value to be fetched.

Note that setting freshseconds === staleseconds renders this into a standard on-demand cache.

### Example Usage
```javascript
import { Cache } from 'txstate-utils'
const userCache = new Cache(id => User.findById(id))

function getUserWithCaching (id) {
  return userCache.get(id)
}
async function saveUser (userObj) {
  await userObj.save()
  await userCache.invalidate(userObj.id) // invalidate cache after update
  await userCache.refresh(userObj.id) // or go ahead and get it refreshed immediately
  // if you are confident userObj is the correct object to store in cache, you may set it
  // directly (a little risky as it avoids your fetching function and any logic it may be applying)
  await userCache.set(userObj.id, userObj)
}
```
### Options
```javascript
{
  freshseconds: period cache entry is fresh (default 5 minutes)
  staleseconds: period cache entry is stale (default 10 minutes)
  storageClass: an instance of a class that adheres to the storage engine
    interface (default is a simple in-memory cache)
  onRefresh: a callback that will be called any time a cache value is updated
    you could use this to implement a synchronization scheme between workers or instances
    any errors will be caught and logged without disrupting requests; if you have a custom
    logging scheme that does not use console.error, you should catch errors yourself
}
```
This is the storage engine interface:
```javascript
interface StorageEngine {
  get (keystr:string): Promise<any>
  set (keystr:string, data:any): Promise<void>
  del (keystr:string): Promise<void>
  clear (): Promise<void>
}
```
`storageClass` will also accept an instance of [lru-cache](https://www.npmjs.com/package/lru-cache) or [memcached](https://www.npmjs.com/package/memcached)

If you wrap/implement your own storage engine, be aware that it is responsible for cleaning up expired cache entries or otherwise reducing its footprint. The default simple storage engine keeps everything in memory until expiration (it will efficiently garbage collect expired entries). LRU Cache and Memcache both have customizable storage limits. You're free to delete cache entries as aggressively as you see fit; a cache miss will not be harmful other than making the user wait for a result.

### Advanced Usage
#### Compound Keys
Keys are automatically stringified with a stable JSON stringify, so you can use any JSON object structure as your cache key.
```javascript
const personCache = new Cache(async ({ lastname, firstname }) => {
  return await getPersonByName(lastname, firstname)
})
const person = await personCache.get({ lastname: 'Smith', firstname: 'John' })
```
Note that you cannot use extra parameters on `get` and your fetcher function, as the second parameter is reserved for fetch helpers (see above).
#### Fetch Helpers
If your fetcher function requires some sort of context-sensitive helper to do its work (e.g. a request-scoped service), you may pass it in as a second parameter without affecting the lookup key:
```javascript
const myCache = new Cache(async (key, service) => {
  return await service.findByKey(key)
})
const result = await myCache.get(key, service)
```
#### Tuning Guidance
Tuning `freshseconds` and `staleseconds` properly requires a little bit of data or intuition about usage. Here is some guidance to help you navigate:
* `freshseconds`
  * should be long enough that at least a few requests on average would come in during this interval
  * should not be so long that the data would be significantly less useful by the end
    * keep in mind that `staleseconds` should be even longer
  * does not need to be longer than the average time to complete the task
    * a very short `freshseconds` can increase the quality of your cached data while still removing most of the workload `new cpu usage = uncached cpu usage / (requests per second * freshseconds)`
* `staleseconds`
  * should be short enough that the data still holds most of its value by the end of the period
  * should be short enough that you don't run out of memory for the cache
    * alternatively, use LRU or memcache to control memory usage
  * `staleseconds` - `freshseconds` should be longer than `average time between requests + average task completion time`
    * otherwise users will wait for responses and spikes will appear on your response time graph
