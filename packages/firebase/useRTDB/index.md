---
category: '@Firebase'
---

# useRTDB

Reactive [Firebase Realtime Database](https://firebase.google.com/docs/database) binding. Making it straightforward to **always keep your local data in sync** with remotes databases.

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

Returns a `T | undefined` value that is automatically updated when the database value changes.

## Reusing Database References

You can reuse the db reference by passing `autoDispose: false`:

```tsx
const [todos] = useRTDB(ref(db, 'todos'), { autoDispose: false })
```

or use `createGlobalState` from the shared package

```ts
import { useRTDB } from '@reaxuse/firebase'
// store.ts
import { createGlobalState } from '@reaxuse/shared'
import { ref } from 'firebase/database'

export const useTodos = createGlobalState(
  () => useRTDB(ref(db, 'todos')),
)
```
