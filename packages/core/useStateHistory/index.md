---
category: State
---

# useStateHistory

Track the change history of a state automatically — every change commits a history record — also provides undo and redo functionality

## Usage

```tsx
import { useStateHistory } from '@reaxuse/core'
import { useState } from 'react'

const [count, setCount] = useState(0)
const { history, undo, redo, canUndo, canRedo } = useStateHistory([count, setCount])

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

This port carries the `adjustment` label — upstream reactivity does not translate 1:1, so the behavior
is reworked for React hooks:

- **Source as a `[state, setState]` pair** — upstream tracks a writable `Ref` that the hook
  watches and can write synchronously. React state lives in the component, so the source is passed
  in as the controlled tuple `[state, setState]`; commits are driven by an effect on state changes
  (upstream: `useWatchIgnorable`).
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
  use `setSource()` (value or updater form, a drop-in for `setState`) — see
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
const { history, setSource } = useStateHistory([target, setTarget], { clone: true })

setSource({ foo: 2, bar: 2 }) // committed immediately
```

A full featured clone function can be passed via `clone`, e.g.
[structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone):

```tsx
const stateHistory = useStateHistory([target, setTarget], { clone: structuredClone })
```

Instead of `clone`, custom `dump` / `parse` functions control serialization and parsing — useful to
store stringified snapshots:

```tsx
const stateHistory = useStateHistory([target, setTarget], {
  dump: JSON.stringify,
  parse: JSON.parse,
})
```

### History Capacity

All history is kept by default (unlimited). Set the maximal amount of history with `capacity`:

```tsx
const { history, clear } = useStateHistory([target, setTarget], {
  capacity: 15, // limit to 15 history records
})

clear() // explicitly clear all the history
```
