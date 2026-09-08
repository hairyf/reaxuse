import type { MaybeRefOrGetter } from './utils'
import { useEffect, useRef } from 'react'
import { toValue } from './utils'

export interface SyncRefsOptions {
  /**
   * Timing for syncing, same as watch's `flush` option.
   *
   * React note: there is no React equivalent — effects always run after
   * commit, so `'sync'` / `'pre'` / `'post'` are accepted for upstream
   * signature compatibility and all behave identically.
   *
   * @default 'sync'
   */
  flush?: 'sync' | 'pre' | 'post'
  /**
   * Watch deeply.
   *
   * React note: no React equivalent — a `.current` write never schedules a
   * re-render by itself, so nested mutations cannot be observed (only the
   * source value as a whole is compared, via `Object.is`). Accepted for
   * upstream signature compatibility.
   *
   * @default false
   */
  deep?: boolean
  /**
   * Sync values immediately (on mount).
   *
   * @default true
   */
  immediate?: boolean
}

// sentinel marking "no value observed yet" — the first effect run performs the
// initial sync, mirroring upstream's default `immediate: true`
const neverObserved = Symbol('reaxuse.syncRefs.neverObserved')

/**
 * Keep target ref(s) in sync with a source ref — React port of VueUse's
 * `syncRefs`.
 *
 * Map from @vueuse/shared `syncRefs`
 * (`source/vueuse/packages/shared/syncRefs/`). One-way synchronization: every
 * source change is copied into each target's `.current`. The source accepts a
 * plain value, a ref-like (`{ current }`) or a getter (upstream: `WatchSource`),
 * the targets are writable ref-likes; upstream's `flush` / `deep` / `immediate`
 * options are kept for signature compatibility.
 *
 * React Hook adaptation: upstream syncs through Vue's reactive `watch`, and
 * React has no reactive system — so `syncRefs` is implemented as a hook (call
 * it unconditionally at the top of a component, keeping the upstream name, per
 * the porting rules). Internally a `useEffect` that runs after every commit
 * resolves the source value (`toValue`) and compares it with the last observed
 * one via `Object.is`; a change is written through to all targets. Because the
 * observation happens post-commit, external `source.current = ...` mutations
 * land on the targets on the render that follows them — the mutation itself
 * never schedules a render, so a bare `current` write outside of React is not
 * observed (see the maintainer notes on reaxuse #40 / #41). The returned
 * `stop` function tears the synchronization down; the effect also stops doing
 * any work once the owning component unmounts.
 *
 * @example
 * const source = { current: 'hello' }
 * const target = { current: 'target' }
 *
 * const stop = syncRefs(source, target)
 *
 * console.log(target.current) // hello
 *
 * source.current = 'foo' // then the component re-renders
 * console.log(target.current) // foo
 *
 * stop()
 */
export function syncRefs<T>(
  source: MaybeRefOrGetter<T>,
  targets: { current: T } | Array<{ current: T }>,
  options: SyncRefsOptions = {},
): () => void {
  const { immediate = true } = options

  // latest source flushed on every render — the effect always observes fresh
  // values even when the caller swaps the ref-like / getter between renders
  const sourceRef = useRef(source)
  sourceRef.current = source

  const targetsArray = Array.isArray(targets) ? targets : [targets]
  const targetsRef = useRef(targetsArray)
  targetsRef.current = targetsArray

  const lastValueRef = useRef<T | symbol>(neverObserved)
  const stoppedRef = useRef(false)

  useEffect(() => {
    if (stoppedRef.current)
      return

    const value = toValue(sourceRef.current)
    const last = lastValueRef.current
    lastValueRef.current = value

    // first observation — initial sync (upstream `immediate`), unless skipped
    if (last === neverObserved) {
      if (!immediate)
        return
    }
    else if (Object.is(last, value)) {
      return
    }

    targetsRef.current.forEach((target) => {
      if (!Object.is(target.current, value))
        target.current = value
    })
  })

  return () => {
    stoppedRef.current = true
  }
}
