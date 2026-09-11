---
category: State
---

# useStateThrottledHistory

Shorthand for `useStateHistory` with throttled filter.

## Usage

This function takes the first snapshot right after the counter's value was changed and the second with a delay of 1000ms.

```tsx
import { useStateThrottledHistory } from '@reause/core'
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
