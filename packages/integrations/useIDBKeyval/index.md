---
category: '@Integrations'
---

# useIDBKeyval

Reactive [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) store — React port of
VueUse's [`useIDBKeyval`](https://vueuse.org/integrations/useIDBKeyval/). Wrapper for
[`idb-keyval`](https://www.npmjs.com/package/idb-keyval).

**Mapping:** upstream returns `{ data, isFinished, isSupported, set }`; the React port returns the
state-like tuple `[data, setData, controls]` (§2B family, precedent `useStorage` → `[value, setValue]`,
`useStateWithControl` → `[value, setValue, controls]`). `data` is `T | null` where `null` means the key
was removed; `setData(null)` deletes the key with `del`. `isFinished` / `isSupported` move into the
third slot as plain booleans (upstream: `ShallowRef` / `ComputedRef`).

**No deep watcher (React deviation):** upstream writes on _any_ mutation of `data.value`
(`watchPausable(data, write, { deep: true })`), so `data.value.count++` persists by itself. React state
has no deep observation, so writes happen **explicitly through `setData`** — that is the React contract.
Mutating an object held in `data` in place does _not_ persist; pass a new value to `setData` instead.
The `deep` / `shallow` options are accepted for upstream parity and have no effect.

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

`initialValue` accepts a plain value or a React ref (`RefOrValue`); it is resolved once at mount with
`toValue` from `@reaxuse/shared`.

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

## Type Declarations

```ts
export interface UseIDBKeyvalSerializer<T> {
  read: (raw: unknown) => T
  write: (value: T) => unknown
}

export interface UseIDBOptions<T> {
  window?: Window
  onError?: (error: unknown) => void
  writeDefaults?: boolean
  serializer?: UseIDBKeyvalSerializer<T>
  listenToStorageChanges?: boolean
  /** accepted for parity only — no effect */
  deep?: boolean
  /** accepted for parity only — no effect */
  shallow?: boolean
}

export interface UseIDBKeyvalControls {
  isFinished: boolean
  isSupported: boolean
}

export type UseIDBKeyvalReturn<T> = [
  data: T | null,
  setData: (value: T | null) => Promise<void>,
  controls: UseIDBKeyvalControls,
]

export function useIDBKeyval<T>(
  key: IDBValidKey,
  initialValue: RefOrValue<T>,
  options?: UseIDBOptions<T>,
): UseIDBKeyvalReturn<T>
```

<DemoContainer name="useIDBKeyval" />

## Source

- VueUse upstream mapping — `source/vueuse/packages/integrations/useIDBKeyval/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useIDBKeyval/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useIDBKeyval/index.test.ts) and
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useIDBKeyval/index.browser.test.ts) (mirrored in `useIDBKeyval.test.tsx`),
  [`demo.client.vue`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useIDBKeyval/demo.client.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/integrations/src/useIDBKeyval.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/integrations/src/useIDBKeyval.ts), docs + demo co-located in `packages/integrations/useIDBKeyval/`

<Contributors name="useIDBKeyval" />
