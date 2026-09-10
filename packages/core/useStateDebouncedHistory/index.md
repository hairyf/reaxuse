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
