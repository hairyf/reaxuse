---
category: Sensors
---

# useIdle

Tracks whether the user is being inactive — React port of VueUse's [`useIdle`](https://vueuse.org/core/useIdle/).

**Mapping:** upstream returns an object of shallow refs (`idle`, `lastActive`, plus the `Stoppable`
controls `isPending`/`stop`/`start`) → a plain object of plain values held in `useState`s. The window
`mousemove`/`mousedown`/`resize`/`keydown`/`touchstart`/`wheel` listeners and the document
`visibilitychange` listener attach in a mount `useEffect` (passive), removed on unmount; every event
flows through the 50ms `throttleFilter`, refreshing `lastActive` and restarting the idle timer —
after `timeout` ms without activity `idle` flips to `true`. SSR-safe — no `window` access during
render, so the server renders the defaults and nothing starts.

## Usage

```tsx
import { useIdle } from '@reaxuse/core'

const { idle, lastActive, reset } = useIdle(5 * 60 * 1000) // 5 min

console.log(idle) // true or false
```

`reset()` restarts the idle timer without touching `lastActive`.

<DemoContainer name="UseIdle" />

## Type Declarations

```ts
export interface UseIdleOptions extends ConfigurableWindow {
  /**
   * Event names that listen to for detected user activity
   *
   * @default ['mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel']
   */
  events?: (keyof WindowEventMap)[]
  /**
   * Listen for document visibility change
   *
   * @default true
   */
  listenForVisibilityChange?: boolean
  /**
   * Initial state of the idle value
   *
   * @default false
   */
  initialState?: boolean
  /**
   * Filter for if events should to be received (upstream:
   * `ConfigurableEventFilter`).
   *
   * @default throttleFilter(50)
   */
  eventFilter?: EventFilter
}

export interface UseIdleReturn {
  idle: boolean
  lastActive: number
  isPending: boolean
  reset: () => void
  stop: () => void
  start: () => void
}

export function useIdle(timeout?: number, options?: UseIdleOptions): UseIdleReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useIdle/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useIdle/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useIdle/index.browser.test.ts) (mirrored in `useIdle.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useIdle/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useIdle.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useIdle.ts), docs + demo co-located in `packages/core/useIdle/`

<Contributors name="useIdle" />
