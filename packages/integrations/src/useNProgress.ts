import type { RefOrValue } from '@reaxuse/shared'
import type { NProgress, NProgressOptions } from 'nprogress'
import { isClient, toValue } from '@reaxuse/shared'
import nprogress from 'nprogress'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Options forwarded to `nprogress.configure` — mirrors upstream's
 * `UseNProgressOptions` (`Partial<NProgressOptions>`).
 */
export type UseNProgressOptions = Partial<NProgressOptions>

export interface UseNProgressReturn {
  /**
   * Whether the bar is currently showing — the React replacement for
   * upstream's writable `isLoading` computed: `true` while `progress` is a
   * number below 1. Write through `setIsLoading`.
   */
  isLoading: boolean

  /**
   * Current progress percentage (`0..1`), `null` after `remove()`, `1` after
   * `done()` — the plain-state replacement for upstream's `progress` ref.
   */
  progress: number | null | undefined

  /**
   * Setter half of upstream's writable `isLoading` computed:
   * `setIsLoading(true)` starts the bar, `setIsLoading(false)` completes it.
   */
  setIsLoading: (load: boolean) => void

  /**
   * Set the progress percentage (`0..1`) and push it to `nprogress`.
   */
  setProgress: (n: number) => void

  /**
   * Show the bar — upstream's `start`.
   */
  start: () => NProgress

  /**
   * Complete the bar (the placebo `done` animation) — upstream's `done`.
   *
   * @param force - show the bar even when it is hidden
   */
  done: (force?: boolean) => NProgress

  /**
   * Reset `progress` to `null` and remove the bar from the DOM — upstream's
   * `remove`.
   */
  remove: () => void
}

/**
 * React port of VueUse's `useNProgress`.
 *
 * Map from @vueuse/integrations `useNProgress`
 * (`source/vueuse/packages/integrations/useNProgress/index.ts`), a reactive
 * wrapper around the [`nprogress`](https://github.com/rstacruz/nprogress)
 * progress bar. `currentProgress` accepts a plain number or a React ref-like
 * object (`{ current }`), resolved with `toValue` from `@reaxuse/shared`.
 *
 * Adjustment for React:
 * - the writable `WritableComputedRef<boolean>` `isLoading` and the
 *   `Ref<number | null | undefined>` `progress` become plain state: `isLoading`
 *   is derived (`typeof progress === 'number' && progress < 1`) and written
 *   through `setIsLoading`, `progress` is a plain number that is written
 *   through `setProgress`; the object return replaces upstream's tuple-free
 *   object of refs;
 * - upstream monkey-patches the module-singleton `nprogress.set` so that its
 *   internal `set` calls (`start` → `set(0)`, `done` → `set(1)`) write back
 *   into `progress.value`, which is what makes `isLoading` flip. This port
 *   never touches the global `nprogress.set`: `setProgress(n)` sets the state
 *   and calls `nprogress.set(n)`, while `start` / `done` / `setIsLoading`
 *   mirror the same write-back by hand (upstream's `start` only calls `set(0)`
 *   when the bar was idle, and `done` only calls `set(1)` when it actually
 *   progresses) — so `isLoading` flips exactly as upstream, without global
 *   pollution and safely with concurrent hook instances;
 * - `options` are applied once on mount (`nprogress.configure`), like
 *   upstream's setup-time `if (options) nprogress.configure(options)`; later
 *   `options` changes are not re-applied, matching the upstream setup
 *   semantics;
 * - a provided `currentProgress` is mirrored into the internal state (upstream's
 *   `toRef`): a ref-like object is followed through its `.current` changes and
 *   a plain number re-syncs when the argument changes between renders; a write
 *   through `setProgress` / `start` / `done` is only superseded by a genuine
 *   external change;
 * - unmount runs `nprogress.remove()`, mirroring upstream's
 *   `tryOnScopeDispose(nprogress.remove)`. `nprogress` is a module singleton,
 *   so unmounting one hook instance removes the shared bar — the same
 *   semantics as upstream.
 *
 * SSR-safe: `nprogress.set` is only called when `isClient` (upstream's
 * `watchEffect` guard).
 *
 * @param currentProgress - initial progress percentage (`0..1`), or a
 *   ref-like object whose changes are followed
 * @param options - `nprogress.configure` options, applied once on mount
 *
 * @__NO_SIDE_EFFECTS__
 * @example
 * const { isLoading, progress, setIsLoading, setProgress, done, remove } = useNProgress()
 * setIsLoading(true) // starts the bar, isLoading === true
 * setProgress(0.5) // progress === 0.5, the bar renders at 50%
 * done() // progress === 1, isLoading === false
 * remove() // progress === null, the #nprogress element is gone
 */
export function useNProgress(
  currentProgress: RefOrValue<number | null | undefined> = null,
  options?: UseNProgressOptions,
): UseNProgressReturn {
  const [progress, setProgressState] = useState<number | null | undefined>(
    () => toValue(currentProgress),
  )

  // mirror the incoming `currentProgress` into the internal state whenever the
  // resolved value changes between renders — upstream's `toRef(currentProgress)`.
  // The baseline records the last value synced FROM the outside, so a
  // `setProgress` / `start` / `done` write is never clobbered by a render that
  // did not actually change the external source.
  const lastExternalRef = useRef<number | null | undefined>(toValue(currentProgress))
  useEffect(() => {
    const resolved = toValue(currentProgress)
    if (!Object.is(resolved, lastExternalRef.current)) {
      lastExternalRef.current = resolved
      setProgressState(resolved)
    }
  })

  // upstream applies options at setup time; later option changes are ignored.
  // Declared before the progress-push effect below so the configuration is in
  // place before the first `nprogress.set` (the minimum clamps the value).
  const optionsRef = useRef(options)
  optionsRef.current = options
  useEffect(() => {
    if (optionsRef.current)
      nprogress.configure(optionsRef.current)
  }, [])

  // upstream `watchEffect`: push numeric progress into the bar
  useEffect(() => {
    if (typeof progress === 'number' && isClient)
      nprogress.set(progress)
  }, [progress])

  // upstream `tryOnScopeDispose(nprogress.remove)`
  useEffect(() => () => {
    nprogress.remove()
  }, [])

  const setProgress = useCallback((n: number) => {
    setProgressState(n)
    if (isClient)
      nprogress.set(n)
  }, [])

  const start = useCallback((): NProgress => {
    // upstream's patched `set` writes `progress.value = 0` from the internal
    // `set(0)` call, but only when the bar was idle
    const wasStarted = nprogress.isStarted()
    const result = nprogress.start()
    if (!wasStarted)
      setProgressState(0)
    return result
  }, [])

  const done = useCallback((force?: boolean): NProgress => {
    // upstream's `done` returns early (and so never calls the patched `set(1)`)
    // when `!force && !nprogress.status`
    const status = nprogress.status
    const result = nprogress.done(force)
    if (force || status)
      setProgressState(1)
    return result
  }, [])

  const setIsLoading = useCallback((load: boolean) => {
    if (load)
      start()
    else
      done()
  }, [start, done])

  const remove = useCallback(() => {
    setProgressState(null)
    nprogress.remove()
  }, [])

  return {
    isLoading: typeof progress === 'number' && progress < 1,
    progress,
    setIsLoading,
    setProgress,
    start,
    done,
    remove,
  }
}
