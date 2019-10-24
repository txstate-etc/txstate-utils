# txstate-utils
Lightweight utility functions that can be used in a browser or in node.

## Cache
This is a cache that attempts to keep a cached response ready at all times. It caches like you might expect for up to `freshseconds`. If a cached entry is older than `freshseconds` but still within `validseconds`, the cached value is returned immediately, but a background task is initiated to freshen the cache entry for later. If older than `validseconds`, the promise hangs until a fresh value is obtained.
### Example Usage
```
import { Cache } from 'txstate-utils/cache'
const userCache = new Cache(id => User.findById(id))

function getUserWithCaching (id) {
  return userCache.get(id)
}
async function saveUser (userObj) {
  await userObj.save()
  userCache.invalidate(userObj.id) // invalidate cache after update
  userCache.refresh(userObj.id) // or go ahead and get it refreshed immediately
}
```
