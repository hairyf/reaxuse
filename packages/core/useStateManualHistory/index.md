---
title: useStateManualHistory
category: State
description: Manually track the change history of a state when the user calls commit()
---

# useStateManualHistory

Manually track the change history of a state when the user calls `commit()`, also provides undo and redo functionality

## Usage

```tsx
import { useStateManualHistory } from '@reaxuse/core'
import { useState } from 'react'

const [count, setCount] = useState(0)
const { history, commit, undo, redo, canUndo, canRedo, setSource } = useStateManualHistory([count, setCount])

setSource(count + 1)
commit()

console.log(history)
/* [
  { snapshot: 1, timestamp: 1601912898062 },
  { snapshot: 0, timestamp: 1601912898061 }
] */

undo() // count back to 0
```

### React adjustments

This port carries the `adjustment` label — upstream reactivity does not translate 1:1, so the behavior
is reworked for React hooks:

- **Source as a `[state, setState]` pair** — upstream tracks a writable `Ref` that the hook can
  read and write synchronously. React state lives in the component, so the source is passed in as
  the controlled tuple `[state, setState]`; upstream's `setSource` option is superseded by the
  tuple's setter.
- **Same-tick commits** — React `setState` is asynchronous. Calling `commit()` right after your own
  `setState` would snapshot the previous rendered value. For updates you want to commit in the same
  tick, use `setSource()` (value or updater form, a drop-in for `setState`): it applies
  the new value synchronously and forwards it to your state setter, so `commit()` always snapshots
  the newest value. Commits after a plain `setState` from a previous render work as usual.
- **Storage and reactivity** — history records live in refs; a version counter triggers re-renders
  (upstream: reactive refs + derived values). Records are plain objects — upstream's `markRaw` has no
  React equivalent to port, and timestamps use `Date.now()` (upstream: `timestamp()`).
- **Mutable sources** — React state is normally replaced instead of mutated; the `clone` option and
  custom `dump` / `parse` still support mutation-style sources, mirroring upstream.

### History of mutable objects

If you are going to mutate the source, pass a custom clone function or use `clone: true` — a
shortcut for a minimal clone function `x => JSON.parse(JSON.stringify(x))` used in both `dump` and
`parse`.

```tsx
import { useStateManualHistory } from '@reaxuse/core'
import { useState } from 'react'

const [target, setTarget] = useState({ foo: 1, bar: 2 })
const { history, commit, setSource } = useStateManualHistory([target, setTarget], { clone: true })

// prefer replacing the state in React…
setSource({ foo: 2, bar: 2 })
commit()

// …but a mutated source is snapshotted correctly as well
target.foo += 1
commit()
```

A full featured clone function can be passed via `clone`, e.g.
[structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone):

```tsx
const stateHistory = useStateManualHistory([target, setTarget], { clone: structuredClone })
```

Instead of `clone`, custom `dump` / `parse` functions control serialization and parsing — useful to
store stringified snapshots:

```tsx
const stateHistory = useStateManualHistory([target, setTarget], {
  dump: JSON.stringify,
  parse: JSON.parse,
})
```

### History Capacity

All history is kept by default (unlimited). Set the maximal amount of history with `capacity`:

```tsx
const { history, commit, clear } = useStateManualHistory([target, setTarget], {
  capacity: 15, // limit to 15 history records
})

clear() // explicitly clear all the history
```
