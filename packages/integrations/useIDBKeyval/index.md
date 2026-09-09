---
category: '@Integrations'
---

# useIDBKeyval

Reactive [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) store

## Install

```bash
npm i idb-keyval@^6
```

## Usage

```tsx
import { useIDBKeyval } from '@reaxuse/integrations'

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

`initialValue` is the hook's **read-only value source** and takes a plain `T` (upstream:
`MaybeRefOrGetter<T>`). It is read **once at mount** (upstream's `toValue(initialValue)`); the hook owns
writes, so later `initialValue` prop changes are ignored. Because it is a plain value, an object-valued
`T` with a `value` key is stored as-is and a function-valued `T` is stored (not invoked).

## Cross-tab syncing

Changes are synced across browser tabs through the
[`BroadcastChannel` API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) on the
channel `vueuse-idb-${JSON.stringify(key)}`. Enabled by default, disable with `listenToStorageChanges`.
Incoming messages are applied through the serializer and never write back to the store; a `delete`
message resets `data` to the initial value.

```tsx
// disable cross-tab syncing
const [data] = useIDBKeyval('my-key', 'default', { listenToStorageChanges: false })
```
