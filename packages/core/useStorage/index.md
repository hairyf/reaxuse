---
category: State
---

# useStorage

Reactive [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)/[SessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) —
React port of VueUse's [`useStorage`](https://vueuse.org/core/useStorage/).

**Mapping:** the Vue `RemovableRef` return becomes a `useState`-backed tuple `[value, setValue]` (the
setter also accepts a function updater). The value is persisted under `key`, re-read on mount and key
change, and kept in sync across tabs and across hook instances sharing the same key — serializer
guessing from the default's type (`StorageSerializers`), `writeDefaults`, `mergeDefaults`, a custom
`serializer`, an `onError` handler and a custom `StorageLike` backend all mirror upstream.

**React divergences:**

- `setValue(null)` removes the entry from storage — the state then falls back to the initial value,
  mirroring upstream where the self storage-event echo restores `rawInit`;
- `key` and `defaults` are plain React values (upstream takes `MaybeRefOrGetter`); changing `key`
  between renders re-reads the new key, and writes always go to the key of the current render. A
  function `defaults` is a lazy initializer (React `useState` convention, like upstream's getter
  form) and is resolved once at mount;
- storage is never touched during render: the first read happens in the mount effect, so SSR renders
  the initial value and the stored value replaces it after hydration. When no storage is available
  the hook degrades to in-memory state without touching storage (upstream's early return), reading
  `window.localStorage` directly instead of going through upstream's `getSSRHandler` indirection;
- real `storage` events only fire across documents, so same-document sync re-dispatches a synthetic
  event on `window` — a real `StorageEvent` for `Storage` backends, `customStorageEventName` for
  custom `StorageLike` ones (mirroring upstream);
- Vue reactivity options have no React equivalent and are omitted: `flush`/`deep`/`eventFilter`
  (writes happen synchronously inside `setValue`), `shallow` (React state is replaced wholesale) and
  `initOnMounted` (effectively always on — the first read happens in the mount effect). The
  `Serializer` interface also stays internal here so the re-export surface stays clash-free with
  `useSessionStorage` (#207, PR #361) until that hook is refactored into the thin wrapper over this
  one, as its refactor note promises.

## Usage

```tsx
import { useStorage } from '@reaxuse/core'

const [state, setState] = useStorage('my-store', { hello: 'hi', greeting: 'Hello' })
const [flag, setFlag] = useStorage('my-flag', true)
const [id, setId] = useStorage('my-id', 'some-string-id', sessionStorage)

setState(null) // delete data from storage
```

<DemoContainer name="UseStorage" />

## Type Declarations

```ts
export interface StorageLike {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

export interface StorageEventLike {
  storageArea: StorageLike | null
  key: StorageEvent['key']
  oldValue: StorageEvent['oldValue']
  newValue: StorageEvent['newValue']
}

export const customStorageEventName = 'reaxuse-storage'

interface Serializer<T> {
  read: (raw: string) => T
  write: (value: T) => string
}

export const StorageSerializers: Record<'boolean' | 'object' | 'number' | 'any' | 'string' | 'map' | 'set' | 'date', Serializer<any>>

export interface UseStorageOptions<T> {
  /**
   * Specify a custom `window` instance, e.g. working with iframes or in
   * testing environments.
   */
  window?: Window
  /**
   * Listen to storage changes — useful for multiple tabs applications and
   * for hook instances sharing the same key within the same document.
   *
   * @default true
   */
  listenToStorageChanges?: boolean
  /**
   * Write the default value to the storage when it does not exist.
   *
   * @default true
   */
  writeDefaults?: boolean
  /**
   * Merge the default value with the value read from the storage.
   *
   * When setting it to `true`, it will perform a **shallow merge** for
   * objects. You can pass a function to perform a custom merge, for example:
   *
   * @default false
   */
  mergeDefaults?: boolean | ((storageValue: T, defaults: T) => T)
  /**
   * Custom data serialization. Defaults are selected per type from
   * `StorageSerializers`.
   */
  serializer?: Serializer<T>
  /**
   * On error callback.
   *
   * @default (error) => console.error(error)
   */
  onError?: (error: unknown) => void
}

export type UseStorageReturn<T> = [
  value: T | null,
  setValue: Dispatch<SetStateAction<T | null>>,
]

export function useStorage(key: string, defaults: string, storage?: StorageLike, options?: UseStorageOptions<string>): UseStorageReturn<string>
export function useStorage(key: string, defaults: boolean, storage?: StorageLike, options?: UseStorageOptions<boolean>): UseStorageReturn<boolean>
export function useStorage(key: string, defaults: number, storage?: StorageLike, options?: UseStorageOptions<number>): UseStorageReturn<number>
export function useStorage<T>(key: string, defaults: T | (() => T), storage?: StorageLike, options?: UseStorageOptions<T>): UseStorageReturn<T>
export function useStorage<T = unknown>(key: string, defaults: null, storage?: StorageLike, options?: UseStorageOptions<T>): UseStorageReturn<T>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useStorage/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useStorage/index.ts) (implementation),
  [`guess.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useStorage/guess.ts) (serializer type guessing, inlined here),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useStorage/index.browser.test.ts) (mirrored here in `useStorage.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useStorage/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useStorage.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useStorage.ts), docs + demo co-located in `packages/core/useStorage/`

<Contributors name="useStorage" />
