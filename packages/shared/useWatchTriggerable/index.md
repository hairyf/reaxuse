---
category: Watch
---

# useWatchTriggerable

Watch that can be triggered manually

## Usage

A `watch` wrapper that supports manual triggering of `WatchCallback`, which returns an additional `trigger` to execute a `WatchCallback` immediately.

```tsx
import { useWatchTriggerable } from '@reaxuse/shared'
import { useState } from 'react'

const [source, setSource] = useState(0)

const { trigger, ignoreUpdates } = useWatchTriggerable(
  source,
  v => console.log(`Changed to ${v}!`),
)

setSource(1) // logs (after commit): Changed to 1!

// Execution of WatchCallback via `trigger` does not require waiting
trigger() // logs: Changed to 1!
```

### `onCleanup`

When you want to manually call a `watch` that uses the onCleanup parameter; simply taking the `WatchCallback` out and calling it doesn't make it easy to implement the `onCleanup` parameter.

Using `useWatchTriggerable` will solve this problem.

```tsx
import { useWatchTriggerable } from '@reaxuse/shared'
import { useState } from 'react'

const [source, setSource] = useState(0)

const { trigger } = useWatchTriggerable(
  source,
  async (v, _, onCleanup) => {
    let canceled = false
    onCleanup(() => canceled = true)

    await new Promise(resolve => setTimeout(resolve, 500))
    if (canceled)
      return

    console.log(`The value is "${v}"\n`)
  },
)

setSource(1) // no log
await trigger() // logs (after 500 ms): The value is "1"
```
