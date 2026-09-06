---
category: Browser
---

# useWebWorkerFn

Run expensive functions without blocking the UI, using a simple syntax that makes use of Promise — React port of VueUse's
[`useWebWorkerFn`](https://vueuse.org/core/useWebWorkerFn/), itself a port of [alewin/useWorker](https://github.com/alewin/useWorker).

**Mapping:** upstream returns `{ workerFn, workerStatus, workerTerminate }` with `workerStatus` as a `ShallowRef` →
React `useState` value (`WebWorkerStatus` string) plus stable `workerFn`/`workerTerminate` callbacks reading latest
values through refs. A worker is spawned per `workerFn()` call and terminated (blob URL revoked) once the promise
settles, when `workerTerminate()` runs, or on unmount (upstream: `tryOnScopeDispose`). The blob helpers
(`createWorkerBlobUrl`, `depsParser`, `jobRunner`) are inlined from upstream's `lib/`. SSR-safe: without a `window`
instance `workerFn()` rejects instead of touching `Worker`/`URL`/`Blob`.

## Usage

### Basic example

```tsx
import { useWebWorkerFn } from '@reaxuse/core'

const { workerFn } = useWebWorkerFn(() => {
  // some heavy works to do in web worker
})
```

### With dependencies

```tsx
import { useWebWorkerFn } from '@reaxuse/core'

const { workerFn, workerStatus, workerTerminate } = useWebWorkerFn(
  dates => dates.sort(dateFns.compareAsc),
  {
    timeout: 50000,
    dependencies: [
      'https://cdnjs.cloudflare.com/ajax/libs/date-fns/1.30.1/date_fns.js', // dateFns
    ],
  },
)
```

### With local dependencies

```tsx
import { useWebWorkerFn } from '@reaxuse/core'

const pow = (a: number) => a * a

const { workerFn, workerStatus, workerTerminate } = useWebWorkerFn(
  numbers => pow(numbers),
  {
    timeout: 50000,
    localDependencies: [pow],
  },
)
```

<DemoContainer name="UseWebWorkerFn" />

## Type Declarations

```ts
type WebWorkerStatus
  = 'PENDING'
    | 'SUCCESS'
    | 'RUNNING'
    | 'ERROR'
    | 'TIMEOUT_EXPIRED'

export interface UseWebWorkerOptions {
  timeout?: number
  dependencies?: string[]
  localDependencies?: ((...args: any[]) => any)[]
  window?: Window
}

export interface UseWebWorkerFnReturn<T extends (...fnArgs: any[]) => any> {
  workerFn: (...fnArgs: Parameters<T>) => Promise<ReturnType<T>>
  workerStatus: WebWorkerStatus
  workerTerminate: (status?: WebWorkerStatus) => void
}

export function useWebWorkerFn<T extends (...fnArgs: any[]) => any>(
  fn: T,
  options?: UseWebWorkerOptions,
): UseWebWorkerFnReturn<T>
```

## Web Worker

Before you start using this function, we suggest you read the [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) documentation.

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useWebWorkerFn/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWebWorkerFn/index.ts) (implementation —
  upstream ships no tests for this function, so the tests in `packages/core/src/useWebWorkerFn.test.tsx` are written
  from scratch against real blob-URL workers), [`lib/createWorkerBlobUrl.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWebWorkerFn/lib/createWorkerBlobUrl.ts),
  [`lib/depsParser.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWebWorkerFn/lib/depsParser.ts),
  [`lib/jobRunner.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWebWorkerFn/lib/jobRunner.ts) (inlined into the implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWebWorkerFn/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useWebWorkerFn.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useWebWorkerFn.ts),
  docs + demo co-located in `packages/core/useWebWorkerFn/`

<Contributors name="useWebWorkerFn" />
