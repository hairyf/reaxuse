---
category: Watch
---

# useWatchAtMost

Like `useWatch`, but the callback fires at most `count` times — React port of
VueUse's [`watchAtMost`](https://vueuse.org/shared/watchAtMost/).

**Mapping:** built on the house `useWatch`. The callback is wrapped with a fire
counter exposed as `count` state, and once the limit is reached further source
changes are ignored. Upstream stops the underlying watcher on `nextTick` — the
observable behavior is identical. Upstream's `pause` / `resume` controls are
not ported.

## Usage

Similar to `useWatch` with an extra option `count` which sets the number of
times the callback is triggered. After the count is reached, further changes
are ignored.

```tsx
import { useWatchAtMost } from '@reaxuse/shared'

const { count, stop } = useWatchAtMost(
  num,
  () => { console.log('trigger!') }, // triggered at most 3 times
  {
    count: 3, // the number of times triggered
  },
)
```

<DemoContainer name="UseWatchAtMost" />

## Type Declarations

```ts
export interface UseWatchAtMostOptions {
  /**
   * The maximum number of times the callback may fire.
   */
  count: number
  /**
   * Fire the callback once on mount with the current value.
   * @default false
   */
  immediate?: boolean
}

export interface UseWatchAtMostReturn {
  /**
   * The number of times the callback has fired so far.
   */
  count: number
  /**
   * Stop watching before the limit is reached.
   */
  stop: () => void
}

export function useWatchAtMost<T extends any[]>(source: readonly [...T], callback: UseWatchCallback<[...T]>, options: UseWatchAtMostOptions): UseWatchAtMostReturn
export function useWatchAtMost<T>(source: T, callback: UseWatchCallback<T>, options: UseWatchAtMostOptions): UseWatchAtMostReturn
```

## Source

- VueUse docs: [`watchAtMost`](https://vueuse.org/shared/watchAtMost/)
- VueUse source: [`packages/shared/watchAtMost/index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchAtMost/index.ts)
- VueUse tests: [`packages/shared/watchAtMost/index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchAtMost/index.test.ts)
- reaxuse: [`packages/shared/src/useWatchAtMost.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatchAtMost.ts)

<Contributors name="useWatchAtMost" />
