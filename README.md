# txstate-utils
Lightweight utility functions that can be used in a browser or in node.

## Cache
### Why use this?
Other caches typically make the user wait when a cache entry has expired, which could be a very long time for some cached processes.

A typical solution to this problem is to create a cache powered by a background task that keeps all data fresh on an interval. This can be very expensive since it runs on a schedule instead of on-demand.

This cache avoids both problems by refreshing the cache in the background while returning a slightly expired ("stale") result. If the resource is requested frequently users will virtually never have to wait.

### Overview
Cache entries go through multiple states after being fetched: `fresh`, `stale`, and `expired`. A fresh entry can be returned immediately. A stale entry can be returned immediately, but a new value should be fetched so that the next request might be fresh. An expired entry is not useful and the user must wait for a new value to be fetched.

Note that setting freshseconds === staleseconds renders this into a standard on-demand cache.

### Example Usage
```javascript
import { Cache } from 'txstate-utils/cache'
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
