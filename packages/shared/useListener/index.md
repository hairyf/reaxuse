---
category: State
---

# useListener

Bind a callback to a listener registration function returned by a reause hook, with automatic cleanup on unmount.

## Usage

```tsx
import { createEventHook, useListener } from '@reause/shared'

const resultEvent = createEventHook<Response>()

useListener(resultEvent.on, (response) => {
  console.log(response)
})

// elsewhere — deliver an event:
resultEvent.trigger(response)
```

`createEventHook`'s `on` returns an `{ off }` object, so when the component
unmounts the listener is automatically unregistered — listeners never leak
and callbacks never fire after the component is gone. (An `on` that returns
nothing provides no cleanup, so that guarantee cannot be made.)

The callback is kept in a ref: changing `cb` across renders does not
re-register the listener — the latest callback is used by the
already-registered listener. Only when `on` itself changes (a new hook
instance) does the effect re-run, unregistering the old listener and
registering the new one.
