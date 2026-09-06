---
category: State
---

# useStateHistory

Track the change history of a state automatically — every change commits a history record — also
provides undo and redo functionality — React port of VueUse's
[`useRefHistory`](https://vueuse.org/core/useRefHistory/).

**Mapping:** `useRefHistory(ref)` → `useStateHistory(state, setState)`. The Vue `Ref` source becomes
the `(state, setState)` pair of an existing `useState`; commits are driven by an effect on state
changes (upstream: `watchIgnorable`), and history records live in refs with a version counter
re-rendering the component.

## Usage

```tsx
import { useStateHistory } from '@reaxuse/core'
import { useState } from 'react'

const [count, setCount] = useState(0)
const [history, undo, redo, { canUndo, canRedo }] = useStateHistory(count, setCount)

setCount(1) // every change commits a history record

console.log(history)
/* [
  { snapshot: 1, timestamp: 1601912898062 },
  { snapshot: 0, timestamp: 1601912898061 }
] */

undo() // count back to the previous record
redo() // count forward again
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
  (see [`useStateManualHistory`](/core/useStateManualHistory/)). Multiple state updates in the same
  tick render once and collapse into a single commit carrying the final value (upstream auto
  batching with the default `flush: 'pre'`); there is no per-assignment `flush: 'sync'` timing.
- **Event filter not ported** — upstream composes `pausableFilter(eventFilter)`; only the pausable
  half is ported (`pause` / `resume` / `isTracking`). The generic `eventFilter` option has no React
  translation — use `useStateThrottledHistory` for time-based throttling of the commits.
- **Restores never record** — `undo` / `redo` / `reset` and a manual `commit()` / `batch()` mark
  the applied value and the following effect run carrying it is skipped (upstream:
  `ignoreUpdates` plus `ignorePrevAsyncUpdates`).
- **Same-tick commits** — for updates that must be visible to a manual `commit()` in the same tick,
  use `controls.setSource()` (value or updater form, a drop-in for `setState`) — see
  [`useStateManualHistory`](/core/useStateManualHistory/) for the full explanation.
- **Not ported** — upstream's `dispose` (disposal follows the component lifecycle; use `clear()`).

### History of mutable objects

If you are going to mutate the source, pass a custom clone function or use `clone: true` — a
shortcut for a minimal clone function `x => JSON.parse(JSON.stringify(x))` used in both `dump` and
`parse`:

```tsx
import { useStateHistory } from '@reaxuse/core'
import { useState } from 'react'

const [target, setTarget] = useState({ foo: 1, bar: 2 })
const [history, undo, redo, controls] = useStateHistory(target, setTarget, { clone: true })

controls.setSource({ foo: 2, bar: 2 }) // committed immediately
```

A full featured clone function can be passed via `clone`, e.g.
[structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone):

```tsx
const stateHistory = useStateHistory(target, setTarget, { clone: structuredClone })
```

Instead of `clone`, custom `dump` / `parse` functions control serialization and parsing — useful to
store stringified snapshots:

```tsx
const stateHistory = useStateHistory(target, setTarget, {
  dump: JSON.stringify,
  parse: JSON.parse,
})
```

### History Capacity

All history is kept by default (unlimited). Set the maximal amount of history with `capacity`:

```tsx
const [history, undo, redo, { clear }] = useStateHistory(target, setTarget, {
  capacity: 15, // limit to 15 history records
})

clear() // explicitly clear all the history
```

<DemoContainer name="UseStateHistory" />

## Type Declarations

History records reuse `UseRefHistoryRecord` (`{ snapshot, timestamp }`) from
[`useStateManualHistory`](/core/useStateManualHistory/).

```ts
export interface UseStateHistoryOptions<Raw, Serialized = Raw> {
  capacity?: number
  clone?: boolean | ((value: Raw) => Raw)
  dump?: (value: Raw) => Serialized
  parse?: (value: Serialized) => Raw
  shouldCommit?: (oldValue: Raw, newValue: Raw) => boolean
}

export interface UseStateHistoryControls<Raw, Serialized = Raw> {
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

export type UseStateHistoryReturn<Raw, Serialized = Raw> = [
  history: UseRefHistoryRecord<Serialized>[],
  undo: () => void,
  redo: () => void,
  controls: UseStateHistoryControls<Raw, Serialized>,
]

export function useStateHistory<Raw, Serialized = Raw>(
  source: Raw,
  setSource: Dispatch<SetStateAction<Raw>>,
  options?: UseStateHistoryOptions<Raw, Serialized>,
): UseStateHistoryReturn<Raw, Serialized>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useRefHistory/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useRefHistory/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useRefHistory/index.browser.test.ts) (tests mirrored in `packages/core/src/useStateHistory.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useRefHistory/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useStateHistory.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useStateHistory.ts), docs + demo co-located in `packages/core/useStateHistory/`

<Contributors name="useStateHistory" />
