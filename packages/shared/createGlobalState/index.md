---
category: State
---

# createGlobalState

Keep state in the global scope, reusable across React components — React port of VueUse's [`createGlobalState`](https://vueuse.org/shared/createGlobalState/).

**Mapping:** upstream runs the factory once inside a detached `effectScope(true)` and returns the reactive object, so every caller shares the same refs and `computed`s. React has no `effectScope` and no reactive `ref`, so the port keeps the state in a module-level external store (a per-factory closure holding the value plus a `Set` of listeners) that every consumer reads through `useSyncExternalStore`. The store is never disposed or reset, so state survives unmount exactly like upstream's detached scope; the factory still runs exactly once, with the arguments of the first hook call.

Two deviations from upstream:

- module-level external store instead of `effectScope(true)` — the scope's only job was keeping the state alive outside any component; a module-level closure does that without a scope, and `useSyncExternalStore` makes every consumer re-render on change.
- the returned hook yields the tuple `[state, setState]` instead of the factory's object of refs — derive computed values inside the consumer from `state`, and expose actions as plain functions or as part of the state.

## Usage

```ts
// store.ts
import { createGlobalState } from '@reaxuse/shared'

export const useGlobalState = createGlobalState(() => ({ count: 0 }))
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

A bigger example — derived values and actions live in the consumer, the factory only creates the shared state:

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

<DemoContainer name="CreateGlobalState" />

## Type Declarations

```ts
export type GlobalStateSetter<State> = (update: State | ((prev: State) => State)) => void

export function createGlobalState<State, Args extends unknown[] = []>(
  stateFactory: (...args: Args) => State,
): (...args: Args) => [State, GlobalStateSetter<State>]
```

## Source

- VueUse: [`packages/shared/createGlobalState/index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/createGlobalState/index.ts) (implementation) + [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/createGlobalState/index.test.ts) (mirrored tests)
- reaxuse: [`packages/shared/src/createGlobalState.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/createGlobalState.ts) · tests [`packages/shared/src/createGlobalState.test.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/createGlobalState.test.tsx) · demo [`packages/shared/createGlobalState/demo.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/createGlobalState/demo.tsx)

<Contributors name="createGlobalState" />
