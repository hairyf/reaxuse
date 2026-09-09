---
category: State
---

# useAsyncState

Reactive async state. It will not block your component and triggers changes once the promise is ready.

`initialState` accepts the shared `State<Data>` sources: a value, lazy initializer, React ref-like object, controlled tuple, or `{ value, onChange }` pair.

## Usage

```tsx
import { useAsyncState } from '@reaxuse/core'

const initialState = { value: { id: null } }
const { state, isReady, isLoading, error, execute } = useAsyncState(
  fetchTodo,
  initialState,
)
```

### Return Values

| Property           | Description                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `state`            | The result of the async function                                                                                               |
| `isReady`          | `true` when the latest execution has resolved successfully. Reset to `false` on each execution and stays `false` if it rejects |
| `isLoading`        | `true` while the promise is pending                                                                                            |
| `error`            | The error if the promise was rejected                                                                                          |
| `execute`          | Re-execute the async function with optional delay                                                                              |
| `executeImmediate` | Re-execute immediately (shorthand for `execute(0)`)                                                                            |

### Awaiting the Result

The return value is thenable, so you can await it and destructure directly:

```tsx
const { state, isReady } = await useAsyncState(fetchData, null)
// `state` is now populated, `isReady` is true
```

### Manual Execution

Set `immediate: false` to prevent automatic execution on mount.

```tsx
import { useAsyncState } from '@reaxuse/core'

const { state, execute, executeImmediate } = useAsyncState(action, '', { immediate: false })

async function action() {
  await new Promise(resolve => setTimeout(resolve, 500))
  return 'done'
}

// trigger manually
executeImmediate()
execute(500) // delayed execution
```

### Options

```tsx
const { state } = useAsyncState(promise, initialState, {
  // Execute immediately on mount (default: true)
  immediate: true,
  // Delay before first execution in ms (default: 0)
  delay: 0,
  // Reset state to initial before each execution (default: true)
  resetOnExecute: true,
  // Throw errors instead of catching them (default: false)
  throwError: false,
  // Called when promise resolves
  onSuccess(data) {
    console.log('Success:', data)
  },
  // Called when promise rejects
  onError(error) {
    console.error('Error:', error)
  },
})
```
