import { useCallback, useEffect, useRef } from 'react'

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
 * Keep target ref(s) in sync with a source value — React port of VueUse's
 * `syncRefs`.
 *
 * Map from @vueuse/shared `syncRefs`
 * (`source/vueuse/packages/shared/syncRefs/`). One-way synchronization: every
 * source change is copied into each target's `.current`. The source is a plain
 * read-only value — pass `ref.current` or the state value (upstream:
 * `WatchSource`); the targets are writable ref-likes; upstream's `flush` /
 * `deep` / `immediate` options are kept for signature compatibility.
 *
 * React Hook adaptation: upstream syncs through Vue's reactive `watch`, and
 * React has no reactive system — so `syncRefs` is implemented as a hook (call
 * it unconditionally at the top of a component, keeping the upstream name, per
 * the porting rules). Internally a `useEffect` that runs after every commit
 * compares the current plain source with the last observed one via `Object.is`;
 * a change is written through to all targets. Because the observation happens
 * post-commit, the caller must re-render (e.g. `setState`) for a new source
 * value to reach the targets — a bare mutation outside of React is never
 * observed (see the maintainer notes on reaxuse #40 / #41). The returned
 * `stop` function tears the synchronization down; the effect also stops doing
 * any work once the owning component unmounts.
 *
 * @example
 * function Form() {
 *   const [source, setSource] = useState('hello')
 *   const target = { current: 'target' }
 *
 *   const stop = syncRefs(source, target)
 *
 *   // during the first render `target.current` is still 'target' — the sync
 *   // effect runs after the commit, so the source reaches the target only
 *   // once the component has mounted (target.current === 'hello' afterwards).
 *   // Calling `setSource('foo')` re-renders and the effect then copies 'foo'
 *   // into target.current on the following commit.
 *
 *   stop()
 * }
 */
export function syncRefs<T>(
  source: T,
  targets: { current: T } | Array<{ current: T }>,
  options: SyncRefsOptions = {},
): () => void {
  const { immediate = true } = options

  // latest source flushed on every render — the effect always observes the
  // value the caller passed on this render
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

    const value = sourceRef.current
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

  // stable `stop` — memoized so its identity survives renders (the React
  // analogue of upstream's stable watch handle)
  const stop = useCallback(() => {
    stoppedRef.current = true
  }, [])

  return stop
}
