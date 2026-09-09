---
category: Watch
---

# useWatchIgnorable

Extended watch that returns `ignoreUpdates(updater)` / `ignorePrevAsyncUpdates()` / `stop` to ignore particular updates to the source

## Usage

```tsx
import { useWatchIgnorable } from '@reaxuse/shared'

const [source, setSource] = useState('foo')

const { stop, ignoreUpdates } = useWatchIgnorable(
  source,
  v => console.log(`Changed to ${v}!`),
)

setSource('bar') // logs: Changed to bar!

ignoreUpdates(() => {
  setSource('foobar')
}) // (nothing logged)

setSource('hello') // logs: Changed to hello!

ignoreUpdates(() => {
  setSource('ignored')
})
setSource('logged') // logs: Changed to logged!
```

`ignorePrevAsyncUpdates()` ignores the changes made since the last time the callback
fired — as long as no other changes follow:

```tsx
const { ignorePrevAsyncUpdates } = useWatchIgnorable(
  source,
  v => console.log(`Changed to ${v}!`),
)

setSource('good')
setSource('by')
ignorePrevAsyncUpdates() // (nothing logged for 'by')

setSource('prev')
ignorePrevAsyncUpdates()
setSource('after') // logs: Changed to after!
```
