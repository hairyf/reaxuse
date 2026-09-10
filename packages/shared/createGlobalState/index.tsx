import { useMemo, useSyncExternalStore } from 'react'

export type GlobalStateInitAction<State> = State | (() => State)
export type GlobalStateSetAction<State> = State | ((prev: State) => State)
export type GlobalStateSetter<State> = (update: GlobalStateSetAction<State>) => void

/**
 * Keep state in the global scope, reusable across React components — React
 * port of VueUse's `createGlobalState`, with the parameter following
 * react-use's `createGlobalState`.
 *
 * Map from @vueuse/shared `createGlobalState`
 * Mapping: upstream runs the factory inside a detached `effectScope(true)`
 * once and returns the reactive object, so every caller shares the same refs
 * and `computed`s. React has no `effectScope` and no reactive `ref`, so the
 * port keeps the state in a module-level external store (a per-factory closure
 * holding the value plus a `Set` of listeners) and every consumer reads it
 * through `useSyncExternalStore`. The store is never disposed or reset, so
 * state survives unmount exactly like upstream's detached scope.
 *
 * The parameter follows react-use `createGlobalState`: it is the **initial
 * state** — a plain value, or a zero-arg function computing it. It is resolved
 * exactly once, at `createGlobalState` call time (module scope), mirroring
 * react-use's `store.state = initialState instanceof Function ? initialState()
 * : initialState`; the initializer therefore never runs during a component
 * render, and the returned hook takes no arguments. This differs from upstream
 * VueUse, where the factory receives the arguments of the first hook call.
 *
 * Deviations from upstream:
 * - module-level external store instead of `effectScope(true)` — the scope's
 *   only job was keeping the state alive outside any component; a module-level
 *   closure does that without a scope, and `useSyncExternalStore` makes every
 *   consumer re-render on change.
 * - the returned hook yields the tuple `[state, setState]` instead of the
 *   factory's object of refs (`{ count, doubleCount, increment }`): §2B of the
 *   naming rules — a state-like writable hook returns `[value, setValue]`.
 *   Derive computed values inside the consumer from `state`, and expose
 *   actions through the factory's returned state or a plain function.
 * - the parameter is react-use's initial state (value or zero-arg initializer)
 *   instead of upstream's variadic factory (see above).
 *
 * The tuple is memoized on the snapshot, so its identity is stable across
 * renders for a given state (effect deps / memoized children keyed on the
 * tuple do not churn); `setState` is a single function shared by every
 * consumer, like react-use's `store.setState`.
 *
 * ```ts
 * const useGlobalState = createGlobalState(() => 0)
 *
 * function Counter() {
 *   const [count, setCount] = useGlobalState()
 *   return <button onClick={() => setCount(prev => prev + 1)}>{count}</button>
 * }
 * ```
 *
 * @see https://vueuse.org/createGlobalState
 * @see https://github.com/streamich/react-use/blob/master/src/factory/createGlobalState.ts
 * @param initialState The initial state — a plain value or a zero-arg function
 * computing it; resolved exactly once, at `createGlobalState` call time.
 */
export function createGlobalState<State = unknown>(
  initialState: GlobalStateInitAction<State>,
): () => [State, GlobalStateSetter<State>]
export function createGlobalState<State = undefined>(): () => [State, GlobalStateSetter<State>]
/* @__NO_SIDE_EFFECTS__ */
export function createGlobalState<State = undefined>(
  initialState?: GlobalStateInitAction<State>,
): () => [State, GlobalStateSetter<State>] {
  // resolved exactly once, at `createGlobalState` call time — like react-use's
  // `store.state = initialState instanceof Function ? initialState() : initialState`.
  // Eager module-scope resolution means the initializer never runs during a
  // component render, and a zero-arg initializer runs exactly once even when
  // it returns `undefined`.
  let state = (typeof initialState === 'function' ? (initialState as () => State)() : initialState) as State

  const listeners = new Set<() => void>()

  // created once per `createGlobalState` call, so it is stable for every
  // consumer and every render — safe to hand straight to `useSyncExternalStore`
  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  const getSnapshot = (): State => state

  // a single setter shared by every consumer (react-use returns
  // `store.setState`): assigns then notifies every subscriber, never resets
  const setState: GlobalStateSetter<State> = (update) => {
    state = typeof update === 'function'
      ? (update as (prev: State) => State)(state)
      : update

    for (const listener of listeners)
      listener()
  }

  return function useGlobalState(): [State, GlobalStateSetter<State>] {
    const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

    return useMemo(
      () => [snapshot, setState] as [State, GlobalStateSetter<State>],
      [snapshot, setState],
    )
  }
}
