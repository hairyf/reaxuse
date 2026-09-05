---
category: Watch
---

# useWatchOnce

Shorthand for watching value with `{ once: true }`. Once the callback fires once, the
watcher will be stopped — React port of VueUse's
[`watchOnce`](https://vueuse.org/shared/watchOnce/).

**Mapping:** upstream is a shorthand for `watch(source, cb, { ...options, once: true })`.
This port builds the same shorthand on the house `useWatch`: the callback is wrapped with
a stopped flag — the first invocation forwards `(value, oldValue)` and marks the watcher
stopped, so every further source change is ignored. An `immediate: true` call counts
toward the once.

## Usage

Similar to `useWatch`, but the callback triggers only once:

```tsx
import { useWatchOnce } from '@reaxuse/shared'

useWatchOnce(source, () => {
  // triggers only once
  console.log('source changed!')
})
```

<DemoContainer name="UseWatchOnce" />

## Type Declarations

```ts
export function useWatchOnce<T extends any[]>(source: readonly [...T], callback: UseWatchCallback<[...T]>, options?: UseWatchOptions): void
export function useWatchOnce<T>(source: T, callback: UseWatchCallback<T>, options?: UseWatchOptions): void
```

## Source

- VueUse: [`packages/shared/watchOnce`](https://github.com/vueuse/vueuse/tree/main/packages/shared/watchOnce) — source [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchOnce/index.ts), tests [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchOnce/index.test.ts) mirrored in [`packages/shared/src/useWatchOnce.test.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatchOnce.test.tsx)
- reaxuse: [`packages/shared/src/useWatchOnce.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatchOnce.ts)

<Contributors name="useWatchOnce" />
