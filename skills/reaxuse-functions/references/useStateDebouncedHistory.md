---
category: State
---

# useStateDebouncedHistory

Shorthand for `useStateHistory` with debounced filter.

## Usage

This function takes a snapshot of your counter after 1000ms when the value of it starts to change.

```tsx
import { useStateDebouncedHistory } from '@reaxuse/core'
import { useState } from 'react'

const [count, setCount] = useState(0)
const { history, undo, redo, canUndo, canRedo } = useStateDebouncedHistory([count, setCount], { debounce: 1000 })

setCount(1)
// committed once 1000ms pass without further changes

setCount(2)
// every change resets the window — only the last change inside it is recorded

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
export interface UseStateDebouncedHistoryOptions<Raw, Serialized = Raw> {
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
   * Debounce duration in milliseconds between history commits — re-read on
   * every change, so passing the current value of a state works naturally.
   *
   * When `undefined` or `<= 0`, changes commit immediately (no debounce).
   */
  debounce?: number
}
export interface UseStateDebouncedHistoryControls<Raw, Serialized = Raw> {
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
   * Create a new history record immediately, bypassing the debounce —
   * cancels a pending debounced commit for the same change
   * (upstream: `ignorePrevAsyncUpdates` + the manual commit)
   */
  commit: () => void
  /**
   * Clear all the history and cancel a pending debounced commit
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
export interface UseStateDebouncedHistoryReturn<
  Raw,
  Serialized = Raw,
> extends UseStateDebouncedHistoryControls<Raw, Serialized> {
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
 * React port of VueUse's `useDebouncedRefHistory`.
 *
 * Map from @vueuse/core `useDebouncedRefHistory`
 * (`source/vueuse/packages/core/useDebouncedRefHistory/`). Shorthand for the
 * manual history machinery with a debounced filter: track the change history
 * of a state automatically, committing only after `debounce` milliseconds of
 * no changes — every change resets the window and only the last one inside
 * it is recorded once the window closes (no leading edge), providing undo and
 * redo functionality.
 *
 * The return object mirrors VueUse's `UseRefHistoryReturn` (refs flattened to
 * plain values):
 * `const { history, undo, redo, canUndo, canRedo, ... } = useStateDebouncedHistory([source, setSource])`.
 *
 * Adjustments from upstream (Vue reactivity does not translate 1:1):
 *
 * 1. Naming + return shape: `useDebouncedRefHistory` becomes
 *    `useStateDebouncedHistory` (`ref*` family → `useState*`, see
 *    `useStateManualHistory`) and the return object mirrors the upstream
 *    object (`{ history, undo, redo, ... }`) with refs flattened to plain
 *    values — `history` is a plain snapshots array and `undo` / `redo` are
 *    stable callbacks driving the state setter.
 * 2. Source: upstream tracks a writable Vue `Ref<Raw>` and commits through a
 *    watcher; React state lives in the component, so the source is the
 *    controlled tuple `[state, setState]` of an existing `useState`; commits are
 *    driven by an effect on state changes (upstream: `watchIgnorable`). The `deep`
 *    and `flush` watch options don't apply — replace the state instead of
 *    mutating it, a mutated object does not re-render and is invisible to the
 *    history (`clone` / custom `dump` still support mutation-style sources).
 * 3. Debounce filter: upstream composes `debounceFilter` from `@vueuse/shared`;
 *    the filter logic is inlined here (same algorithm as `useDebounceFn`, see
 *    `packages/shared/src/useDebounceFn.ts`). `debounce` is re-read on every
 *    change; `undefined` or `<= 0` commits immediately (upstream: `duration <= 0`
 *    invokes right away). Upstream's `maxWait` is not forwarded by the
 *    shorthand and so not ported.
 * 4. History operations supersede pending debounced commits: `undo` / `redo` /
 *    `reset` / `clear` and a manual `commit()` cancel a scheduled debounced
 *    commit (upstream's `ignorePrevAsyncUpdates` only cancels the queued
 *    watcher callback, so its debounce timer can still fire afterwards and
 *    re-record the restored record — the port keeps the history free of
 *    duplicates). A pending debounced commit still fires while tracking is
 *    paused, mirroring upstream.
 * 5. Same-tick changes: use `controls.setSource()` (value or updater form)
 *    for updates that must be visible to a manual `commit()` in the same
 *    tick — see `useStateManualHistory` for the full explanation.
 * 6. Storage: snapshots live in refs and a version counter triggers
 *    re-renders (upstream: reactive refs + `computed`); records are plain
 *    objects and timestamps use `Date.now()`. Upstream's `dispose` is not
 *    ported — disposal follows the component lifecycle and pending timers are
 *    cancelled on unmount. Upstream's `shouldCommit` is not ported.
 *
 * @example
 * const [count, setCount] = useState(0)
 * const { history, undo, redo, canUndo, canRedo } = useStateDebouncedHistory([count, setCount], { debounce: 1000 })
 *
 * setCount(1) // scheduled — committed once 1000ms pass without changes
 * undo() // count back to the previous record
 */
export declare function useStateDebouncedHistory<Raw, Serialized = Raw>(
  state: State<Raw>,
  options?: UseStateDebouncedHistoryOptions<Raw, Serialized>,
): UseStateDebouncedHistoryReturn<Raw, Serialized>
```
