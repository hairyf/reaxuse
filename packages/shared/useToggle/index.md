---
category: State
---

# useToggle

A Boolean (or value) toggler with controllable state support.

## Usage

```tsx
import { useToggle } from '@reaxuse/shared'
import { useState } from 'react'

const [value, toggle] = useToggle()

// A State<T> input can be controlled with a React state tuple.
const controlled = useState(false)
const [controlledValue, controlledToggle] = useToggle(controlled)

toggle() // false → true
toggle() // true → false
toggle(false) // force to false
toggle(c => !c) // functional update
```
