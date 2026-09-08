---
category: '@Integrations'
---

# useAxios

Wrapper for [`axios`](https://github.com/axios/axios) — React port of VueUse's
[`useAxios`](https://vueuse.org/integrations/useAxios/).

**Mapping:** upstream returns an object of refs (`data`, `isLoading`, …); the React port returns an
object whose members are plain values (no `.value`) — they are live getters over the hook's state, so
a shell captured earlier still reads fresh values. All 12 upstream overloads are kept
(`(url, config?, options?)`, `(url, instance?, options?)`, `(url, config, instance, options?)`,
`(config)`, `(instance)`, `(config, instance)`): the url-ful forms return `StrictUseAxiosReturn` and
their `execute` takes `(url?, config?)`, the url-less forms return `EasyUseAxiosReturn` and require
`execute(url, config?)`. `execute` resolves with the `AxiosResponse` and rejects with the caught
error, and the returned object is thenable (`await useAxios(url)` resolves with the shell).

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

| Property           | Type                            | Description                              |
| ------------------ | ------------------------------- | ---------------------------------------- |
| `data`             | `T` / `T \| undefined`          | Response data (`T` with `initialData`)   |
| `response`         | `AxiosResponse<T> \| undefined` | Full axios response                      |
| `error`            | `unknown \| undefined`          | Error if request failed                  |
| `isFinished`       | `boolean`                       | Request has completed (success or error) |
| `isLoading`        | `boolean`                       | Request is in progress                   |
| `isAborted`        | `boolean`                       | Request was aborted                      |
| `abort` / `cancel` | `(message?: string) => void`    | Abort the current request                |
| `isCanceled`       | `boolean`                       | Alias of `isAborted`                     |
| `execute`          | `(url?, config?) => Promise<R>` | Execute/re-execute the request           |

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

The return value is thenable, so you can await it:

```tsx
import { useAxios } from '@reaxuse/integrations'

const { data, isFinished, error } = await useAxios('/api/posts')
// data is now populated
```

Or await the execute function:

```tsx
import { useAxios } from '@reaxuse/integrations'

const { execute } = useAxios()
const result = await execute(url)
```

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

## React divergences

- `shallow` is accepted for API parity but has **no effect**: React state is never deep-wrapped, so
  there is no `shallowRef`/`ref` distinction to mirror.
- A request still in flight when the component unmounts is **aborted** from the unmount cleanup, so a
  late response can never populate `data`/`response` after unmount. Upstream only relies on the
  `isAborted` guard.
- The `immediate` request fires from a mount effect (upstream fires during setup) and its rejection is
  swallowed with `void execute().catch(noop)`; `execute` itself rejects so callers can `try`/`catch`.
- `immediate` defaults to `!!url` only when no `options` object is passed at all (upstream's
  destructuring has no default) — pass `immediate: true` explicitly if you supply options with a url.

## Testing strategy

Upstream's `index.test.ts` hits `https://jsonplaceholder.typicode.com`; `useAxios.test.tsx` never
touches the network. Every case is driven by a custom `AxiosAdapter`:
an immediate adapter (resolves a fake response, records the request config), a failing adapter
(rejects), and a deferred adapter that keeps requests pending until the test settles them — which is
what makes the `isLoading`/`isFinished` transitions, `abort()`, `abortPrevious` and the
late-response-after-abort guard deterministic.

## Type Declarations

```ts
export interface UseAxiosReturn<T, R = AxiosResponse<T>, D = any, O extends UseAxiosOptions = UseAxiosOptions<T>> {
  response: R | undefined
  data: O extends UseAxiosOptionsWithInitialData<T> ? T : T | undefined
  isFinished: boolean
  isLoading: boolean
  isAborted: boolean
  error: unknown | undefined
  abort: (message?: string | undefined) => void
  cancel: (message?: string | undefined) => void
  isCanceled: boolean
}

export interface StrictUseAxiosReturn<T, R, D, O extends UseAxiosOptions = UseAxiosOptions<T>> extends UseAxiosReturn<T, R, D, O> {
  execute: (url?: string | AxiosRequestConfig<D>, config?: AxiosRequestConfig<D>) => Promise<R | undefined>
}

export interface EasyUseAxiosReturn<T, R, D> extends UseAxiosReturn<T, R, D> {
  execute: (url: string, config?: AxiosRequestConfig<D>) => Promise<R | undefined>
}

export interface UseAxiosOptionsBase<T = any> {
  immediate?: boolean
  shallow?: boolean
  abortPrevious?: boolean
  onError?: (e: unknown) => void
  onSuccess?: (data: T) => void
  resetOnExecute?: boolean
  onFinish?: () => void
}

export interface UseAxiosOptionsWithInitialData<T> extends UseAxiosOptionsBase<T> {
  initialData: T
}

export type UseAxiosOptions<T = any> = UseAxiosOptionsBase<T> | UseAxiosOptionsWithInitialData<T>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/integrations/useAxios/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useAxios/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useAxios/index.test.ts) (mirrored in `useAxios.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useAxios/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/integrations/src/useAxios.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/integrations/src/useAxios.ts), docs + demo co-located in `packages/integrations/useAxios/`

<DemoContainer name="useAxios" />

<Contributors name="useAxios" />
