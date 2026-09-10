import { useCallback, useMemo, useSyncExternalStore } from 'react'

export type GlobalStateSetter<State> = (update: State | ((prev: State) => State)) => void

/**
 * Keep state in the global scope, reusable across React components — React
 * port of VueUse's `createGlobalState`.
 *
 * Map from @vueuse/shared `createGlobalState`
 * Mapping: upstream runs the factory inside a detached `effectScope(true)`
 * once and returns the reactive object, so every caller shares the same refs
 * and `computed`s. React has no `effectScope` and no reactive `ref`, so the
 * port keeps the state in a module-level external store (a per-factory closure
 * holding the value plus a `Set` of listeners) and every consumer reads it
 * through `useSyncExternalStore`. The store is never disposed or reset, so
 * state survives unmount exactly like upstream's detached scope; the factory
 * still runs exactly once, with the arguments of the first hook call.
 *
 * Two deviations from upstream:
 * - module-level external store instead of `effectScope(true)` — the scope's
 *   only job was keeping the state alive outside any component; a module-level
 *   closure does that without a scope, and `useSyncExternalStore` makes every
 *   consumer re-render on change.
 * - the returned hook yields the tuple `[state, setState]` instead of the
 *   factory's object of refs (`{ count, doubleCount, increment }`): §2B of the
 *   naming rules — a state-like writable hook returns `[value, setValue]`.
 *   Derive computed values inside the consumer from `state`, and expose
 *   actions through the factory's returned state or a plain function.
 *
 * The factory runs on the first snapshot read, i.e. during the first render of
 * the first consumer (React's `useSyncExternalStore` has no pre-render setup
 * path — the first `getSnapshot` must already return the value). In
 * StrictMode / concurrent rendering a discarded render can therefore
 * initialize the module store before the first committed consumer mounts;
 * this is harmless because the store is module-wide and the factory still runs
 * exactly once. The tuple is memoized on the snapshot, so its identity is
 * stable across renders for a given state (effect deps / memoized children
 * keyed on the tuple do not churn).
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
 * @param stateFactory A factory function to create the state; invoked once, with the first call's args
 *
 * @__NO_SIDE_EFFECTS__
 */
export function createGlobalState<State, Args extends unknown[] = []>(
  stateFactory: (...args: Args) => State,
): (...args: Args) => [State, GlobalStateSetter<State>] {
  // module-wide store: the value plus every subscribed consumer
  let state: State | undefined
  let initialized = false
  // args of the first hook call — upstream passes them to the factory once
  let firstArgs: Args | undefined

  const listeners = new Set<() => void>()

  // created once per `createGlobalState` call, so it is stable for every
  // consumer and every render — safe to hand straight to `useSyncExternalStore`
  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  // lazily initialises on the first snapshot read; the factory never re-runs
  // (an explicit flag, not `state ??=`, so a factory returning `undefined`
  // still runs exactly once)
  const getSnapshot = (): State => {
    if (!initialized) {
      state = stateFactory(...(firstArgs as Args))
      initialized = true
    }
    return state as State
  }

  return function useGlobalState(...args: Args): [State, GlobalStateSetter<State>] {
    if (firstArgs === undefined)
      firstArgs = args

    const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

    // stable setter — assigns then notifies every subscriber, never resets
    const setState = useCallback<GlobalStateSetter<State>>((update) => {
      state = typeof update === 'function'
        ? (update as (prev: State) => State)(state as State)
        : update
      initialized = true

      for (const listener of listeners)
        listener()
    }, [])

    return useMemo(
      () => [snapshot, setState] as [State, GlobalStateSetter<State>],
      [snapshot, setState],
    )
  }
}
