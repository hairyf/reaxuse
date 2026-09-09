---
category: Browser
---

# useWebWorker

Simple [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) registration and communication

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
