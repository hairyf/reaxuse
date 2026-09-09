---
category: Sensors
---

# useElementHover

Reactive element's hover state

## Usage

```tsx
import { useElementHover } from '@reaxuse/core'
import { useRef } from 'react'

const myHoverableElement = useRef<HTMLButtonElement>(null)
const isHovered = useElementHover(myHoverableElement)
```

```tsx
<button ref={myHoverableElement}>
  {isHovered ? 'Thank you!' : 'Hover me'}
</button>
```

You can also provide hover options:

```tsx
import { useElementHover } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLButtonElement>(null)
const isHovered = useElementHover(el, { delayEnter: 200, delayLeave: 600 })

// leave detection is also supported on elements being removed from the DOM
const isHoveredWithRemoval = useElementHover(el, { triggerOnRemoval: true })
```
