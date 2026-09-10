---
category: Animation
---

# useTransition

Transition between values

## Usage

Define a source value to follow, and when changed the output will transition to the new value. If the source changes while a transition is in progress, a new transition will begin from where the previous one was interrupted.

```tsx
import { TransitionPresets, useTransition } from '@reaxuse/core'
import { useState } from 'react'

const [source, setSource] = useState(0)
const output = useTransition(source, {
  duration: 1000,
  easing: TransitionPresets.easeInOutCubic,
})

// each `setSource(next)` tweens `output` from its current value to `next`
setSource(100)
```

To control when a transition starts, set a `delay` value. To choreograph behavior around a transition, define `onStarted` or `onFinished` callbacks.

```tsx
import { useTransition } from '@reaxuse/core'
// ---cut---
const output = useTransition(source, {
  delay: 1000,
  onStarted() {
    // called after the transition starts
  },
  onFinished() {
    // called after the transition ends
  },
})
```

To stop transitioning, define a boolean `disabled` property. Be aware, this is not the same a `duration` of `0`. Disabled transitions track the source value **_synchronously_**. They do not respect a `delay`, and do not fire `onStarted` or `onFinished` callbacks.
