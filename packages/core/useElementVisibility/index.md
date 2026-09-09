---
category: Elements
---

# useElementVisibility

Tracks the visibility of an element within the viewport

## Usage

```tsx
import { useElementVisibility } from '@reaxuse/core'
import { useRef } from 'react'

const target = useRef<HTMLDivElement | null>(null)
const targetIsVisible = useElementVisibility(target)
```

```tsx
const target2 = useRef<HTMLDivElement | null>(null)
const target2IsVisible = useElementVisibility(target2, {
  threshold: 1.0, // 100% visible
})
```

### rootMargin

If you wish to trigger your callback sooner before the element is fully visible, you can use
the `rootMargin` option (See [MDN IntersectionObserver/rootMargin](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin)).

```ts
const targetIsVisible = useElementVisibility(target, {
  rootMargin: '0px 0px 100px 0px',
})
```

### threshold

If you want to control the percentage of the visibility required to update the value, you can use the `threshold` option (See [MDN IntersectionObserver/threshold](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver#threshold)).

```ts
const targetIsVisible = useElementVisibility(target, {
  threshold: 1.0, // 100% visible
})
```
