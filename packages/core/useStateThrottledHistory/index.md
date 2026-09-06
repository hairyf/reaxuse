---
category: State
---

# useStateThrottledHistory

Shorthand for the manual history machinery with a throttled filter — track the change history of a
state, committing at most once per throttle duration — React port of VueUse's
[`useThrottledRefHistory`](https://vueuse.org/core/useThrottledRefHistory/).

**Mapping:** `useThrottledRefHistory(ref, { throttle, trailing })` →
`useStateThrottledHistory(state, setState, { throttle, trailing })`. The Vue `Ref` source becomes the
`(state, setState)` pair of an existing `useState`; the upstream `throttleFilter` is inlined with the
leading edge fixed to `true`, and history records live in refs with a version counter re-rendering
the component.

## Usage

```tsx
import { useStateThrottledHistory } from '@reaxuse/core'
import { useState } from 'react'

const [count, setCount] = useState(0)
const [history, undo, redo, { canUndo, canRedo }] = useStateThrottledHistory(count, setCount, { throttle: 1000 })

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

### React adjustments

This port carries the `adjustment` label — Vue reactivity does not translate 1:1, so the behavior
is reworked for React hooks:

- **Source as a `[state, setState]` pair** — upstream tracks a writable Vue `Ref` that the hook
  watches and can write synchronously. React state lives in the component, so the source is passed
  in as the pair `(state, setState)`; commits are driven by an effect on state changes
  (upstream: `watchIgnorable`).
- **Watcher becomes an effect** — upstream's `deep` and `flush` watch options don't apply: replace
  the state instead of mutating it, a mutated object does not re-render and stays invisible to the
  history. The `clone` option and custom `dump` / `parse` still support mutation-style sources
  (see [`useStateManualHistory`](/core/useStateManualHistory/)).
- **Throttle filter inlined** — upstream composes `throttleFilter` from `@vueuse/shared`; the same
  algorithm is inlined here (mirroring [`useThrottleFn`](/shared/useThrottleFn/)), with the leading
  edge fixed to `true` since upstream's shorthand only forwards `throttle` and `trailing`. The
  `throttle` value is re-read on every change, so passing the current value of a state works
  naturally.
- **History operations supersede pending trailing commits** — `undo` / `redo` / `reset` / `clear`
  and a manual `commit()` cancel a scheduled trailing commit. Upstream's `ignorePrevAsyncUpdates`
  only cancels the queued watcher callback, so its trailing timer can still fire afterwards and
  re-record the restored record; the port keeps the history free of duplicates. A pending trailing
  commit still fires while tracking is paused (upstream behavior), and pending timers are cancelled
  on unmount.
- **Same-tick commits** — for updates that must be visible to a manual `commit()` in the same tick,
  use `controls.setSource()` (value or updater form, a drop-in for `setState`) — see
  [`useStateManualHistory`](/core/useStateManualHistory/) for the full explanation.
- **Not ported** — upstream's `dispose` (disposal follows the component lifecycle; use `clear()`)
  and `shouldCommit`.

### History of mutable objects

If you are going to mutate the source, pass a custom clone function or use `clone: true` — a
shortcut for a minimal clone function `x => JSON.parse(JSON.stringify(x))` used in both `dump` and
`parse`:

```tsx
import { useStateThrottledHistory } from '@reaxuse/core'
import { useState } from 'react'

const [target, setTarget] = useState({ foo: 1, bar: 2 })
const [history, undo, redo, controls] = useStateThrottledHistory(target, setTarget, { clone: true, throttle: 500 })

controls.setSource({ foo: 2, bar: 2 }) // committed on the leading edge
```

### History Capacity

All history is kept by default (unlimited). Set the maximal amount of history with `capacity`:

```tsx
const [history, undo, redo, { clear }] = useStateThrottledHistory(target, setTarget, {
  capacity: 15, // limit to 15 history records
})

clear() // explicitly clear all the history
```

<DemoContainer name="UseStateThrottledHistory" />

## Type Declarations

History records reuse `UseRefHistoryRecord` (`{ snapshot, timestamp }`) from
`useStateManualHistory`.

```ts
export interface UseStateThrottledHistoryOptions<Raw, Serialized = Raw> {
  capacity?: number
  clone?: boolean | ((value: Raw) => Raw)
  dump?: (value: Raw) => Serialized
  parse?: (value: Serialized) => Raw
  throttle?: number
  trailing?: boolean
}

export interface UseStateThrottledHistoryControls<Raw, Serialized = Raw> {
  source: Raw
  last: UseRefHistoryRecord<Serialized>
  undoStack: UseRefHistoryRecord<Serialized>[]
  redoStack: UseRefHistoryRecord<Serialized>[]
  canUndo: boolean
  canRedo: boolean
  isTracking: boolean
  setSource: Dispatch<SetStateAction<Raw>>
  commit: () => void
  clear: () => void
  reset: () => void
  pause: () => void
  resume: (commitNow?: boolean) => void
  batch: (fn: (cancel: () => void) => void) => void
}

export type UseStateThrottledHistoryReturn<Raw, Serialized = Raw> = [
  history: UseRefHistoryRecord<Serialized>[],
  undo: () => void,
  redo: () => void,
  controls: UseStateThrottledHistoryControls<Raw, Serialized>,
]

export function useStateThrottledHistory<Raw, Serialized = Raw>(
  source: Raw,
  setSource: Dispatch<SetStateAction<Raw>>,
  options?: UseStateThrottledHistoryOptions<Raw, Serialized>,
): UseStateThrottledHistoryReturn<Raw, Serialized>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useThrottledRefHistory/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useThrottledRefHistory/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useThrottledRefHistory/index.browser.test.ts) (tests mirrored in `packages/core/src/useStateThrottledHistory.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useThrottledRefHistory/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useStateThrottledHistory.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useStateThrottledHistory.ts), docs + demo co-located in `packages/core/useStateThrottledHistory/`

<Contributors name="useStateThrottledHistory" />
