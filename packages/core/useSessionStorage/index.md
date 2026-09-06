---
category: State
---

# useSessionStorage

Reactive [SessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) —
React port of VueUse's [`useSessionStorage`](https://vueuse.org/core/useSessionStorage/).

**Mapping:** upstream is a thin wrapper over `useStorage` bound to `window.sessionStorage`. Since the
reaxuse `useStorage` port is not yet available (tracked separately in issue #215), this hook is
**self-contained**: it mirrors upstream's `useStorage` semantics directly against `sessionStorage` —
type-guessed serializers (strings stay raw, booleans/numbers via `String()`, objects via JSON,
`Map`/`Set` via JSON entries, `Date` via ISO string), write-defaults, `mergeDefaults`, and
same-document sync through synthetic `storage` events. Once `useStorage` lands, this hook can be
refactored into the same thin wrapper.

**React divergences:**

- the Vue `RemovableRef` return becomes a `useState`-backed tuple `[value, setValue]`; the setter also
  accepts a function updater. `setValue(null)` removes the entry from storage — the state then falls
  back to the initial value, mirroring upstream where the self storage-event echo restores `rawInit`;
- storage is never touched during render: the first read happens in the mount effect, so SSR renders
  the initial value and the stored value replaces it after hydration;
- `key` is a plain React string that can change between renders — a key change re-reads the new key
  (upstream takes a reactive `MaybeRefOrGetter` key). Writes always go to the key of the current
  render, and when `writeDefaults` is on, a new key with no stored value is seeded with the initial
  value;
- Vue reactivity options have no React equivalent and are omitted: `flush`/`deep`/`eventFilter`
  (writes happen synchronously inside `setValue`), `shallow` (React state is replaced wholesale) and
  `initOnMounted` (effectively always on — the first read happens in the mount effect). Upstream's
  `StorageSerializers` export stays internal here for the same reason — a custom `serializer` option
  is supported.

## Usage

```tsx
import { useSessionStorage } from '@reaxuse/core'

const [state, setState] = useSessionStorage('my-store', { hello: 'hi', greeting: 'Hello' })
const [flag, setFlag] = useSessionStorage('my-flag', true)

setState(null) // delete data from storage
```

<DemoContainer name="UseSessionStorage" />

## Type Declarations

```ts
export interface Serializer<T> {
  read: (raw: string) => T
  write: (value: T) => string
}

export interface UseSessionStorageOptions<T> {
  /**
   * Specify a custom `window` instance, e.g. working with iframes or in
   * testing environments.
   */
  window?: Window
  /**
   * Listen to `storage` events on `window` to pick up same-document writes
   * from other hook instances sharing the same key.
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
   * Custom data serialization.
   */
  serializer?: Serializer<T>
  /**
   * On error callback.
   *
   * @default (error) => console.error(error)
   */
  onError?: (error: unknown) => void
}

export type UseSessionStorageReturn<T> = [
  value: T | null,
  setValue: Dispatch<SetStateAction<T | null>>,
]

export function useSessionStorage(key: string, initialValue: string, options?: UseSessionStorageOptions<string>): UseSessionStorageReturn<string>
export function useSessionStorage(key: string, initialValue: boolean, options?: UseSessionStorageOptions<boolean>): UseSessionStorageReturn<boolean>
export function useSessionStorage(key: string, initialValue: number, options?: UseSessionStorageOptions<number>): UseSessionStorageReturn<number>
export function useSessionStorage<T>(key: string, initialValue: T | (() => T), options?: UseSessionStorageOptions<T>): UseSessionStorageReturn<T>
export function useSessionStorage<T = unknown>(key: string, initialValue: null, options?: UseSessionStorageOptions<T>): UseSessionStorageReturn<T>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useSessionStorage/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useSessionStorage/index.ts) (implementation — delegates to `useStorage` with `window.sessionStorage`)
- upstream has no dedicated test or demo for `useSessionStorage` (its docs defer to `useStorage`),
  so behavior is mirrored from `useStorage`:
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useStorage/index.browser.test.ts) (mirrored here in `useSessionStorage.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useStorage/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useSessionStorage.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useSessionStorage.ts), docs + demo co-located in `packages/core/useSessionStorage/`

<Contributors name="useSessionStorage" />
