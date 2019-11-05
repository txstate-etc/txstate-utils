# txstate-utils
Lightweight utility functions that can be used in a browser or in node.

## Cache
This cache attempts to hide long processes from users as much as possible, while retaining on-demand characteristics. Cache entries go through multiple states after being fetched: `fresh`, `stale`, and `expired`. A fresh entry can be returned immediately. A stale entry can be returned immediately, but a new value should be fetched so that the next request might be fresh. An expired entry is not useful and the user must wait for a new value to be fetched.

Note that setting freshseconds === staleseconds renders this into a standard on-demand cache.

### Example Usage
```
import { Cache } from 'txstate-utils/cache'
const userCache = new Cache(id => User.findById(id))

function getUserWithCaching (id) {
  return userCache.get(id)
}
async function saveUser (userObj) {
  await userObj.save()
  await userCache.invalidate(userObj.id) // invalidate cache after update
  await userCache.refresh(userObj.id) // or go ahead and get it refreshed immediately
}
### Options
```
{
  freshseconds: period cache entry is fresh (default 5 minutes)
  staleseconds: period cache entry is acceptable but needs background refreshed (default 10 minutes)
  cleanupseconds: frequency to delete expired entries for garbage collection (default 10 seconds),
  storageClass: an instance of a class that meets storage engine interface (default simple Object cache)
}
```
This is the storage engine interface:
```
interface StorageEngine {
  get (keystr:string): Promise<any>
  set (keystr:string, data:any): Promise<void>
  delete (keystr:string): Promise<void>
  clear (): Promise<void>
  entries (): Promise<[string, any][]>
}
```
