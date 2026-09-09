---
category: Browser
---

# useEventListener

Use EventListener with ease. Register using [`addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) on mounted, and [`removeEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener) automatically on unmounted

## Usage

```tsx
import { useEventListener } from '@reaxuse/core'

useEventListener(document, 'visibilitychange', (evt) => {
  console.log(evt)
})
```

### Default Target

When the target is omitted, it defaults to `window`:

```tsx
import { useEventListener } from '@reaxuse/core'

// Listens on window
useEventListener('resize', (evt) => {
  console.log(evt)
})
```

### Reactive Target

You can pass a ref (e.g. from `useRef`) as the event target — `useEventListener` will unregister the previous event and register the new one when the resolved target changes:

```tsx
import { useEventListener } from '@reaxuse/core'
import { useRef } from 'react'

const element = useRef<HTMLDivElement>(null)
useEventListener(element, 'keydown', (e) => {
  console.log(e.key)
})
```

### Multiple Events

You can pass an array of events to listen to multiple events at once:

```tsx
useEventListener(document, ['mouseenter', 'mouseleave'], (evt) => {
  console.log(evt.type)
})
```

### Multiple Targets

You can also pass an array of targets:

```tsx
const buttons = document.querySelectorAll('button')
useEventListener(buttons, 'click', (evt) => {
  console.log('Button clicked')
})
```

### Cleanup

Returns a cleanup function to manually unregister the listeners:

```tsx
const cleanup = useEventListener(document, 'keydown', (e) => {
  console.log(e.key)
})

cleanup() // This will unregister the listeners.
```

Unlike VueUse — where calling the hook outside a component lifecycle (SSR) errors — reaxuse's
`useEventListener` is SSR-safe: nothing touches `window` during render, the default `window` target
only resolves when `window` is defined, and binding happens in the mount effect.
