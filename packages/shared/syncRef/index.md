---
category: Reactivity
related: syncRefs
---

# syncRef

Two-way refs synchronization between two React ref-like objects (`{ current }`)

## Usage

```tsx
import { syncRef } from '@reaxuse/shared'

function App() {
  const a = { current: 'a' }
  const b = { current: 'b' }

  const stop = syncRef(a, b)

  console.log(a.current) // a

  b.current = 'foo' // then the component re-renders

  console.log(a.current) // foo

  a.current = 'bar' // then the component re-renders

  console.log(b.current) // bar

  // stop()
}
```

`syncRef` is a hook: call it unconditionally at the top level of a component (or another hook). Pair plain ref-likes with a state bridge (e.g. `{ get current() { return state }, set current(v) { setState(v) } }`) or `useRef`-backed objects so the synced values become visible on the re-renders that follow them.

### One directional

```tsx
import { syncRef } from '@reaxuse/shared'

// right follows left
const stop = syncRef(a, b, { direction: 'ltr' })

// left follows right
const stop = syncRef(a, b, { direction: 'rtl' })
```

### Custom Transform

```tsx
import { syncRef } from '@reaxuse/shared'

const a = { current: 10 }
const b = { current: 2 }

const stop = syncRef(a, b, {
  transform: {
    ltr: left => left * 2,
    rtl: right => right / 2,
  },
})

console.log(a.current) // 10
console.log(b.current) // 20
```

## Options

The options mirror upstream's `SyncRefOptions`. `flush` and `deep` are accepted for signature compatibility but have no React behavior — effects always run after commit, and only `current` replacement (not nested mutation) can be observed.

```ts
export interface SyncRefOptions<L, R, D extends SyncRefDirection = 'both'> {
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
  /**
   * Direction of syncing
   *
   * @default 'both'
   */
  direction?: D
  /**
   * Value convertors applied on the way to the other side
   */
  transform?: Partial<SyncRefTransform<L, R>>
}
```
