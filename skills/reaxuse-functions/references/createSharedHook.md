---
category: State
related: createGlobalState
---

# createSharedHook

Make a composable function usable with multiple React components.

> [!WARNING]
> When used in an **SSR** environment, `createSharedHook` renders the uninitialized snapshot on the server and fills it in on the client after hydration, so the module-level store is never shared across server requests — avoiding [cross-request state pollution](https://vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution).

## Usage

```ts
import { useMouse } from '@reaxuse/core'
import { createSharedHook } from '@reaxuse/shared'

const useSharedMouse = createSharedHook(useMouse)

// CompA
const { x, y } = useSharedMouse()

// CompB - reuses the same state; no new listeners are registered
const { x, y } = useSharedMouse()
```

The first consumer to render becomes the **creator**: it runs the wrapped hook on every render and publishes the result, while every other consumer only reads the shared snapshot. While the creator stays mounted the shared value keeps updating; if it unmounts while other consumers remain, the value **freezes** at the last published value (the wrapped hook's setters belong to the creator's component). When the last consumer unmounts, the optional `cleanup` callback runs and the shared state is dropped; a later mount starts a fresh instance.

## Type Declarations

```ts
/**
 * Make a composable function usable with multiple React components.
 *
 * Map from @vueuse/shared `createSharedComposable`
 * Mapping: upstream runs the composable once inside a detached
 * `effectScope(true)`, counts the subscribers and stops the scope when the
 * last consumer leaves. React has no `effectScope`, so the same lifetime is
 * expressed by an external store held in the closure of one
 * `createSharedHook` call — the `state` snapshot, a `Set` of `listeners`, the
 * `refCount` and the optional `cleanup` — which every consumer reads through
 * `useSyncExternalStore`.
 *
 * The shared instance is created by the **first consumer to render** (the
 * "creator"): it runs the wrapped hook on every one of its renders — the
 * wrapped hook is therefore free to use React hooks internally — assigning
 * the result to `state`, and `useLayoutEffect` publishes the latest value to
 * every other consumer after commit. Every later consumer never calls the
 * wrapped hook (both call patterns are stable per consumer, so the hook order
 * never changes across renders); it just reads the published snapshot. The
 * creator assigns `state` *before* `useSyncExternalStore` reads its snapshot
 * in the same render, so every consumer — creator included — receives the
 * shared value on its very first render, never `undefined`.
 *
 * The creator deliberately **does not register a store listener**: it already
 * re-renders on its own state changes (the wrapped hook's setters belong to
 * its component) and re-publishes afterwards, so a notification would only
 * re-render it from its own publish. `useSyncExternalStore` requires the
 * snapshot to stay reference-stable between real changes ("the result of
 * getSnapshot should be cached"): every creator render assigns a fresh
 * reference, so a subscribed creator would see "the store changed" forever and
 * loop. The creator still counts toward `refCount`, so teardown timing is
 * exact — it just never receives notifications.
 *
 * Deviations from upstream:
 * - upstream runs the composable exactly once, with the first caller's
 *   arguments; here the creator re-runs the wrapped hook on every one of its
 *   renders (React hooks cannot be called outside a render), so while the
 *   creator stays mounted the shared value keeps tracking its latest render.
 * - **frozen after the creator unmounts**: the wrapped hook's setters belong
 *   to the creator's component, so if the creator unmounts while other
 *   consumers remain mounted, the shared value stops updating — it freezes at
 *   the last published value. The instance itself lives on until the last
 *   consumer unmounts (upstream lifetime parity).
 * - `getServerSnapshot` returns the same snapshot as the client: server
 *   rendering yields the uninitialized value, the client fills it in after
 *   hydration, and `useSyncExternalStore` handles the mismatch.
 * - Teardown has no `tryOnScopeDispose` to hook into, so the optional
 *   `cleanup` argument is called — and the state dropped — when the last
 *   consumer unmounts; a later mount starts a fresh instance, exactly like
 *   upstream's `scope.stop()` followed by `state = undefined`.
 *
 * ```tsx
 * const useSharedMouse = createSharedHook(useMouse)
 *
 * // CompA — const { x, y } = useSharedMouse()
 * // CompB — const { x, y } = useSharedMouse() // same state, no new listeners
 * ```
 *
 * @see https://vueuse.org/createSharedComposable
 * @param hook The composable to share across every consumer of the returned
 * hook. It runs on every render of the first consumer (the creator).
 * @param cleanup Called when the last consumer unmounts, before the shared
 * state is dropped — the place to undo whatever `hook` set up outside React.
 */
export declare function createSharedHook<Fn extends (...args: any[]) => any>(
  hook: Fn,
  cleanup?: () => void,
): (...args: Parameters<Fn>) => ReturnType<Fn>
```
