---
category: State
---

# useLocalStorage

Reactive [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) —
React port of VueUse's [`useLocalStorage`](https://vueuse.org/core/useLocalStorage/).

**Mapping:** like upstream, this hook is a **thin wrapper** over `useStorage` bound to
`window.localStorage` — it calls `useStorage(key, initialValue, window.localStorage, options)` and has
no logic of its own. All serialization (type-guessed `StorageSerializers` or a custom `serializer`),
`writeDefaults` / `mergeDefaults`, same-document sync through synthetic `storage` events and
`onError` handling live in the already-ported `useStorage`.

**React divergences** (inherited from `useStorage`):

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
  `initOnMounted` (effectively always on — the first read happens in the mount effect).

## Usage

```tsx
import { useLocalStorage } from '@reaxuse/core'

const [state, setState] = useLocalStorage('my-store', { hello: 'hi', greeting: 'Hello' })
const [flag, setFlag] = useLocalStorage('my-flag', true)

setState(null) // delete data from storage
```

<DemoContainer name="UseLocalStorage" />

## Type Declarations

```ts
export type UseStorageReturn<T> = [
  value: T | null,
  setValue: Dispatch<SetStateAction<T | null>>,
]

export function useLocalStorage(key: string, initialValue: string, options?: UseStorageOptions<string>): UseStorageReturn<string>
export function useLocalStorage(key: string, initialValue: boolean, options?: UseStorageOptions<boolean>): UseStorageReturn<boolean>
export function useLocalStorage(key: string, initialValue: number, options?: UseStorageOptions<number>): UseStorageReturn<number>
export function useLocalStorage<T>(key: string, initialValue: T | (() => T), options?: UseStorageOptions<T>): UseStorageReturn<T>
export function useLocalStorage<T = unknown>(key: string, initialValue: null, options?: UseStorageOptions<T>): UseStorageReturn<T>
```

Options (`UseStorageOptions<T>`) are inherited from `useStorage` — see
[`useStorage`](../useStorage/) for the full type declarations (`window`,
`listenToStorageChanges`, `writeDefaults`, `mergeDefaults`, `serializer`, `onError`).

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useLocalStorage/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useLocalStorage/index.ts) (implementation — delegates to `useStorage` with `window.localStorage`)
- upstream has no dedicated test or demo for `useLocalStorage` (its docs defer to `useStorage`),
  so behavior is mirrored from `useStorage`:
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useStorage/index.browser.test.ts) (mirrored here in `useLocalStorage.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useStorage/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useLocalStorage.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useLocalStorage.ts), docs + demo co-located in `packages/core/useLocalStorage/`

<Contributors name="useLocalStorage" />
