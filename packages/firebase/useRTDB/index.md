---
category: '@Firebase'
---

# useRTDB

Reactive [Firebase Realtime Database](https://firebase.google.com/docs/database) binding — React port of VueUse's [`useRTDB`](https://vueuse.org/useRTDB/). Making it straightforward to **always keep your local data in sync** with remote databases.

**Mapping:** upstream returns a writable `Ref<T | undefined>` → this port returns the `[data, setData]` tuple (`UseRTDBReturn<T>`). `data` starts `undefined` and receives `snapshot.val()` on every database change. `setData` writes **local state only** — it does not write to the Realtime Database (upstream's ref is equally local); persist with `set` / `update` / `push` from `firebase/database`. The `onValue` listener is registered in a `useEffect` keyed on `docRef` and `autoDispose`, so a new `docRef` identity re-subscribes and unsubscribes the previous listener (upstream subscribes once per `setup()`), and the cleanup unsubscribes only when `autoDispose` is `true` (upstream parity). The latest `errorHandler` is read from a ref, so passing an inline handler does not re-subscribe.

## Usage

```tsx
import { useRTDB } from '@reaxuse/firebase'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref } from 'firebase/database'

const app = initializeApp({ /* config */ })
const db = getDatabase(app)

const [todos, setTodos] = useRTDB<Record<string, Todo>>(ref(db, 'todos'))
```

## Options

| Option         | Type                   | Default         | Description                                               |
| -------------- | ---------------------- | --------------- | --------------------------------------------------------- |
| `autoDispose`  | `boolean`              | `true`          | Automatically unsubscribe when the component is unmounted |
| `errorHandler` | `(err: Error) => void` | `console.error` | Custom error handler for database errors                  |

## Return Value

| Value     | Type                              | Description                                                                                                                    |
| --------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `data`    | `T \| undefined`                  | The latest `snapshot.val()`, updated whenever the database value changes; `undefined` until the first snapshot arrives.        |
| `setData` | `(value: T \| undefined) => void` | Updates `data` **locally only** — it never writes to the Realtime Database. Use the `firebase/database` write APIs to persist. |

## Reusing Database References

You can reuse the db reference by passing `autoDispose: false`:

```tsx
const [todos] = useRTDB(ref(db, 'todos'), { autoDispose: false })
```

Be aware that `autoDispose: false` means the subscription **outlives the component**: upstream parity is preserved (the caller gets no `off` handle and must live with the leak), so this option is discouraged. For shared state prefer a module-level singleton or React context that owns the subscription and unmounts it explicitly; upstream's `createGlobalState` recipe is not ported.

## Type Declarations

```ts
export interface UseRTDBOptions {
  errorHandler?: (err: Error) => void
  autoDispose?: boolean
}

export type UseRTDBReturn<T> = [data: T | undefined, setData: (value: T | undefined) => void]

export function useRTDB<T = any>(docRef: DatabaseReference, options?: UseRTDBOptions): UseRTDBReturn<T>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/firebase/useRTDB/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/firebase/useRTDB/index.ts) (implementation),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/firebase/useRTDB/index.md) (docs)
- reaxuse: [`packages/firebase/src/useRTDB.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/firebase/src/useRTDB.ts), docs + demo co-located in `packages/firebase/useRTDB/`

<Contributors name="useRTDB" />
