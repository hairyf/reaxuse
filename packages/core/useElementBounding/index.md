---
category: Elements
---

# useElementBounding

Reactive [bounding box](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) of an HTML element

## Usage

```tsx
import { useElementBounding } from '@reause/core'
import { useRef } from 'react'

const el = useRef<HTMLDivElement | null>(null)
const { x, y, top, right, bottom, left, width, height } = useElementBounding(el)
```

The bounding box updates as the element is resized, scrolled or restyled:

```tsx
import { useElementBounding } from '@reause/core'
import { useRef } from 'react'

const el = useRef<HTMLTextAreaElement | null>(null)
const { width, height, update } = useElementBounding(el)

// <div>
//   <textarea ref={el} style={{ resize: 'both', overflow: 'hidden' }} />
//   Width: {width}, Height: {height}
//   <button onClick={update}>Re-measure</button>
// </div>
```

Call `update()` to re-measure on demand, e.g. after a synchronous layout change.
