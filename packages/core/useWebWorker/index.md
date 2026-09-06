---
category: Browser
---

# useWebWorker

Simple [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
registration and communication — React port of VueUse's [`useWebWorker`](https://vueuse.org/core/useWebWorker/).

**Mapping:** upstream returns `{ data, post, terminate, worker }` with `ShallowRef`s for `data` and
`worker` → React `useState` values (`data: Data | null`, `worker: Worker | undefined`), stable
`post`/`terminate` callbacks reading a latest-value worker ref, and the worker created in a mount
`useEffect` (upstream creates it during setup behind an `if (window)` check), then terminated on
unmount (upstream: `tryOnScopeDispose`). SSR-safe — the server renders the initial `null`/`undefined`
values without ever touching `Worker`. `url`/`workerOptions` are read at mount time; changing them
does not recreate the worker, just like upstream's setup runs once.

## Usage

```tsx
import { useWebWorker } from '@reaxuse/core'

const { data, post, terminate, worker } = useWebWorker('/path/to/worker.js')
```

| State  | Type                  | Description                                                                            |
| ------ | --------------------- | -------------------------------------------------------------------------------------- |
| data   | `Data \| null`        | Latest data received via the worker (`e.data`), `null` until the first message arrives |
| worker | `Worker \| undefined` | The Web Worker instance, `undefined` until the mount effect created it                 |

| Method    | Signature                                                                                                                     | Description                      |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| post      | `(message: any, transfer: Transferable[]): void`<br>`(message: any, options?: StructuredSerializeOptions \| undefined): void` | Sends data to the worker thread. |
| terminate | `() => void`                                                                                                                  | Stops and terminates the worker. |

<DemoContainer name="UseWebWorker" />

## Type Declarations

```ts
type PostMessage = typeof Worker.prototype['postMessage']
type WorkerFn = (...args: unknown[]) => Worker

export interface UseWebWorkerReturn<Data = any> {
  data: Data | null
  post: PostMessage
  terminate: () => void
  worker: Worker | undefined
}

export function useWebWorker<T = any>(
  url: string,
  workerOptions?: WorkerOptions,
  options?: { window?: Window },
): UseWebWorkerReturn<T>
export function useWebWorker<T = any>(worker: Worker | WorkerFn): UseWebWorkerReturn<T>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useWebWorker/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWebWorker/index.ts) (implementation —
  upstream ships no tests or demo for this function, so the demo below is reaxuse-original and the
  tests are written from scratch against real blob-URL workers)
- reaxuse: [`packages/core/src/useWebWorker.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useWebWorker.ts),
  docs + demo co-located in `packages/core/useWebWorker/`

<Contributors name="useWebWorker" />
