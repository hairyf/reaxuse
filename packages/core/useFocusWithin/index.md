---
category: Sensors
---

# useFocusWithin

Reactive utility to track if an element or one of its descendants has focus

## Usage

```tsx
import { useFocusWithin } from '@reaxuse/core'
import { useRef } from 'react'

const target = useRef<HTMLFormElement>(null)
const { focused } = useFocusWithin(target)

// `focused` is true while the form or any input inside it has focus
```
