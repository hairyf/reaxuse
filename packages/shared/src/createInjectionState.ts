import type { ReactNode } from 'react'
import { createContext, createElement, useContext } from 'react'

export interface CreateInjectionStateOptions<Return> {
  /**
   * Default value used by `useInjectedState` when no provider is rendered
   * above the consumer. Implemented natively through `createContext`.
   */
  defaultValue?: Return
}

export type CreateInjectionStateProvider<Props extends object, ProvideReturn = ReactNode> = (props: Props & { children?: ReactNode }) => ProvideReturn

export type CreateInjectionStateReturn<Props extends object, ProvideReturn, InjectReturn> = Readonly<[
  /**
   * Render this component to create and provide the state to its descendants.
   */
  Provider: CreateInjectionStateProvider<Props, ProvideReturn>,
  /**
   * Call this hook in a consumer component to inject the state.
   */
  useInjectedState: () => InjectReturn,
]>

/**
 * Create a state that can be injected into descendant components — React port
 * of VueUse's `createInjectionState`.
 *
 * Map from @vueuse/shared `createInjectionState`
 * Mapping: React has no provide/inject pair, so the providing side becomes a
 * component and the state travels through a React Context created by the
 * factory. Slot 0 of the returned tuple is `Provider` — render it (it may wrap
 * children) and the composable runs during its render, exactly once per
 * render, with the props passed to it. Slot 1 is `useInjectedState`, which
 * reads the nearest `Provider` above the calling component with `useContext`.
 * Because JSX can only pass a single props object, the factory receives one
 * object — upstream's `(initialValue: number) => ...` becomes
 * `({ initialValue }: { initialValue: number }) => ...`.
 *
 * The second type parameter (`ProvideReturn`) is upstream's
 * `useProvidingState` return slot, which in this port is the provider
 * component's render output (`ReactNode`).
 *
 * Deviations from upstream:
 * - The `injectionKey` option is dropped: React Context is keyed by object
 *   identity (the factory owns its `Context`), so there is no string/symbol
 *   key to configure. Two states from two different
 *   `createInjectionState` calls never collide.
 * - The providing side is a component (`Provider`) rather than a callable
 *   `useProvidingState`: React cannot provide during a hook call of the same
 *   component that consumes it.
 * - The factory takes a single props object instead of variadic arguments.
 * - `children` is a reserved prop: it is consumed by `Provider` for rendering
 *   and is not forwarded to the factory.
 *
 * @see https://vueuse.org/createInjectionState
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const [CounterStoreProvider, useCounterStore] = createInjectionState(
 *   ({ initialValue }: { initialValue: number }) => {
 *     const [count, setCount] = useState(initialValue)
 *     return { count, inc: () => setCount(c => c + 1) }
 *   },
 * )
 *
 * function Counter() {
 *   const { count, inc } = useCounterStore()!
 *   return <button onClick={inc}>{count}</button>
 * }
 *
 * <CounterStoreProvider initialValue={0}>
 *   <Counter />
 * </CounterStoreProvider>
 */
export function createInjectionState<Props extends object, Return>(
  composable: (props: Props) => Return,
  options: { defaultValue: Return } & CreateInjectionStateOptions<Return>,
): CreateInjectionStateReturn<Props, ReactNode, Return>
export function createInjectionState<Props extends object, Return>(
  composable: (props: Props) => Return,
  options?: CreateInjectionStateOptions<Return>,
): CreateInjectionStateReturn<Props, ReactNode, Return | undefined>
export function createInjectionState<Props extends object, Return>(
  composable: (props: Props) => Return,
  options?: CreateInjectionStateOptions<Return>,
): CreateInjectionStateReturn<Props, ReactNode, Return | undefined> {
  const Context = createContext<Return | undefined>(options?.defaultValue)

  const Provider = ((props: Props & { children?: ReactNode }) => {
    const { children, ...rest } = props
    // the composable runs during the provider's render, so any hooks it calls
    // follow the Rules of Hooks
    const state = composable(rest as Props)
    return createElement(Context.Provider, { value: state }, children)
  }) as CreateInjectionStateProvider<Props, ReactNode> & { displayName?: string }

  Provider.displayName = composable.name ? `${composable.name}Provider` : 'InjectionStateProvider'

  const useInjectedState = () => useContext(Context)

  return [Provider, useInjectedState]
}
