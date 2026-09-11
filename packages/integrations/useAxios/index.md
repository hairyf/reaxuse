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
import { useAxios } from '@reause/integrations'

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
| `execute`          | `(url?, config?) => Promise`    | Execute/re-execute the request (resolves with the return shell) |

### With Axios Instance

```tsx
import { useAxios } from '@reause/integrations'
import axios from 'axios'

const instance = axios.create({
  baseURL: '/api',
})

const { data, isFinished } = useAxios('/posts', instance)
```

### With Config Options

```tsx
import { useAxios } from '@reause/integrations'
import axios from 'axios'

const instance = axios.create({
  baseURL: '/api',
})

const { data, isFinished } = useAxios('/posts', { method: 'POST' }, instance)
```

### Manual Execution

When you don't pass a `url`, the request won't fire immediately:

```tsx
import { useAxios } from '@reause/integrations'

const { execute } = useAxios()
execute(url)
```

The `execute` function `url` is optional - `url2` will replace `url1`:

```tsx
import { useAxios } from '@reause/integrations'

const { execute } = useAxios(url1, {}, { immediate: false })
execute(url2)
```

The `execute` function can accept config only:

```tsx
import { useAxios } from '@reause/integrations'

const { execute } = useAxios(url1, { method: 'GET' }, { immediate: false })
execute({ params: { key: 1 } })
execute({ params: { key: 2 } })
```

### Awaiting Results

The return value is thenable, so you can await it:

```tsx
import { useAxios } from '@reause/integrations'

const { data, isFinished, error, execute } = useAxios('/api/posts')

// await a re-execution — resolves with the shell once the request settled
const snapshot = await execute()
// data is now populated
```

Or await the `execute` function:

```tsx
import { useAxios } from '@reause/integrations'

const { execute } = useAxios()
const result = await execute(url)
```

### Options

```tsx
const { data } = useAxios('/api/posts', config, instance, {
  // Execute immediately (default: true if url provided)
  immediate: true,
  // Use shallowRef for data (default: true)
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
