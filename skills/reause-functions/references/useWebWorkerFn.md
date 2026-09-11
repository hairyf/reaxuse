---
category: Browser
---

# useWebWorkerFn

Run expensive functions without blocking the UI, using a simple syntax that makes use of Promise. A port of [alewin/useWorker](https://github.com/alewin/useWorker).

## Usage

### Basic example

```tsx
import { useWebWorkerFn } from '@reause/core'

const { workerFn } = useWebWorkerFn(() => {
  // some heavy works to do in web worker
})
```

### With dependencies

```tsx
import { useWebWorkerFn } from '@reause/core'

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
import { useWebWorkerFn } from '@reause/core'

const pow = (a: number) => a * a

const { workerFn, workerStatus, workerTerminate } = useWebWorkerFn(
  numbers => pow(numbers),
  {
    timeout: 50000,
    localDependencies: [pow],
  },
)
```

## Web Worker

Before you start using this function, we suggest you read the [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) documentation.

## Credit

This function is a React port of https://github.com/alewin/useWorker by Alessio Koci, with the help of [@Donskelle](https://github.com/Donskelle) to migration.

## Type Declarations

```ts
export type WebWorkerStatus =
  "PENDING" | "SUCCESS" | "RUNNING" | "ERROR" | "TIMEOUT_EXPIRED"
export interface UseWebWorkerOptions {
  /**
   * Number of milliseconds before killing the worker
   *
   * @default undefined
   */
  timeout?: number
  /**
   * An array that contains the external dependencies needed to run the worker
   */
  dependencies?: string[]
  /**
   * An array that contains the local dependencies needed to run the worker
   */
  localDependencies?: ((...args: any[]) => any)[]
  /**
   * Specify a custom `window` instance, e.g. working with iframes or in
   * testing environments.
   */
  window?: Window
}
export interface UseWebWorkerFnReturn<T extends (...fnArgs: any[]) => any> {
  workerFn: (...fnArgs: Parameters<T>) => Promise<ReturnType<T>>
  workerStatus: WebWorkerStatus
  workerTerminate: (status?: WebWorkerStatus) => void
}
/**
 * React port of VueUse's `useWebWorkerFn`.
 *
 * Map from @vueuse/core `useWebWorkerFn`
 * (`source/vueuse/packages/core/useWebWorkerFn/`), which runs an expensive
 * function inside a dedicated Web Worker spawned from a blob URL, so the UI
 * is not blocked. The worker code is built by stringifying `fn` and the
 * helper `lib/` functions (`createWorkerBlobUrl`, `depsParser`, `jobRunner`),
 * which are inlined below.
 *
 * React divergences:
 * - the Vue `ShallowRef` returns become plain state: `workerStatus` is a
 *   `useState<WebWorkerStatus>` value instead of a ref, while `workerFn` and
 *   `workerTerminate` are stable `useCallback`s reading latest values
 *   through refs (upstream: closures over module-level `let`s);
 * - a worker is spawned per `workerFn()` call and terminated when the
 *   promise settles or `workerTerminate()` runs (upstream does the same via
 *   its `generateWorker`/`workerTerminate` pair), and the mount `useEffect`
 *   cleanup terminates any still-running worker on unmount (upstream:
 *   `tryOnScopeDispose`) — including the `workerStatus` being reset to
 *   `PENDING`;
 * - the "one instance at a time" guard reads a synchronous ref mirror of the
 *   status (React state updates are async), so two back-to-back `workerFn()`
 *   calls cannot spawn overlapping workers;
 * - `workerFn` throws synchronously when no `window` is available (SSR),
 *   mirroring upstream, which reaches `new Worker` / `new Blob` inside
 *   `workerFn` and throws there too.
 *
 * @example
 * const { workerFn, workerStatus, workerTerminate } = useWebWorkerFn(() => {
 *   // some heavy works to do in web worker
 * })
 */
export declare function useWebWorkerFn<T extends (...fnArgs: any[]) => any>(
  fn: T,
  options?: UseWebWorkerOptions,
): UseWebWorkerFnReturn<T>
```
