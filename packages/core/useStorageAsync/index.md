---
category: State
---

# useStorageAsync

Reactive Storage with async support — React port of VueUse's
[`useStorageAsync`](https://vueuse.org/core/useStorageAsync/).

**Mapping:** like [`useStorage`](./useStorage), but the backend is an async
`StorageLikeAsync` — `getItem`/`setItem`/`removeItem` may each return a
promise (IndexedDB, remote key-value stores, async wrappers around
`localStorage`, …). The stored value is loaded after mount, so the value
starts as the initial default and is replaced once the async storage is ready.
Serializer guessing (`StorageSerializers`), `writeDefaults`, `mergeDefaults`,
a (possibly async) custom `serializer`, `onError` and `listenToStorageChanges`
all mirror upstream.

**React divergences:**

- upstream returns a `RemovableRef<T> & Promise<RemovableRef<T>>` — a ref you
  can `await`. The React port returns a `useState`-backed tuple
  `[value, setValue]` instead (the setter also accepts a function updater),
  so there is no thenable to await: the value updates itself when the async
  read settles, and the `onReady` option fires at that point — equivalent to
  awaiting upstream's returned promise;
- `setValue(null)` removes the entry from storage and leaves the state at
  `null` (mirroring upstream's removal watch; unlike the sync `useStorage`
  port there is no self storage-event echo that would restore the initial
  value);
- async writes are serialized through an internal promise queue so they commit
  in call order — upstream's pre-flush `watch` batches synchronous changes
  into one write, the queue keeps ordering deterministic in React;
- storage is never touched during render: the first read happens in the mount
  effect, so SSR renders the initial value and the stored value replaces it
  after hydration. When no storage is available the hook degrades to in-memory
  state, reading `window.localStorage` directly instead of upstream's
  `getSSRHandler('getDefaultStorageAsync')` indirection;
- `key` is a plain React string that can change between renders — a key change
  re-reads the new key. Writes always go to the key of the current render, and
  when `writeDefaults` is on, a new key with no stored value is seeded with
  the initial value;
- real `storage` events are listened to when `listenToStorageChanges` is on
  (mirroring upstream). Unlike the sync `useStorage` port, no same-document
  synthetic events are dispatched — upstream's async variant writes through
  its watch without echoing;
- Vue reactivity options have no React equivalent and are omitted:
  `flush`/`deep`/`eventFilter` (writes are queued per `setValue` call) and
  `shallow` (React state is replaced wholesale).

## Usage

The basic usage refers to [`useStorage`](./useStorage) — the only difference
is the storage backend may be asynchronous.

```tsx
import { useStorageAsync } from '@reaxuse/core'

const [accessToken, setAccessToken] = useStorageAsync('access.token', '', SomeAsyncStorage)

// accessToken may be empty before the async storage is ready
console.log(accessToken) // ""
```

## Wait First Loaded

When the user enters your app, `useStorageAsync()` starts loading the value
from an async storage, so you may get the default initial value instead of the
real stored value at the very beginning.

```tsx
import { useStorageAsync } from '@reaxuse/core'

const [accessToken, setAccessToken] = useStorageAsync('access.token', '', SomeAsyncStorage)

// accessToken may be empty before the async storage is ready
console.log(accessToken) // ""

setTimeout(() => {
  // After some time, the async storage is ready
  console.log(accessToken) // "the real value stored in storage"
}, 500)
```

Upstream lets you wait for the storage to be prepared by `await`-ing the
returned ref. In React the tuple cannot be awaited; instead the `onReady`
callback fires once the first value has been loaded:

```tsx
const [accessToken, setAccessToken] = useStorageAsync('access.token', '', SomeAsyncStorage, {
  onReady(value) {
    // accessToken has loaded — safe to mount the app now
  },
})
```

<DemoContainer name="UseStorageAsync" />

## Type Declarations

```ts
type Awaitable<T> = T | Promise<T>

export interface SerializerAsync<T> {
  read: (raw: string) => Awaitable<T>
  write: (value: T) => Awaitable<string>
}

export interface StorageLikeAsync {
  getItem: (key: string) => Awaitable<string | null>
  setItem: (key: string, value: string) => Awaitable<void>
  removeItem: (key: string) => Awaitable<void>
}

export interface UseStorageAsyncOptions<T> extends Omit<UseStorageOptions<T>, 'serializer'> {
  /**
   * Custom data serialization — same as `useStorage`, but the serializer may
   * be asynchronous.
   */
  serializer?: SerializerAsync<T>
  /**
   * On first value loaded hook.
   */
  onReady?: (value: T) => void
}

export type UseStorageAsyncReturn<T> = [
  value: T | null,
  setValue: Dispatch<SetStateAction<T | null>>,
]

export function useStorageAsync(key: string, initialValue: string, storage?: StorageLikeAsync, options?: UseStorageAsyncOptions<string>): UseStorageAsyncReturn<string>
export function useStorageAsync(key: string, initialValue: boolean, storage?: StorageLikeAsync, options?: UseStorageAsyncOptions<boolean>): UseStorageAsyncReturn<boolean>
export function useStorageAsync(key: string, initialValue: number, storage?: StorageLikeAsync, options?: UseStorageAsyncOptions<number>): UseStorageAsyncReturn<number>
export function useStorageAsync<T>(key: string, initialValue: T | (() => T), storage?: StorageLikeAsync, options?: UseStorageAsyncOptions<T>): UseStorageAsyncReturn<T>
export function useStorageAsync<T = unknown>(key: string, initialValue: null, storage?: StorageLikeAsync, options?: UseStorageAsyncOptions<T>): UseStorageAsyncReturn<T>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useStorageAsync/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useStorageAsync/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useStorageAsync/index.browser.test.ts) (mirrored here in `useStorageAsync.test.tsx`)
- reaxuse: [`packages/core/src/useStorageAsync.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useStorageAsync.ts), docs + demo co-located in `packages/core/useStorageAsync/`

<Contributors name="useStorageAsync" />
