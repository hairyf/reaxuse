---
category: Sensors
---

# useFocusWithin

Reactive utility to track if an element or one of its descendants has focus. It is meant to match the behavior of the `:focus-within` CSS pseudo-class. A common use case would be on a form element to see if any of its inputs currently have focus.

## Usage

```tsx
import { useFocusWithin } from '@reaxuse/core'
import { useRef } from 'react'

const target = useRef<HTMLFormElement>(null)
const { focused } = useFocusWithin(target)

// `focused` is true while the form or any input inside it has focus
```
