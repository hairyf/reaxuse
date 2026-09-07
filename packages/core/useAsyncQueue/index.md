---
category: Utilities
---

# useAsyncQueue

Executes each asynchronous task sequentially and passes the current task result to the next task — React port of VueUse's [`useAsyncQueue`](https://vueuse.org/core/useAsyncQueue/).

**Mapping:** object-mirror hook — `activeIndex` is a plain React number (the index of the task currently running, `-1` before the first task; upstream exposes a `ShallowRef` read as `activeIndex.value`) and `result` is the results array of `{ state, data }` entries (upstream: a `reactive` array). The queue starts from a mount effect (upstream runs it during setup) — the promise chain is identical: sequential execution, `interrupt` stops subsequent tasks after a failure, `onError`/`onFinished` callbacks, and `signal` aborts the current task via `Promise.race`.

## Usage

```ts
import { useAsyncQueue } from '@reaxuse/core'

function p1() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1000)
    }, 10)
  })
}

function p2(result: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1000 + result)
    }, 20)
  })
}

const { activeIndex, result } = useAsyncQueue([p1, p2])

console.log(activeIndex) // current pending task index (number)

console.log(result) // the tasks result
```

### Result State

Each task in the result array has a `state` and `data` property:

```ts
interface UseAsyncQueueResult<T> {
  state: 'aborted' | 'fulfilled' | 'pending' | 'rejected'
  data: T | null
}
```

### Interrupt on Failure

By default, if a task fails, subsequent tasks will not be executed. Set `interrupt: false` to continue executing even after failures.

```ts
const { result } = useAsyncQueue([p1, p2], {
  interrupt: false, // continue even if p1 fails
})
```

### Callbacks

```ts
const { result } = useAsyncQueue([p1, p2], {
  onError() {
    console.log('A task failed')
  },
  onFinished() {
    console.log('All tasks completed (or interrupted)')
  },
})
```

### Abort Signal

You can pass an `AbortSignal` to cancel the queue execution.

```ts
const controller = new AbortController()

const { result } = useAsyncQueue([p1, p2], {
  signal: controller.signal,
})

// Later, abort the queue
controller.abort()
```

<DemoContainer name="UseAsyncQueue" />

## Type Declarations

```ts
export type UseAsyncQueueTask<T> = (...args: any[]) => T | Promise<T>

export interface UseAsyncQueueResult<T> {
  state: 'aborted' | 'fulfilled' | 'pending' | 'rejected'
  data: T | null
}

export interface UseAsyncQueueReturn<T> {
  activeIndex: number
  result: T
}

export interface UseAsyncQueueOptions {
  interrupt?: boolean
  onError?: () => void
  onFinished?: () => void
  signal?: AbortSignal
}

export function useAsyncQueue<T extends any[], S = MapQueueTask<T>>(
  tasks: S & Array<UseAsyncQueueTask<any>>,
  options?: UseAsyncQueueOptions,
): UseAsyncQueueReturn<{ [P in keyof T]: UseAsyncQueueResult<T[P]> }>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useAsyncQueue/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useAsyncQueue/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useAsyncQueue/index.browser.test.ts) (mirrored by `useAsyncQueue.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useAsyncQueue/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useAsyncQueue.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useAsyncQueue.ts), docs + demo co-located in `packages/core/useAsyncQueue/`

<Contributors name="useAsyncQueue" />
