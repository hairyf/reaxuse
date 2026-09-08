---
category: Reactivity
related: syncRefs
---

# syncRef

Two-way refs synchronization between two React ref-like objects (`{ current }`) — React port of VueUse's [`syncRef`](https://vueuse.org/shared/syncRef/).

**Mapping:** upstream watches both refs and mirrors each change into the other (pausing the opposite watcher while writing, so a write never echoes back). React has no reactive system, so `syncRef` is implemented as a **hook** that runs inside a component: every render the effect compares each side's `current` against the last observed value (`Object.is`) and mirrors the changed side into the other — the cascade of the mount-time initial sync and the "absorb last observed on write" both reproduce upstream's pause/resume behavior. A side's mutation lands on the other side on the render that follows it (a bare `{ current }` write schedules no render by itself — see the maintainer notes on reaxuse issues #40 / #41). The returned `stop()` tears the synchronization down.

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

<DemoContainer name="SyncRef" />

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

## Type Declarations

```ts
export type SyncRefDirection = 'both' | 'ltr' | 'rtl'

export interface SyncRefTransform<L, R> {
  ltr: (left: L) => R
  rtl: (right: R) => L
}

export function syncRef<L, R, D extends SyncRefDirection = 'both'>(
  left: { current: L },
  right: { current: R },
  options?: SyncRefOptions<L, R, D>,
): () => void
```

## Source

- VueUse: [`packages/shared/syncRef`](https://github.com/vueuse/vueuse/tree/main/packages/shared/syncRef) — source [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/syncRef/index.ts), tests [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/syncRef/index.test.ts), demo [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/shared/syncRef/demo.vue)
- reaxuse: [`packages/shared/src/syncRef.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/syncRef.ts)

<Contributors name="syncRef" />
