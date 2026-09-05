---
title: useStateManualHistory
category: State
description: Manually track the change history of a state when the user calls commit()
---

# useStateManualHistory

Manually track the change history of a state when the user calls `commit()`, also provides undo and redo functionality —
React port of VueUse's [`useManualRefHistory`](https://vueuse.org/core/useManualRefHistory/).

**Mapping:** `useManualRefHistory(ref)` → `useStateManualHistory(state, setState)`. The Vue `Ref`
source becomes the `(state, setState)` pair of an existing `useState`; snapshots live in refs and a
version counter re-renders the component.

## Usage

```tsx
import { useStateManualHistory } from '@reaxuse/core'
import { useState } from 'react'

const [count, setCount] = useState(0)
const [history, commit, { undo, redo, canUndo, canRedo }] = useStateManualHistory(count, setCount)

setCount(count + 1)
commit()

console.log(history)
/* [
  { snapshot: 1, timestamp: 1601912898062 },
  { snapshot: 0, timestamp: 1601912898061 }
] */

undo() // count back to 0
```

### React adjustments

This port carries the `adjustment` label — Vue reactivity does not translate 1:1, so the behavior
is reworked for React hooks:

- **Source as a `[state, setState]` pair** — upstream tracks a writable Vue `Ref` that the hook can
  read and write synchronously. React state lives in the component, so the source is passed in as
  the pair `(state, setState)`; upstream's `setSource` option is superseded by the positional
  `setSource` argument.
- **Same-tick commits** — React `setState` is asynchronous. Calling `commit()` right after your own
  `setState` would snapshot the previous rendered value. For updates you want to commit in the same
  tick, use `controls.setSource()` (value or updater form, a drop-in for `setState`): it applies
  the new value synchronously and forwards it to your `setSource`, so `commit()` always snapshots
  the newest value. Commits after a plain `setState` from a previous render work as usual.
- **Storage and reactivity** — history records live in refs; a version counter triggers re-renders
  (upstream: reactive refs + `computed`). Records are plain objects — upstream's `markRaw` has no
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
const [history, commit, controls] = useStateManualHistory(target, setTarget, { clone: true })

// prefer replacing the state in React…
controls.setSource({ foo: 2, bar: 2 })
commit()

// …but a mutated source is snapshotted correctly as well
target.foo += 1
commit()
```

A full featured clone function can be passed via `clone`, e.g.
[structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone):

```tsx
const refHistory = useStateManualHistory(target, setTarget, { clone: structuredClone })
```

Instead of `clone`, custom `dump` / `parse` functions control serialization and parsing — useful to
store stringified snapshots:

```tsx
const refHistory = useStateManualHistory(target, setTarget, {
  dump: JSON.stringify,
  parse: JSON.parse,
})
```

### History Capacity

All history is kept by default (unlimited). Set the maximal amount of history with `capacity`:

```tsx
const [history, commit, { clear }] = useStateManualHistory(target, setTarget, {
  capacity: 15, // limit to 15 history records
})

clear() // explicitly clear all the history
```

<DemoContainer name="UseStateManualHistory" />

## Type Declarations

```ts
export interface UseRefHistoryRecord<T> {
  snapshot: T
  timestamp: number
}

export interface UseStateManualHistoryOptions<Raw, Serialized = Raw> {
  capacity?: number
  clone?: boolean | ((value: Raw) => Raw)
  dump?: (value: Raw) => Serialized
  parse?: (value: Serialized) => Raw
}

export interface UseStateManualHistoryControls<Raw, Serialized = Raw> {
  source: Raw
  last: UseRefHistoryRecord<Serialized>
  undoStack: UseRefHistoryRecord<Serialized>[]
  redoStack: UseRefHistoryRecord<Serialized>[]
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  clear: () => void
  reset: () => void
  setSource: Dispatch<SetStateAction<Raw>>
}

export type UseStateManualHistoryReturn<Raw, Serialized = Raw> = [
  history: UseRefHistoryRecord<Serialized>[],
  commit: () => void,
  controls: UseStateManualHistoryControls<Raw, Serialized>,
]

export function useStateManualHistory<Raw, Serialized = Raw>(
  source: Raw,
  setSource: Dispatch<SetStateAction<Raw>>,
  options?: UseStateManualHistoryOptions<Raw, Serialized>,
): UseStateManualHistoryReturn<Raw, Serialized>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useManualRefHistory/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useManualRefHistory/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useManualRefHistory/index.browser.test.ts) (tests mirrored in `packages/core/src/useStateManualHistory.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useManualRefHistory/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useStateManualHistory.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useStateManualHistory.ts), docs + demo co-located in `packages/core/useStateManualHistory/`

<Contributors name="useStateManualHistory" />
