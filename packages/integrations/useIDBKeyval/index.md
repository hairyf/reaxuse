---
category: '@Integrations'
---

# useIDBKeyval

Wrapper for [`idb-keyval`](https://www.npmjs.com/package/idb-keyval).

## Install idb-keyval as a peer dependency

```bash
npm i idb-keyval@^6
```

## Usage

```tsx
import { useIDBKeyval } from '@reause/integrations'

// bind object
const [storedObject, setStoredObject, { isFinished }] = useIDBKeyval('my-idb-keyval-store', {
  hello: 'hi',
  greeting: 'Hello',
})

// update object — explicit write (no deep watcher)
setStoredObject({ ...storedObject, hello: 'hola' })

// bind boolean
const [flag] = useIDBKeyval('my-flag', true)

// bind number
const [count, setCount] = useIDBKeyval('my-count', 0)

// awaiting the IDB transaction
await setCount(10)
console.log('IDB transaction finished!')

// delete data from the idb store
await setStoredObject(null)
```

## Cross-tab syncing

Changes are automatically synced across browser tabs using the [`BroadcastChannel` API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel). This is enabled by default and can be disabled via the `listenToStorageChanges` option.

```tsx
// disable cross-tab syncing
const [data] = useIDBKeyval('my-key', 'default', { listenToStorageChanges: false })
```
