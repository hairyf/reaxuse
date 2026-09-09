---
category: '@Integrations'
---

# useAxios

Wrapper for [`axios`](https://github.com/axios/axios)

## Install

```bash
npm i axios@^1
```

## Usage

```tsx
import { useAxios } from '@reaxuse/integrations'

const { data, isFinished } = useAxios('/api/posts')
```

### Return Values

| Property           | Type                            | Description                                                     |
| ------------------ | ------------------------------- | --------------------------------------------------------------- |
| `data`             | `T` / `T \| undefined`          | Response data (`T` with `initialData`)                          |
| `response`         | `AxiosResponse<T> \| undefined` | Full axios response                                             |
| `error`            | `unknown \| undefined`          | Error if request failed                                         |
| `isFinished`       | `boolean`                       | Request has completed (success or error)                        |
| `isLoading`        | `boolean`                       | Request is in progress                                          |
| `isAborted`        | `boolean`                       | Request was aborted                                             |
| `abort` / `cancel` | `(message?: string) => void`    | Abort the current request                                       |
| `isCanceled`       | `boolean`                       | Alias of `isAborted`                                            |
| `execute`          | `(url?, config?) => Promise`    | Execute/re-execute the request (resolves with the return shell) |

### With Axios Instance

```tsx
import { useAxios } from '@reaxuse/integrations'
import axios from 'axios'

const instance = axios.create({
  baseURL: '/api',
})

const { data, isFinished } = useAxios('/posts', instance)
```

### With Config Options

```tsx
import { useAxios } from '@reaxuse/integrations'
import axios from 'axios'

const instance = axios.create({
  baseURL: '/api',
})

const { data, isFinished } = useAxios('/posts', { method: 'POST' }, instance)
```

### Manual Execution

When you don't pass a `url`, the request won't fire immediately:

```tsx
import { useAxios } from '@reaxuse/integrations'

const { execute } = useAxios()
execute(url)
```

The `execute` function `url` is optional - `url2` will replace `url1`:

```tsx
import { useAxios } from '@reaxuse/integrations'

const { execute } = useAxios(url1, {}, { immediate: false })
execute(url2)
```

The `execute` function can accept config only:

```tsx
import { useAxios } from '@reaxuse/integrations'

const { execute } = useAxios(url1, { method: 'GET' }, { immediate: false })
execute({ params: { key: 1 } })
execute({ params: { key: 2 } })
```

### Awaiting Results

The return value is thenable, so you can await it — `immediate` requests fire
from a mount effect (upstream fires during setup), so from an async context
(e.g. an event handler or a later effect) the shell is pending until the
latest request settles:

```tsx
import { useAxios } from '@reaxuse/integrations'

const { data, isFinished, error, execute } = useAxios('/api/posts')

// await a re-execution — resolves with the shell once the request settled
const snapshot = await execute()
// data is now populated
```

Or await the `execute` function on a url-less hook:

```tsx
import { useAxios } from '@reaxuse/integrations'

const { execute } = useAxios()
const result = await execute(url)
```

A bare `execute()` — without awaiting the returned shell — never settles
eagerly, so it cannot produce an unhandled rejection; failures surface only
when the shell is awaited.

### Options

```tsx
const { data } = useAxios('/api/posts', config, instance, {
  // Execute immediately (default: true if url provided)
  immediate: true,
  // Use shallowRef for data (default: true) — accepted for parity, no-op here
  shallow: true,
  // Abort previous request on new execute (default: true)
  abortPrevious: true,
  // Reset data before executing (default: false)
  resetOnExecute: false,
  // Initial data value
  initialData: [],
  // Callbacks
  onSuccess: data => console.log('Success:', data),
  onError: error => console.error('Error:', error),
  onFinish: () => console.log('Finished'),
})
```

## Testing strategy

Upstream's `index.test.ts` hits `https://jsonplaceholder.typicode.com`; `useAxios.test.tsx` never
touches the network. Every case is driven by a custom `AxiosAdapter`:
an immediate adapter (resolves a fake response, records the request config), a failing adapter
(rejects), and a deferred adapter that keeps requests pending until the test settles them — which is
what makes the `isLoading`/`isFinished` transitions, `abort()`, `abortPrevious` and the
late-response-after-abort guard deterministic.
