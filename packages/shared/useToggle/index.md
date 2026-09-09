---
category: State
---

# useToggle

A Boolean (or value) toggler

## Usage

```tsx
import { useToggle } from '@reaxuse/shared'

const [value, toggle] = useToggle()

toggle() // false → true
toggle() // true → false
toggle(false) // force to false
toggle(c => !c) // functional update
```
