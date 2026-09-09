---
category: Component
---

# unrefElement

Get the DOM element of a React ref-like object or a plain element

## Usage

```tsx
import { unrefElement } from '@reaxuse/core'
import { useEffect, useRef } from 'react'

const div = useRef<HTMLDivElement>(null)

useEffect(() => {
  console.log(unrefElement(div)) // the <div> element (div.current)
})
```

A plain element works the same way:

```tsx
console.log(unrefElement(div.current)) // the <div> element
```

## React divergences

- **Callback refs are not supported.** VueUse accepts getters (`MaybeRefOrGetter`), but React's
  callback ref (`ref={(el) => { ... }}`) is a function and `toValue` _invokes_ functions instead of
  resolving them — a callback ref would be called with no arguments and never yield a DOM node.
  `unrefElement` therefore accepts only an element or a `{ current }` ref object (`RefObject`); the
  `RefCallback` arm is rejected at the type level. Use `useRef` when you need to pass a ref.
- **No Vue component instances.** React refs hold DOM nodes directly, so upstream's `$el` unwrap and
  the `VueInstance` members of `MaybeElement` have no equivalent here.
