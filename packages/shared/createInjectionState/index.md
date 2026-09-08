---
category: State
---

# createInjectionState

Create a state that can be injected into descendant components — React port of VueUse's [`createInjectionState`](https://vueuse.org/shared/createInjectionState/).

**Mapping:** Vue's `provide` / `inject` pair becomes a **React Context** owned by the factory:

| VueUse                                               | reaxuse                                                                                            |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `useProvidingState(...args)` called inside `setup()` | `<CounterStoreProvider {...props}>` — a component rendered in the tree                             |
| `useInjectedState()`                                 | `useInjectedState()` — a hook reading the nearest provider with `useContext`                       |
| `provideLocal(key, state)`                           | `<Context.Provider value={state}>`                                                                 |
| `injectLocal(key, defaultValue)`                     | `createContext(defaultValue)` + `useContext(Context)`                                              |
| `options.injectionKey`                               | **dropped** — React Context is keyed by object identity, so the factory's own `Context` is the key |
| variadic factory arguments                           | a single props object (`children` is reserved by the provider)                                     |

The factory runs during the provider's render, so any hooks it calls follow the Rules of Hooks. The provider is not optional: React cannot consume a value provided by the same component that provides it.

## Usage

```tsx
import { createInjectionState } from '@reaxuse/shared'
import { useState } from 'react'

const [CounterStoreProvider, useCounterStore] = createInjectionState(
  ({ initialValue }: { initialValue: number }) => {
    const [count, setCount] = useState(initialValue)
    return { count, inc: () => setCount(current => current + 1) }
  },
)

function Counter() {
  const { count, inc } = useCounterStore()!
  return <button onClick={inc}>{count}</button>
}

function App() {
  return (
    <CounterStoreProvider initialValue={0}>
      <Counter />
    </CounterStoreProvider>
  )
}
```

A `defaultValue` makes the injected value non-optional and is returned when no provider is rendered above the consumer:

```tsx
const [, useCounterStore] = createInjectionState(
  ({ initialValue }: { initialValue: number }) => initialValue,
  { defaultValue: 0 },
)

function Counter() {
  const count = useCounterStore() // number — 0 when there is no provider
  return <span>{count}</span>
}
```

<DemoContainer name="CreateInjectionState" />

## Type Declarations

```ts
export interface CreateInjectionStateOptions<Return> {
  defaultValue?: Return
}

export type CreateInjectionStateProvider<Props extends object, ProvideReturn = ReactNode> = (props: Props & { children?: ReactNode }) => ProvideReturn

export type CreateInjectionStateReturn<Props extends object, ProvideReturn, InjectReturn> = Readonly<[
  /** Render this component to create and provide the state to its descendants. */
  Provider: CreateInjectionStateProvider<Props, ProvideReturn>,
  /** Call this hook in a consumer component to inject the state. */
  useInjectedState: () => InjectReturn,
]>

export function createInjectionState<Props extends object, Return>(
  composable: (props: Props) => Return,
  options: { defaultValue: Return } & CreateInjectionStateOptions<Return>,
): CreateInjectionStateReturn<Props, ReactNode, Return>
export function createInjectionState<Props extends object, Return>(
  composable: (props: Props) => Return,
  options?: CreateInjectionStateOptions<Return>,
): CreateInjectionStateReturn<Props, ReactNode, Return | undefined>
```

## Notes on the ported tests

- **Kept:** "should work for simple nested component" (provider in the parent, consumer in the child) and "should have useInjectedState return default value when not providing state".
- **Added:** injecting `undefined` without a provider and without `defaultValue`; an inner provider overriding an outer one for its subtree; consumer re-render on provided-state change; the factory receiving exactly the provider props (without `children`) and never running before the provider renders; `displayName` derivation.
- **Removed (no React equivalent):** "should work for custom key" — `injectionKey` is dropped, Context identity replaces the key. "allow call useProvidingState and injectLocal in same component" — a component cannot inject a value it provides itself; there is no `provide` / `inject` API, so the case cannot be expressed.

## Source

- VueUse: [`packages/shared/createInjectionState/index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/createInjectionState/index.ts) (implementation) + [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/createInjectionState/index.test.ts) (mirrored tests)
- reaxuse: [`packages/shared/src/createInjectionState.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/createInjectionState.ts) · tests [`packages/shared/src/createInjectionState.test.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/createInjectionState.test.tsx) · demo [`packages/shared/createInjectionState/demo.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/createInjectionState/demo.tsx)

<Contributors name="createInjectionState" />
