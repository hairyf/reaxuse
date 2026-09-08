---
category: State
---

# useAsyncState

Reactive async state. Will not block your component and will trigger changes once the promise is ready — React port of VueUse's [`useAsyncState`](https://vueuse.org/core/useAsyncState/).

**Mapping:** object-mirror hook — the members (`state`, `isReady`, `isLoading`, `error`) are live React state values (upstream: shallow refs read as `.value`), `execute(delay?, ...args)` re-runs the promise (waiting for `delay` ms first) and `executeImmediate(...args)` is shorthand for `execute(0, ...args)`. The first execution fires from a mount effect when `immediate` is `true` (upstream fires during setup); an execution counter guarantees an outdated execution can never mutate the state after a newer one has started.

## Usage

```tsx
import { useAsyncState } from '@reaxuse/core'

const { state, isReady, isLoading, error, execute } = useAsyncState(
  fetchTodo,
  { id: null },
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

<DemoContainer name="UseAsyncState" />

## Type Declarations

```ts
export interface UseAsyncStateOptions<Shallow extends boolean = true, D = any> {
  /**
   * Delay for the first execution of the promise when "immediate" is true. In milliseconds.
   *
   * @default 0
   */
  delay?: number
  /**
   * Execute the promise right after the function is invoked.
   * Will apply the delay if any.
   *
   * When set to false, you will need to execute it manually.
   *
   * @default true
   */
  immediate?: boolean
  /**
   * Callback when error is caught.
   */
  onError?: (e: unknown) => void
  /**
   * Callback when success is caught.
   */
  onSuccess?: (data: D) => void
  /**
   * Sets the state to initialState before executing the promise.
   *
   * @default true
   */
  resetOnExecute?: boolean
  /**
   * Use shallowRef.
   *
   * @default true
   */
  shallow?: Shallow
  /**
   * An error is thrown when executing the execute function.
   *
   * @default false
   */
  throwError?: boolean
}

export interface UseAsyncStateReturnBase<Data, Params extends any[], Shallow extends boolean> {
  state: Data
  isReady: boolean
  isLoading: boolean
  error: unknown
  execute: (delay?: number, ...args: Params) => Promise<Data | undefined>
  executeImmediate: (...args: Params) => Promise<Data | undefined>
}

export type UseAsyncStateReturn<Data, Params extends any[], Shallow extends boolean>
  = UseAsyncStateReturnBase<Data, Params, Shallow>
    & PromiseLike<UseAsyncStateReturnBase<Data, Params, Shallow>>

export function useAsyncState<Data, Params extends any[] = any[], Shallow extends boolean = true>(
  promise: Promise<Data> | ((...args: Params) => Promise<Data>),
  initialState: RefOrValue<Data>,
  options?: UseAsyncStateOptions<Shallow, Data>,
): UseAsyncStateReturn<Data, Params, Shallow>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useAsyncState/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useAsyncState/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useAsyncState/index.test.ts) (mirrored in `useAsyncState.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useAsyncState/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useAsyncState.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useAsyncState.ts), docs + demo co-located in `packages/core/useAsyncState/`

<Contributors name="useAsyncState" />
