---
category: Sensors
---

# useMouse

Reactive mouse position

## Usage

```tsx
import { useMouse } from '@reaxuse/core'

const { x, y, sourceType } = useMouse()
```

Touch is enabled by default. To only detect mouse changes, set `touch` to `false`.
The `dragover` event is used to track mouse position while dragging.

```tsx
const { x, y } = useMouse({ touch: false })
```

## Custom Extractor

It's also possible to provide a custom extractor function to get the position from the event.

```tsx
import type { UseMouseEventExtractor } from '@reaxuse/core'
import { useMouse } from '@reaxuse/core'
import { useRef } from 'react'

const parentRef = useRef<HTMLDivElement>(null)

const extractor: UseMouseEventExtractor = event => (
  event instanceof MouseEvent
    ? [event.offsetX, event.offsetY]
    : null
)

const { x, y, sourceType } = useMouse({ target: parentRef, type: extractor })
```
