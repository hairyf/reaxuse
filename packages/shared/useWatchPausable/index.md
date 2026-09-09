---
category: Watch
---

# useWatchPausable

Pausable watch — pause and resume a watched value's updates

## Usage

Watch your own state value; the returned controls carry extra `pause()` and
`resume()` functions to control the callback.

```tsx
import { useWatchPausable } from '@reaxuse/shared'
import { useState } from 'react'

const [value, setValue] = useState('foo')
const { pause, resume } = useWatchPausable(
  value,
  v => console.log(`Changed to ${v}!`),
)

setValue('bar') // logs: Changed to bar!

pause()

setValue('foobar') // (nothing logged — the change is dropped while paused)

resume()

setValue('hello') // logs: Changed to hello!
```

Start paused and fire once on mount with `initialState` / `immediate`:

```tsx
import { useWatchPausable } from '@reaxuse/shared'
import { useState } from 'react'

const [value, setValue] = useState('foo')
const { isActive } = useWatchPausable(
  value,
  v => console.log(`Changed to ${v}!`),
  { initialState: 'paused' },
)
```

### Options

| Option         | Type                   | Default    | Description                                            |
| -------------- | ---------------------- | ---------- | ------------------------------------------------------ |
| `initialState` | `'active' \| 'paused'` | `'active'` | The initial state of the watcher                       |
| `immediate`    | `boolean`              | `false`    | Fire the callback once on mount with the current value |
