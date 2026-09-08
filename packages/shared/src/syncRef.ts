import { useEffect, useRef } from 'react'

export type SyncRefDirection = 'both' | 'ltr' | 'rtl'

export interface SyncRefTransform<L, R> {
  ltr: (left: L) => R
  rtl: (right: R) => L
}

export interface SyncRefOptions<L, R, D extends SyncRefDirection = 'both'> {
  /**
   * Timing for syncing, same as watch's `flush` option.
   *
   * React note: no React equivalent — effects always run after commit, so
   * `'sync'` / `'pre'` / `'post'` are accepted for upstream signature
   * compatibility and all behave identically.
   *
   * @default 'sync'
   */
  flush?: 'sync' | 'pre' | 'post'
  /**
   * Watch deeply.
   *
   * React note: no React equivalent — a `.current` write never schedules a
   * re-render by itself, so nested mutations cannot be observed (only the
   * value as a whole is compared, via `Object.is`). Accepted for upstream
   * signature compatibility.
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
  /**
   * Direction of syncing.
   *
   * @default 'both'
   */
  direction?: D
  /**
   * Value convertors applied on the way to the other side: `ltr` maps a left
   * value before it is written into the right ref-like, `rtl` maps a right
   * value before it is written into the left ref-like. A missing convertor
   * falls back to identity.
   */
  transform?: Partial<SyncRefTransform<L, R>>
}

// sentinel marking "no value observed yet" on a side — the first effect run
// performs the initial sync, mirroring upstream's default `immediate: true`
const neverObserved = Symbol('reaxuse.syncRef.neverObserved')

/**
 * Two-way refs synchronization — keeps two ref-like objects (`{ current }`) in
 * sync, with optional direction and value transforms.
 *
 * Map from @vueuse/shared `syncRef`.
 * React Hook adaptation: upstream drives both sides through Vue's reactive
 * `watchPausable`, pausing all watchers while writing so a side never echoes
 * its own write back. React has no reactive system, so `syncRef` is
 * implemented as a hook (call it unconditionally at the top of a component,
 * keeping the upstream name, per the porting rules). A `useEffect` that runs
 * after every commit compares each side's `current` with the last observed
 * value via `Object.is` and mirrors the changed side into the other — through
 * the optional `transform` convertors when given — recording the value it just
 * wrote as already observed on the receiving side (the React analogue of
 * upstream's pause/resume). The initial sync (upstream default `immediate:
 * true`) runs in the mount effect and cascades ltr before rtl, matching
 * upstream's watcher creation order. Because the observation happens
 * post-commit, an external `left.current = ...` mutation is only adopted on
 * the render that follows it — the mutation itself never schedules a render,
 * so a bare `current` write outside of React is not observed (see the
 * maintainer notes on reaxuse #40 / #41). The returned `stop` function tears
 * the synchronization down; the effect also stops doing any work once the
 * owning component unmounts.
 *
 * @example
 * const a = { current: 'a' }
 * const b = { current: 'b' }
 *
 * const stop = syncRef(a, b)
 *
 * console.log(a.current) // a
 *
 * b.current = 'foo' // then the component re-renders
 * console.log(a.current) // foo
 *
 * a.current = 'bar' // then the component re-renders
 * console.log(b.current) // bar
 *
 * stop()
 */
export function syncRef<L, R, D extends SyncRefDirection = 'both'>(
  left: { current: L },
  right: { current: R },
  options: SyncRefOptions<L, R, D> = {},
): () => void {
  const { immediate = true, direction = 'both', transform = {} } = options

  // the ref-likes may be swapped between renders — the effect always observes
  // the latest instances through these mirrors
  const leftRef = useRef(left)
  leftRef.current = left
  const rightRef = useRef(right)
  rightRef.current = right

  const transformLTR = transform.ltr ?? ((v: L) => v as unknown as R)
  const transformRTL = transform.rtl ?? ((v: R) => v as unknown as L)

  const lastLeftRef = useRef<L | typeof neverObserved>(neverObserved)
  const lastRightRef = useRef<R | typeof neverObserved>(neverObserved)
  const stoppedRef = useRef(false)

  useEffect(() => {
    if (stoppedRef.current)
      return

    const l = leftRef.current
    const r = rightRef.current
    const ltrActive = direction === 'both' || direction === 'ltr'
    const rtlActive = direction === 'both' || direction === 'rtl'

    if (lastLeftRef.current === neverObserved && lastRightRef.current === neverObserved) {
      // first observation — initial sync (upstream `immediate`), cascading ltr
      // before rtl so the rtl convertor sees the freshly written right value,
      // mirroring upstream's watcher creation order
      if (immediate) {
        if (ltrActive)
          r.current = transformLTR(l.current)
        if (rtlActive)
          l.current = transformRTL(r.current)
      }
      lastLeftRef.current = l.current
      lastRightRef.current = r.current
      return
    }

    // left → right
    if (ltrActive) {
      const leftValue = l.current
      if (!Object.is(lastLeftRef.current, leftValue)) {
        lastLeftRef.current = leftValue
        const converted = transformLTR(leftValue)
        if (!Object.is(r.current, converted)) {
          r.current = converted
          // absorb the write so the right → left pass below does not echo it back
          lastRightRef.current = r.current
        }
      }
    }

    // right → left
    if (rtlActive) {
      const rightValue = r.current
      if (!Object.is(lastRightRef.current, rightValue)) {
        lastRightRef.current = rightValue
        const converted = transformRTL(rightValue)
        if (!Object.is(l.current, converted)) {
          l.current = converted
          lastLeftRef.current = l.current
        }
      }
    }
  })

  return () => {
    stoppedRef.current = true
  }
}
