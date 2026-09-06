import { useCallback, useEffect, useRef } from 'react'
import { useWatch } from './useWatch'

export type OnCleanup = (cleanupFn: () => void) => void

export type IgnoredUpdater = (updater: () => void) => void

export interface UseWatchTriggerableCallback<V = any, OV = any, R = void> {
  (value: V, oldValue: OV, onCleanup: OnCleanup): R
}

export interface UseWatchTriggerableReturn<R = void> {
  /**
   * Execute the callback immediately with the current source value — the old
   * value is unknown (`undefined`) for a manual call, and the invocation does
   * not count as a source change.
   */
  trigger: () => R

  /**
   * Run `updater`, ignoring the watch for the source changes it makes — as
   * long as no other changes follow, the callback is not fired for that batch.
   */
  ignoreUpdates: IgnoredUpdater

  /**
   * Ignore the source changes made since the last time the callback fired —
   * as long as no other changes follow, the callback is not fired for that
   * batch.
   */
  ignorePrevAsyncUpdates: () => void

  /**
   * Stop watching — further source changes will not fire the callback.
   */
  stop: () => void
}

export interface UseWatchTriggerableOptions {
  /**
   * Fire the callback once on mount with the current value.
   * @default false
   */
  immediate?: boolean
}

/**
 * Watch that can be triggered manually — extended watch that returns
 * `trigger()` to execute the callback immediately — React port of VueUse's
 * `watchTriggerable`.
 * Map from @vueuse/shared watchTriggerable.
 *
 * The API follows the maintainer-directed adjustment of issue #263: the
 * source is the caller's own state value (house `useWatch` source convention)
 * and the return is the upstream `WatchTriggerableReturn` object shape — this
 * deliberately overrides the house array-destructure return convention, and
 * the hook holds no state of its own.
 *
 * Mapping: upstream builds on `watchIgnorable`, which counts every source
 * modification with a hidden `flush: 'sync'` shadow watcher (`syncCounter`),
 * accumulates the changes to skip in `ignoreCounter`, and skips a trigger
 * only when every counted change came from `ignoreUpdates`
 * (`ignoreCounter === syncCounter`); `trigger()` calls the callback with the
 * current source value wrapped in `ignoreUpdates` so the manual invocation
 * does not disturb that accounting, and the previously registered `onCleanup`
 * side effect is cleaned up before every new invocation.
 *
 * React sees the caller's changes only at commit — there is no way to observe
 * (let alone intercept) `setSource`, and automatic batching has already
 * collapsed consecutive updates into a single render by then. The counters
 * are therefore approximated with a one-shot "ignore barrier":
 * `ignoreUpdates(updater)` snapshots the latest observed value, runs `updater`
 * synchronously and arms the barrier; the next change the watch observes is
 * skipped (upstream skips it too when no other changes follow) and the flag is
 * consumed either way, so later genuine changes fire again. A commit that
 * carries no source change disarms the barrier so a no-op updater cannot
 * consume a later genuine change. `ignorePrevAsyncUpdates()` arms the same
 * barrier for the changes queued before the call.
 *
 * `trigger()` fires synchronously at the call site — it does not wait for
 * React to commit and is unaffected by batching: it hands the current source
 * value straight to the callback with the old value `undefined` (upstream
 * cannot know it either) and returns the callback's return value so async
 * work can be awaited. Unlike upstream, the invocation is NOT wrapped in the
 * ignore barrier: `trigger()` itself makes no source change, and the one-shot
 * barrier is uncounted — arming it with no change to follow would swallow the
 * next genuine change (no commit would arrive to disarm it). The trade-off: a
 * source change queued by the callback inside `trigger()` fires the watch
 * normally after its commit, where upstream would ignore it.
 *
 * Divergences from upstream (React batching):
 * - Changes made inside `ignoreUpdates` and further changes made afterwards
 *   in the same synchronous batch collapse into one render, which the
 *   barrier skips as a whole — upstream would fire the callback with the
 *   latest value. Let the updater's batch commit before making changes that
 *   must fire.
 * - If the updater produces no change and the very next commit carries a
 *   source change, that change is skipped where upstream would fire it
 *   (upstream counts 0 changes); only a commit without a source change
 *   disarms the barrier in between.
 * - The `flush` option is not ported — the callback fires in the effect after
 *   commit (upstream `flush: 'pre'` timing); `eventFilter` and the other
 *   `WatchWithFilterOptions` members (`deep`, pause/resume) are not ported —
 *   only `immediate`.
 * - `stop()` keeps the effect registered but the callback becomes a no-op —
 *   observable behavior is identical (the callback never fires again).
 *
 * @example
 * ```ts
 * const [source, setSource] = useState('foo')
 * const { trigger, ignoreUpdates } = useWatchTriggerable(source, v => console.log(`Changed to ${v}!`))
 * setSource('bar') // logs: Changed to bar!
 * ignoreUpdates(() => setSource('foobar')) // (nothing logged)
 * trigger() // logs: Changed to foobar! — fired manually with the current value
 * ```
 */
