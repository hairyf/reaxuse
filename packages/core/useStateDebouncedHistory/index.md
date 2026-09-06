---
category: State
---

# useStateDebouncedHistory

Shorthand for the manual history machinery with a debounced filter — track the change history of a
state, committing only after `debounce` milliseconds of no changes — React port of VueUse's
[`useDebouncedRefHistory`](https://vueuse.org/core/useDebouncedRefHistory/).

**Mapping:** `useDebouncedRefHistory(ref, { debounce })` →
`useStateDebouncedHistory(state, setState, { debounce })`. The Vue `Ref` source becomes the
`(state, setState)` pair of an existing `useState`; the upstream `debounceFilter` is inlined, and
history records live in refs with a version counter re-rendering the component.

## Usage

This function takes a snapshot of your counter after 1000ms when the value of it starts to change.

```tsx
import { useStateDebouncedHistory } from '@reaxuse/core'
import { useState } from 'react'

const [count, setCount] = useState(0)
const [history, undo, redo, { canUndo, canRedo }] = useStateDebouncedHistory(count, setCount, { debounce: 1000 })

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
- **Debounce filter inlined** — upstream composes `debounceFilter` from `@vueuse/shared`; the same
  algorithm is inlined here (mirroring [`useDebounceFn`](/shared/useDebounceFn/)): every change
  resets the window and only the last change inside it is recorded once the window closes (no
  leading edge). The `debounce` value is re-read on every change, so passing the current value of a
  state works naturally.
- **History operations supersede pending debounced commits** — `undo` / `redo` / `reset` / `clear`
  and a manual `commit()` cancel a scheduled debounced commit. Upstream's `ignorePrevAsyncUpdates`
  only cancels the queued watcher callback, so its debounce timer can still fire afterwards and
  re-record the restored record; the port keeps the history free of duplicates. A pending debounced
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
import { useStateDebouncedHistory } from '@reaxuse/core'
import { useState } from 'react'

const [target, setTarget] = useState({ foo: 1, bar: 2 })
const [history, undo, redo, controls] = useStateDebouncedHistory(target, setTarget, { clone: true, debounce: 500 })

controls.setSource({ foo: 2, bar: 2 }) // committed once the window closes
```

### History Capacity

All history is kept by default (unlimited). Set the maximal amount of history with `capacity`:

```tsx
const [history, undo, redo, { clear }] = useStateDebouncedHistory(target, setTarget, {
  capacity: 15, // limit to 15 history records
})

clear() // explicitly clear all the history
```

<DemoContainer name="UseStateDebouncedHistory" />

## Type Declarations

History records reuse `UseRefHistoryRecord` (`{ snapshot, timestamp }`) from
`useStateManualHistory`.

```ts
export interface UseStateDebouncedHistoryOptions<Raw, Serialized = Raw> {
  capacity?: number
  clone?: boolean | ((value: Raw) => Raw)
  dump?: (value: Raw) => Serialized
  parse?: (value: Serialized) => Raw
  debounce?: number
}

export interface UseStateDebouncedHistoryControls<Raw, Serialized = Raw> {
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

export type UseStateDebouncedHistoryReturn<Raw, Serialized = Raw> = [
  history: UseRefHistoryRecord<Serialized>[],
  undo: () => void,
  redo: () => void,
  controls: UseStateDebouncedHistoryControls<Raw, Serialized>,
]

export function useStateDebouncedHistory<Raw, Serialized = Raw>(
  source: Raw,
  setSource: Dispatch<SetStateAction<Raw>>,
  options?: UseStateDebouncedHistoryOptions<Raw, Serialized>,
): UseStateDebouncedHistoryReturn<Raw, Serialized>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useDebouncedRefHistory/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDebouncedRefHistory/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDebouncedRefHistory/index.browser.test.ts) (tests mirrored in `packages/core/src/useStateDebouncedHistory.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDebouncedRefHistory/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useStateDebouncedHistory.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useStateDebouncedHistory.ts), docs + demo co-located in `packages/core/useStateDebouncedHistory/`

<Contributors name="useStateDebouncedHistory" />
