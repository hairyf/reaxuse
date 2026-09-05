import type { Dispatch, SetStateAction } from 'react'
import type { UseWatchCallback } from './useWatch'
import { useCallback, useRef, useState } from 'react'
import { useWatch } from './useWatch'

export type IgnoredUpdater = (updater: () => void) => void
export type IgnoredPrevAsyncUpdates = () => void

export interface UseWatchIgnorableOptions {
  /**
   * Fire the callback once on mount with the initial value.
   * @default false
   */
  immediate?: boolean
}

export interface UseWatchIgnorableReturn {
  /**
   * Run `updater`, ignoring the watch for the source changes it makes — as
   * long as no other changes follow, the callback is not fired for that batch.
   */
  ignoreUpdates: IgnoredUpdater

  /**
   * Ignore all source changes made since the last time the callback fired —
   * only meaningful before the batch carrying those changes is committed.
   */
  ignorePrevAsyncUpdates: IgnoredPrevAsyncUpdates

  /**
   * Stop watching — further source changes will not fire the callback.
   */
  stop: () => void
}

/**
 * Ignorable watch — a watched value whose updates can be selectively ignored —
 * React port of VueUse's `watchIgnorable`.
 *
 * Map from @vueuse/shared watchIgnorable. Upstream watches an external Vue ref
 * and returns `ignoreUpdates(updater)` / `ignorePrevAsyncUpdates()` / `stop`;
 * in React the hook must be able to count every change made to the source, so
 * it owns the state instead and returns `[value, setValue, controls]`: every
 * change made through the returned `setValue` is counted (the equivalent of
 * upstream's hidden `flush: 'sync'` shadow watcher), `ignoreUpdates(updater)`
 * marks the `setValue` calls made inside `updater` as ignored, and the watch
 * callback — built on the house `useWatch`, firing in the effect after commit
 * (upstream `flush: 'pre'` timing) — skips the batch only when every counted
 * change came from `ignoreUpdates` (`ignore === sync`, both counters reset
 * together), exactly upstream's counter mechanism. Changes made outside the
 * updater therefore still fire with the latest value.
 *
 * Divergences from upstream:
 * - The source is owned by the hook (`initialValue`) rather than an external
 *   `WatchSource` — React-idiomatic state ownership; `setValue` accepts the
 *   same `SetStateAction` forms as `useState` (plain value or updater function)
 *   and is stable across renders.
 * - Returns `[value, setValue, controls]` (React array-destructure convention)
 *   instead of a `WatchIgnorableReturn` object; `controls` carries the upstream
 *   `ignoreUpdates` / `ignorePrevAsyncUpdates` / `stop`.
 * - The `flush` option is not ported — React effects always run after commit.
 *   Under upstream's `flush: 'sync'` `ignorePrevAsyncUpdates` is a no-op; here
 *   it always applies (the port's only timing is async).
 * - `eventFilter` and the other `WatchWithFilterOptions` members (`deep`,
 *   pause/resume) are not ported — tracking is by `Object.is` identity, like a
 *   Vue ref reassignment.
 * - `stop()` keeps the effect registered but the callback becomes a no-op —
 *   observable behavior is identical (the callback never fires again).
 *
 * @example
 * ```ts
 * const [value, setValue, { ignoreUpdates }] = useWatchIgnorable('foo', v => console.log(`Changed to ${v}!`))
 * setValue('bar') // logs: Changed to bar!
 * ignoreUpdates(() => setValue('foobar')) // (nothing logged)
 * ```
 */
export function useWatchIgnorable<T>(
  initialValue: T,
  callback: UseWatchCallback<NoInfer<T>>,
  options: UseWatchIgnorableOptions = {},
): [T, Dispatch<SetStateAction<T>>, UseWatchIgnorableReturn] {
  const { immediate } = options

  const [value, setValue] = useState(initialValue)

  // Modification counters — the React equivalent of upstream's hidden
  // `flush: 'sync'` shadow watcher: every real change made through the setter
  // bumps `sync`, `ignore` accumulates the changes that must not fire the
  // callback.
  const syncRef = useRef(0)
  const ignoreRef = useRef(0)
  const stoppedRef = useRef(false)
  // Latest value seen by the setter — lets a `setValue` call detect no-op
  // updates (`Object.is` equal) the way a Vue ref assignment does.
  const latestRef = useRef(initialValue)

  const setSource = useCallback<Dispatch<SetStateAction<T>>>((action) => {
    const prev = latestRef.current
    const next = typeof action === 'function'
      ? (action as (prev: T) => T)(prev)
      : action
    latestRef.current = next
    if (!Object.is(next, prev))
      syncRef.current += 1
    setValue(action)
  }, [])

  const ignoreUpdates = useCallback<IgnoredUpdater>((updater) => {
    // Call the updater function and count how many changes are performed,
    // then add them to the ignore count.
    const syncPrev = syncRef.current
    updater()
    ignoreRef.current += syncRef.current - syncPrev
  }, [])

  const ignorePrevAsyncUpdates = useCallback<IgnoredPrevAsyncUpdates>(() => {
    ignoreRef.current = syncRef.current
  }, [])

  const stop = useCallback(() => {
    stoppedRef.current = true
  }, [])

  useWatch(value, (current, oldValue) => {
    // Ignore only when every counted change came from `ignoreUpdates` —
    // otherwise the batch also carries changes that must be committed.
    const ignore = ignoreRef.current > 0 && ignoreRef.current === syncRef.current
    ignoreRef.current = 0
    syncRef.current = 0
    if (ignore || stoppedRef.current)
      return
    callback(current, oldValue)
  }, { immediate })

  return [value, setSource, { ignoreUpdates, ignorePrevAsyncUpdates, stop }]
}
