---
category: Animation
---

# useIntervalFn

Wrapper for `setInterval` with controls — React port of VueUse's [`useIntervalFn`](https://vueuse.org/shared/useIntervalFn/).

**Mapping:** upstream accepts `MaybeRefOrGetter<number>` for the interval — this port accepts a
plain `number`. `isActive` is a boolean state (upstream: a readonly ref); the timer is scheduled
in a mount effect (upstream starts synchronously during setup) and cleared on unmount via effect
cleanup; changing the interval while active restarts the timer (upstream: a `watch` on the
interval); the latest callback, interval and options are kept in refs so every tick and restart
uses the newest ones.

## Usage

```tsx
import { useIntervalFn } from '@reaxuse/shared'

const { isActive, pause, resume } = useIntervalFn(() => {
  /* ... */
}, 1000)
```

<DemoContainer name="UseIntervalFn" />

## Type Declarations

```ts
export interface UseIntervalFnOptions {
  /**
   * Start the timer automatically when the component mounts
   *
   * @default true
   */
  immediate?: boolean

  /**
   * Execute the callback immediately after calling `resume`
   *
   * @default false
   */
  immediateCallback?: boolean
}

export interface UseIntervalFnReturn {
  /**
   * Whether the timer is currently active
   */
  isActive: boolean

  /**
   * Pause the timer
   */
  pause: () => void

  /**
   * Resume the timer (restarts it with the current interval)
   */
  resume: () => void
}

export function useIntervalFn(
  cb: Fn,
  interval?: number,
  options?: UseIntervalFnOptions,
): UseIntervalFnReturn
```

## Source

- VueUse: [`packages/shared/useIntervalFn`](https://github.com/vueuse/vueuse/tree/main/packages/shared/useIntervalFn)
- VueUse source: [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useIntervalFn/index.ts)
- VueUse tests: [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useIntervalFn/index.test.ts)
- reaxuse: [`packages/shared/src/useIntervalFn.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useIntervalFn.ts)

<Contributors name="useIntervalFn" />
