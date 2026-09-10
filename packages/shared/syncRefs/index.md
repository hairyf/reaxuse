---
category: Reactivity
related: syncRef
---

# syncRefs

Keep target ref(s) in sync with a source value

## Usage

```tsx
import { syncRefs } from '@reaxuse/shared'
import { useState } from 'react'

function Form() {
  const [source, setSource] = useState('hello')
  const target = { current: 'target' }

  const stop = syncRefs(source, target)

  // the sync effect runs after the commit, not during render — at this point
  // target.current is still 'target'; once the component has mounted it
  // becomes 'hello'

  setSource('foo') // the re-render's effect copies 'foo' into target.current

  // stop()
}
```

`syncRefs` is a hook: call it unconditionally at the top level of a component (or another hook). The `source` is a plain read-only value — pass the state value, or `ref.current` if you keep it in a ref; the effect compares it after every commit and writes changes into each target's `.current`. Targets are writable ref-likes; pair plain ref-likes with a state bridge (e.g. `{ get current() { return state }, set current(v) { setState(v) } }`) or `useRef`-backed objects so the synced values become visible on the re-renders that follow them.

### Sync with multiple targets

You can also pass an array of ref-likes to sync.

```tsx
import { syncRefs } from '@reaxuse/shared'
import { useState } from 'react'

function Form() {
  const [source, setSource] = useState('hello')
  const target1 = { current: 'target1' }
  const target2 = { current: 'target2' }

  const stop = syncRefs(source, [target1, target2])

  // the sync effect runs after the commit — target1/target2 are still
  // 'target1'/'target2' here and become 'hello' once the component has mounted

  setSource('foo') // the re-render's effect copies 'foo' into both targets

  stop()
}
```

## Options

The options mirror upstream's `SyncRefsOptions`. `flush` and `deep` are accepted for signature compatibility but have no React behavior — effects always run after commit, and only `current` replacement (not nested mutation) can be observed.

```ts
export interface SyncRefsOptions {
  /**
   * Timing for syncing, same as watch's flush option
   *
   * @default 'sync'
   */
  flush?: 'sync' | 'pre' | 'post'
  /**
   * Watch deeply
   *
   * @default false
   */
  deep?: boolean
  /**
   * Sync values immediately
   *
   * @default true
   */
  immediate?: boolean
}
```
