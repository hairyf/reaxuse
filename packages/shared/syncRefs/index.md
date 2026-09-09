---
category: Reactivity
related: syncRef
---

# syncRefs

Keep target ref(s) in sync with a source ref-like (`{ current }`)

## Usage

```tsx
import { syncRefs } from '@reaxuse/shared'

function Form() {
  const source = { current: 'hello' }
  const target = { current: 'target' }

  const stop = syncRefs(source, target)

  console.log(target.current) // hello

  source.current = 'foo' // then the component re-renders

  console.log(target.current) // foo

  // stop()
}
```

`syncRefs` is a hook: call it unconditionally at the top level of a component (or another hook). Pair plain ref-likes with a state bridge (e.g. `{ get current() { return state }, set current(v) { setState(v) } }`) or `useRef`-backed objects so the synced values become visible on the re-renders that follow them.

### Sync with multiple targets

You can also pass an array of ref-likes to sync.

```tsx
import { syncRefs } from '@reaxuse/shared'

const source = { current: 'hello' }
const target1 = { current: 'target1' }
const target2 = { current: 'target2' }

const stop = syncRefs(source, [target1, target2])

console.log(target1.current) // hello
console.log(target2.current) // hello

source.current = 'foo' // then the component re-renders

console.log(target1.current) // foo
console.log(target2.current) // foo

stop()
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
