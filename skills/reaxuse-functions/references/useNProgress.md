---
category: '@Integrations'
---

# useNProgress

Reactive wrapper for [`nprogress`](https://github.com/rstacruz/nprogress).

## Install

```bash
npm i nprogress@^0
```

## Usage

```tsx
import { useNProgress } from '@reaxuse/integrations'

const { isLoading, setIsLoading } = useNProgress()

function toggle() {
  setIsLoading(!isLoading)
}
```

### Passing a progress percentage

You can pass a percentage to indicate where the bar should start from.

```tsx
import { useNProgress } from '@reaxuse/integrations'

const { progress, setProgress } = useNProgress(0.5)

function done() {
  setProgress(1.0)
}
```

> To change the progress percentage, call `setProgress(n)`, where n is a number between 0..1.

### Customization

Just edit [nprogress.css](https://github.com/rstacruz/nprogress/blob/master/nprogress.css) to your liking. Tip: you probably only want to find and replace occurrences of #29d.

You can [configure](https://github.com/rstacruz/nprogress#configuration) it by passing an object as a second parameter.

```tsx
import { useNProgress } from '@reaxuse/integrations'

useNProgress(null, {
  minimum: 0.1,
  // ...
})
```

## Type Declarations

```ts
/**
 * Options forwarded to `nprogress.configure` — mirrors upstream's
 * `UseNProgressOptions` (`Partial<NProgressOptions>`).
 */
export type UseNProgressOptions = Partial<NProgressOptions>
export interface UseNProgressReturn {
  /**
   * Current progress percentage (`0..1`), `null` after `remove()`, `1` after
   * `done()` — the plain-state replacement for upstream's `progress` ref.
   * Write through `setProgress`.
   */
  readonly progress: number | null | undefined
  /**
   * Setter for `progress` — the React mapping of upstream's writable `progress`
   * ref. Takes a plain value or a functional updater (like a React `useState`
   * setter, `prev => next`). A `number` result is pushed to `nprogress` once,
   * through the progress effect (upstream: writing `progress.value`); a `null`
   * / `undefined` result only clears the state — the bar element is removed
   * through `remove()`.
   */
  readonly setProgress: Dispatch<SetStateAction<number | null | undefined>>
  /**
   * Whether the bar is currently showing — the React replacement for
   * upstream's writable `isLoading` computed: `true` while `progress` is a
   * number below 1. Write through `setIsLoading`.
   */
  readonly isLoading: boolean
  /**
   * Setter half of upstream's writable `isLoading` computed — takes a plain
   * value or a functional updater (like a React `useState` setter,
   * `prev => next`): `setIsLoading(true)` starts the bar, `setIsLoading(false)`
   * completes it.
   */
  readonly setIsLoading: Dispatch<SetStateAction<boolean>>
  /**
   * Show the bar — upstream's `start`.
   */
  readonly start: () => NProgress
  /**
   * Complete the bar (the placebo `done` animation) — upstream's `done`.
   *
   * @param force - show the bar even when it is hidden
   */
  readonly done: (force?: boolean) => NProgress
  /**
   * Reset `progress` to `null` and remove the bar from the DOM — upstream's
   * `remove`.
   */
  readonly remove: () => void
}
/**
 * React port of VueUse's `useNProgress`.
 *
 * Map from @vueuse/integrations `useNProgress`
 * (`source/vueuse/packages/integrations/useNProgress/index.ts`), a reactive
 * wrapper around the [`nprogress`](https://github.com/rstacruz/nprogress)
 * progress bar. `currentProgress` is the hook's **read-only value source** and
 * takes a plain `number | null | undefined` (upstream: `MaybeRefOrGetter`).
 *
 * Adjustment for React:
 * - the writable `WritableComputedRef<boolean>` `isLoading` and the
 *   `Ref<number | null | undefined>` `progress` become plain state: `isLoading`
 *   is derived (`typeof progress === 'number' && progress < 1`) and written
 *   through `setIsLoading`, `progress` is a plain number written through
 *   `setProgress`; the object return mirrors upstream's object of refs with
 *   every writable value paired with its setter —
 *   `{ progress, setProgress, isLoading, setIsLoading, start, done, remove }`;
 * - the setters are React `Dispatch<SetStateAction<...>>`: each accepts a plain
 *   value or a functional updater (`prev => next`), like a `useState` setter;
 * - upstream monkey-patches the module-singleton `nprogress.set` so that its
 *   internal `set` calls (`start` → `set(0)`, `done` → `set(1)`) write back
 *   into `progress.value`, which is what makes `isLoading` flip. This port
 *   never touches the global `nprogress.set`: `setProgress(n)` only sets the
 *   state and the progress effect pushes the number into the bar once per
 *   render, while `start` / `done` / `setIsLoading` mirror the same write-back
 *   by hand (upstream's `start` only calls `set(0)` when the bar was idle, and
 *   `done` only calls `set(1)` when it actually progresses) — so `isLoading`
 *   flips exactly as upstream, without global pollution and safely with
 *   concurrent hook instances;
 * - `options` are applied once on mount (`nprogress.configure`), like
 *   upstream's setup-time `if (options) nprogress.configure(options)`; later
 *   `options` changes are not re-applied, matching the upstream setup
 *   semantics;
 * - a provided `currentProgress` is mirrored into the internal state (upstream's
 *   `toRef`): a changed plain number re-syncs between renders, and a write
 *   through `setProgress` / `start` / `done` is only superseded by a genuine
 *   external change. Writes are **not** propagated back to the caller
 *   (upstream's `toRef` writes through to a ref input); the source is
 *   read-only here;
 * - unmount runs `nprogress.remove()`, mirroring upstream's
 *   `tryOnScopeDispose(nprogress.remove)`. `nprogress` is a module singleton,
 *   so unmounting one hook instance removes the shared bar — the same
 *   semantics as upstream.
 *
 * SSR-safe: `nprogress.set` is only called when `isClient` (upstream's
 * `watchEffect` guard).
 *
 * @param currentProgress - initial progress percentage (`0..1`); a changed
 *   plain value re-syncs on the next render
 * @param options - `nprogress.configure` options, applied once on mount
 *
 * @__NO_SIDE_EFFECTS__
 * @example
 * const { progress, setProgress, isLoading, setIsLoading, done, remove } = useNProgress()
 * setIsLoading(true) // starts the bar, isLoading === true
 * setProgress(0.5) // progress === 0.5, the bar renders at 50%
 * setProgress(prev => (prev ?? 0) + 0.1) // functional updater, like a useState setter
 * done() // progress === 1, isLoading === false
 * remove() // progress === null, the #nprogress element is gone
 */
export declare function useNProgress(
  currentProgress?: number | null | undefined,
  options?: UseNProgressOptions,
): UseNProgressReturn
```
