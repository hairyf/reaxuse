---
category: State
---

# createGlobalState

Keep state in the global scope, reusable across React components

## Usage

The argument is the **initial state** — a plain value, or a function computing it (resolved exactly once, at `createGlobalState` call time, so it can compute lazily). The returned hook takes no arguments:

```ts
// store.ts
import { createGlobalState } from '@reaxuse/shared'

export const useGlobalState = createGlobalState(() => ({ count: 0 }))
```

A plain initial value works too:

```ts
export const useGlobalState = createGlobalState({ count: 0 })
```

Every component calling `useGlobalState()` gets the same value, and a write from one of them updates all of them:

```tsx
// component.tsx
import { useGlobalState } from './store'

function Counter() {
  const [state, setState] = useGlobalState()

  return (
    <button onClick={() => setState(prev => ({ count: prev.count + 1 }))}>
      {state.count}
    </button>
  )
}
```

A bigger example — derived values and actions live in the consumer, the initializer only creates the shared state:

```ts
// store.ts
import { createGlobalState } from '@reaxuse/shared'

export const useGlobalState = createGlobalState(() => ({ count: 0 }))

export function useCounterActions() {
  const [, setState] = useGlobalState()

  return {
    increment: () => setState(prev => ({ count: prev.count + 1 })),
  }
}
```

```tsx
function Counter() {
  const [state] = useGlobalState()
  const { increment } = useCounterActions()
  const doubleCount = state.count * 2

  return <button onClick={increment}>{doubleCount}</button>
}
```
