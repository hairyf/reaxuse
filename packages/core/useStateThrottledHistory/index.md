---
category: State
---

# useStateThrottledHistory

Shorthand for the manual history machinery with a throttled filter — track the change history of a state, committing at most once per throttle duration

## Usage

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

### React adjustments

This port carries the `adjustment` label — Vue reactivity does not translate 1:1, so the behavior
is reworked for React hooks:

- **Source as a `[state, setState]` pair** — upstream tracks a writable Vue `Ref` that the hook
  watches and can write synchronously. React state lives in the component, so the source is passed
  in as the controlled tuple `[state, setState]`; commits are driven by an effect on state changes
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
  use `setSource()` (value or updater form, a drop-in for `setState`) — see
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
const { history, setSource } = useStateThrottledHistory([target, setTarget], { clone: true, throttle: 500 })

setSource({ foo: 2, bar: 2 }) // committed on the leading edge
```

### History Capacity

All history is kept by default (unlimited). Set the maximal amount of history with `capacity`:

```tsx
const { history, clear } = useStateThrottledHistory([target, setTarget], {
  capacity: 15, // limit to 15 history records
})

clear() // explicitly clear all the history
```