export function useWatchTriggerable<T extends any[], R>(
  source: readonly [...T],
  callback: UseWatchTriggerableCallback<[...T], [...T] | undefined, R>,
  options?: UseWatchTriggerableOptions,
): UseWatchTriggerableReturn<R>
export function useWatchTriggerable<T, R>(
  source: T,
  callback: UseWatchTriggerableCallback<T, T | undefined, R>,
  options?: UseWatchTriggerableOptions,
): UseWatchTriggerableReturn<R>
export function useWatchTriggerable(source: any, callback: UseWatchTriggerableCallback, options: UseWatchTriggerableOptions = {}): UseWatchTriggerableReturn<any> {
  const { immediate } = options

  // — upstream `onCleanup` plumbing: when a new side effect occurs, clean up
  // the previous side effect (both watch-fired and manual invocations) —
  const cleanupFnRef = useRef<(() => void) | undefined>(undefined)

  const onCleanup = useCallback<OnCleanup>((cleanupFn) => {
    cleanupFnRef.current = cleanupFn
  }, [])

  const triggerableCallback = useCallback((value: any, oldValue: any) => {
    const cleanupFn = cleanupFnRef.current
    if (cleanupFn) {
      cleanupFnRef.current = undefined
      cleanupFn()
    }
    return callback(value, oldValue, onCleanup)
  }, [callback, onCleanup])

  // — ignore barrier — the React equivalent of upstream's counters —
  const lastSeenRef = useRef(source) // value observed at the last watch fire
  const snapshotRef = useRef(source) // observed value when the barrier was armed
  const ignoreRef = useRef(false) // one-shot skip flag
  const stoppedRef = useRef(false)

  useWatch(source, (value, oldValue) => {
    lastSeenRef.current = value
    const ignore = ignoreRef.current
    ignoreRef.current = false
    if (ignore || stoppedRef.current)
      return
    triggerableCallback(value, oldValue)
  }, { immediate })

  // Disarm the barrier when a commit carries no source change (the updater
  // produced nothing observable) so it cannot consume a later genuine change.
  useEffect(() => {
    if (ignoreRef.current && Object.is(source, snapshotRef.current))
      ignoreRef.current = false
  })

  const ignoreUpdates = useCallback<IgnoredUpdater>((updater) => {
    // Snapshot the observed value before the updater runs — the next watch
    // trigger is skipped when it observes a change since this snapshot.
    snapshotRef.current = lastSeenRef.current
    updater()
    ignoreRef.current = true
  }, [])

  const ignorePrevAsyncUpdates = useCallback(() => {
    // Snapshot-style one-shot skip for the changes queued before this call.
    snapshotRef.current = lastSeenRef.current
    ignoreRef.current = true
  }, [])

  const stop = useCallback(() => {
    stoppedRef.current = true
  }, [])

  const trigger = useCallback(() => {
    // Manual invocation: hand the current value straight to the callback —
    // the old value is unknown (as upstream) and no source change is made,
    // so nothing needs to be ignored.
    return triggerableCallback(source, undefined)
  }, [source, triggerableCallback])

  return { trigger, ignoreUpdates, ignorePrevAsyncUpdates, stop }
}
