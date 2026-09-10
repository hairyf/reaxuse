---
category: State
---

# useStateThrottledHistory

Shorthand for `useStateHistory` with throttled filter.

## Usage

This function takes the first snapshot right after the counter's value was changed and the second with a delay of 1000ms.

```tsx
import { useStateThrottledHistory } from '@reaxuse/core'
import { useState } from 'react'

const [count, setCount] = useState(0)
const { history, undo, redo, canUndo, canRedo } = useStateThrottledHistory([count, setCount], { throttle: 1000 })

setCount(1)
// first change after a quiet window commits immediately (leading edge)

setCount(2)
// changes inside the throttle window collapse into a single trailing commit

console.log(history)
/* [
  { snapshot: 2, timestamp: 1601912898062 },
  { snapshot: 0, timestamp: 1601912898061 }
] */

undo() // count back to the previous record
```

The source is the controlled `[state, setState]` tuple of an existing `useState`; commits are driven by an effect on state changes (upstream: `useWatchIgnorable`).

## Type Declarations

```ts
export interface UseStateThrottledHistoryOptions<Raw, Serialized = Raw> {
  /**
   * Maximum number of history to be kept. Default to unlimited.
   */
  capacity?: number
  /**
   * Clone when taking a snapshot, shortcut for dump: JSON.parse(JSON.stringify(value)).
   *
   * @default false
   */
  clone?: boolean | ((value: Raw) => Raw)
  /**
   * Serialize data into the history
   */
  dump?: (value: Raw) => Serialized
  /**
   * Deserialize data from the history
   */
  parse?: (value: Serialized) => Raw
  /**
   * Throttle duration in milliseconds between history commits — re-read on
   * every change, so passing the current value of a state works naturally.
   *
   * @default 200
   */
  throttle?: number
  /**
   * Commit the latest change on the trailing edge of the throttle window.
   * When `false`, changes inside the window are dropped instead of collapsing
   * into a trailing commit.
   *
   * @default true
   */
  trailing?: boolean
}
export interface UseStateThrottledHistoryControls<Raw, Serialized = Raw> {
  /**
   * Mirror of the source state passed to the hook
   */
  source: Raw
  /**
   * Last history point, the source can be restored to it with `reset()`
   */
  last: UseRefHistoryRecord<Serialized>
  /**
   * History records for undo, newest comes first
   */
  undoStack: UseRefHistoryRecord<Serialized>[]
  /**
   * Records array for redo
   */
  redoStack: UseRefHistoryRecord<Serialized>[]
  /**
   * If undo is possible (non empty undoStack)
   */
  canUndo: boolean
  /**
   * If redo is possible (non empty redoStack)
   */
  canRedo: boolean
  /**
   * If change tracking is enabled (flipped by `pause()` / `resume()`)
   */
  isTracking: boolean
  /**
   * Tracked setter for the source state (value or updater form, like
   * `setState`). Prefer it over your own setter when the update should be
   * visible to `commit()` in the same tick — see `useStateManualHistory`.
   */
  setSource: Dispatch<SetStateAction<Raw>>
  /**
   * Create a new history record immediately, bypassing the throttle —
   * cancels a pending trailing commit for the same change
   * (upstream: `ignorePrevAsyncUpdates` + the manual commit)
   */
  commit: () => void
  /**
   * Clear all the history and cancel a pending trailing commit
   */
  clear: () => void
  /**
   * Reset the source to the last history point without recording
   */
  reset: () => void
  /**
   * Pause change tracking
   */
  pause: () => void
  /**
   * Resume change tracking
   *
   * @param [commitNow] if true, a history record will be created after resuming
   */
  resume: (commitNow?: boolean) => void
  /**
   * A sugar for pausing the recording within a function scope: changes made
   * with `controls.setSource()` inside `fn` are not committed during `fn`, and
   * a single commit is created after it — unless `cancel()` is called.
   *
   * @param fn
   */
  batch: (fn: (cancel: () => void) => void) => void
}
export interface UseStateThrottledHistoryReturn<
  Raw,
  Serialized = Raw,
> extends UseStateThrottledHistoryControls<Raw, Serialized> {
  /**
   * An array of history records for undo, newest comes first
   */
  history: UseRefHistoryRecord<Serialized>[]
  /**
   * Undo the last change
   */
  undo: () => void
  /**
   * Redo the last change
   */
  redo: () => void
}
/**
 * React port of VueUse's `useThrottledRefHistory`.
 *
 * Map from @vueuse/core `useThrottledRefHistory`
 * (`source/vueuse/packages/core/useThrottledRefHistory/`). Shorthand for the
 * manual history machinery with a throttled filter: track the change history
 * of a state automatically, committing at most once per throttle duration —
 * the first change after a quiet window commits immediately (leading edge)
 * and changes inside the window collapse into a single trailing commit that
 * carries the latest value.
 *
 * The return object mirrors VueUse's `UseRefHistoryReturn` (refs flattened to
 * plain values):
 * `const { history, undo, redo, canUndo, canRedo, ... } = useStateThrottledHistory([source, setSource])`.
 *
 * Adjustments from upstream (Vue reactivity does not translate 1:1):
 *
 * 1. Source: upstream tracks a writable Vue `Ref<Raw>` and commits through a
 *    watcher; React state lives in the component, so the source is the
 *    controlled tuple `[state, setState]` of an existing `useState`; commits are
 *    driven by an effect on state changes (upstream: `watchIgnorable`). The `deep`
 *    and `flush` options don't apply — replace the state instead of mutating
 *    it, a mutated object does not re-render and is invisible to the history
 *    (`clone` / custom `dump` still support mutation-style sources).
 * 2. Throttle filter: upstream composes `throttleFilter` from
 *    `@vueuse/shared`; the filter logic is inlined here (same algorithm as
 *    `useThrottleFn`, see `packages/shared/src/useThrottleFn.ts`) with the
 *    leading edge fixed to `true` — upstream's shorthand only forwards
 *    `throttle` and `trailing`. `throttle` is re-read on every change.
 * 3. History operations supersede pending trailing commits: `undo` / `redo` /
 *    `reset` / `clear` and a manual `commit()` cancel a scheduled trailing
 *    commit (upstream's `ignorePrevAsyncUpdates` only cancels the queued
 *    watcher callback, so its trailing timer can still fire afterwards and
 *    re-record the restored record — the port keeps the history free of
 *    duplicates). A pending trailing commit still fires while tracking is
 *    paused, mirroring upstream.
 * 4. Same-tick changes: use `controls.setSource()` (value or updater form)
 *    for updates that must be visible to a manual `commit()` in the same
 *    tick — see `useStateManualHistory` for the full explanation.
 * 5. Storage: snapshots live in refs and a version counter triggers
 *    re-renders (upstream: reactive refs + `computed`); records are plain
 *    objects and timestamps use `Date.now()`. Upstream's `dispose` is not
 *    ported — disposal follows the component lifecycle and pending timers are
 *    cancelled on unmount. Upstream's `shouldCommit` is not ported.
 *
 * @example
 * const [count, setCount] = useState(0)
 * const { history, undo, redo, canUndo, canRedo } = useStateThrottledHistory([count, setCount], { throttle: 1000 })
 *
 * setCount(1) // first change after a quiet window commits immediately
 * setCount(2) // changes inside the window collapse into one trailing commit
 * undo() // count back to the previous record
 */
export declare function useStateThrottledHistory<Raw, Serialized = Raw>(
  state: State<Raw>,
  options?: UseStateThrottledHistoryOptions<Raw, Serialized>,
): UseStateThrottledHistoryReturn<Raw, Serialized>
```
