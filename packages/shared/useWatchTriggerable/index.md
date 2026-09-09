---
category: Watch
---

# useWatchTriggerable

Watch that can be triggered manually. The callback can be executed immediately via `trigger`, and particular updates to the source can be ignored via `ignoreUpdates`

## Usage

```tsx
import { useWatchTriggerable } from '@reaxuse/shared'

const { trigger, ignoreUpdates } = useWatchTriggerable(
  source,
  () => { console.log('changed!') },
)

setSource('next') // fires the callback
ignoreUpdates(() => setSource('reset')) // does not fire the callback
trigger() // fires the callback manually with the current value
```

### Ignoring particular updates

```tsx
import { useWatchTriggerable } from '@reaxuse/shared'

const { ignoreUpdates } = useWatchTriggerable(source, () => {
  console.log('changed!')
})

ignoreUpdates(() => {
  setSource(0) // does not fire the callback
})
```

### Trigger manually

```tsx
import { useWatchTriggerable } from '@reaxuse/shared'

const { trigger } = useWatchTriggerable(source, () => {
  console.log('changed!')
})

// fires the callback with the current value — synchronously at the call
// site, without waiting for React to commit
trigger()
```

Fire the callback once on mount with the current value:

```tsx
import { useWatchTriggerable } from '@reaxuse/shared'

useWatchTriggerable(source, () => console.log('changed!'), { immediate: true })
```
