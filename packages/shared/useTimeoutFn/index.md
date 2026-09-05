---
category: Animation
---

# useTimeoutFn

Wrapper for `setTimeout` with controls — React port of VueUse's [`useTimeoutFn`](https://vueuse.org/shared/useTimeoutFn/).

**Mapping:** upstream accepts `MaybeRefOrGetter<number>` for the interval — this port accepts a
plain `number`. `isPending` becomes a boolean state (upstream: a readonly ref) initialized to
`immediate`; the timer is scheduled in a mount effect (upstream starts synchronously during setup)
and a pending timer is cleared on unmount via effect cleanup; the latest callback and interval are
kept in refs so restarts always use the newest ones.

## Usage

```tsx
import { useTimeoutFn } from '@reaxuse/shared'

const { isPending, start, stop } = useTimeoutFn(() => {
  /* ... */
}, 3000)
```

<DemoContainer name="UseTimeoutFn" />

## Type Declarations

```ts
export interface UseTimeoutFnOptions {
  /**
   * Start the timer immediately
   *
   * @default true
   */
  immediate?: boolean
}

export interface UseTimeoutFnReturn<CallbackFn extends AnyFn> {
  isPending: boolean
  stop: () => void
  start: (...args: Parameters<CallbackFn> | []) => void
}

export function useTimeoutFn<CallbackFn extends AnyFn>(
  cb: CallbackFn,
  interval: number,
  options?: UseTimeoutFnOptions,
): UseTimeoutFnReturn<CallbackFn>
```

## Source

- VueUse: [`packages/shared/useTimeoutFn`](https://github.com/vueuse/vueuse/tree/main/packages/shared/useTimeoutFn)
- VueUse source: [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useTimeoutFn/index.ts)
- VueUse tests: [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useTimeoutFn/index.test.ts)
- reaxuse: [`packages/shared/src/useTimeoutFn.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useTimeoutFn.ts)

<Contributors name="useTimeoutFn" />
