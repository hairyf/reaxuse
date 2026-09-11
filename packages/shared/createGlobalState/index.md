---
category: State
---

# createGlobalState

Keep state in the global scope, reusable across React components

## Usage

### Without Persistence (Store in Memory)

```ts
// store.ts
import { createGlobalState } from '@reause/shared'

export const useGlobalState = createGlobalState(() => ({ count: 0 }))
```

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

A bigger example:

```ts
// store.ts
import { createGlobalState } from '@reause/shared'

export const useGlobalState = createGlobalState(() => ({ count: 0 }))

export function useCounterActions() {
  const [, setState] = useGlobalState()

  return {
    increment: () => setState(prev => ({ count: prev.count + 1 })),
  }
}
```

```tsx
// component.tsx
import { useGlobalState } from './store'

function Counter() {
  const [state] = useGlobalState()
  const { increment } = useCounterActions()
  const doubleCount = state.count * 2

  return <button onClick={increment}>{doubleCount}</button>
}
```

### With Persistence

Store in `localStorage` with `useStorage`:

```ts
// store.ts
import { useStorage } from '@reause/core'
import { createGlobalState } from '@reause/shared'

export const useGlobalState = createGlobalState(
  () => useStorage('reause-local-storage', 'initialValue'),
)
```
