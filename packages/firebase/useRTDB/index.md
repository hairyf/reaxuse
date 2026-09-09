---
category: '@Firebase'
---

# useRTDB

Reactive [Firebase Realtime Database](https://firebase.google.com/docs/database) binding

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

Be aware that `autoDispose: false` means the subscription **outlives the component**: upstream parity is preserved (the caller gets no `off` handle and must live with the leak), so this option is discouraged. For shared state, prefer a module-level singleton, React context, or [`createGlobalState`](/shared/createGlobalState/) to own the subscription outside a component.
