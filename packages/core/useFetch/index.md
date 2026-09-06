---
category: Network
---

# useFetch

Reactive [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) provides
the ability to abort requests, intercept requests before they are fired, automatically
refetch requests when the url changes, and create your own `useFetch` with predefined
options.

## Mapping

React port of VueUse's [`useFetch`](https://vueuse.org/core/useFetch/) — a reactive
wrapper around `fetch` returning an **object mirror** (`UseFetchReturn`) instead of
upstream's shallow-ref object: the members are live values, not refs. The request is
fired from a mount effect, any in-flight request is aborted on unmount, and a ref-like
(`{ current }`) url/payload/`refetch` flag is watched by polling at a small interval
(the React analog of upstream's `watch` over reactive refs) — a plain `url` value
(e.g. driven by `useState`) refetches when the render value changes.

**React divergences:**

- upstream exposes `data.value` / `isFetching.value` / … (shallow refs) and doubles as
  a `PromiseLike`; this port exposes the plain values (`data`, `isFetching`,
  `isFinished`, `statusCode`, `response`, `error`, `aborted`, `canAbort`) via live
  getters on a stable shell, and still supports `await` semantics —
  `const { data } = await useFetch(url).json()` works, resolving when the request
  finishes;
- upstream fires the initial request during setup; in React the first request is fired
  from a mount effect (respecting `immediate`, default `true`);
- `refetch` re-runs the request when the url, a ref-like payload, or the refetch flag
  itself changes (upstream watches `[refetch, toRef(url)]`); ref-like and getter
  sources are polled, plain render values are diffed across renders;
- `beforeFetch`, `afterFetch`, `onFetchError`, `updateDataOnError`, `initialData`,
  `timeout` (via `useTimeoutFn`), the chain methods (`.get()` / `.post()` / `.json()` /
  …) and the `createFetch` factory (with `chain`/`overwrite` combination) all mirror
  upstream.

## Usage

### Basic Usage

The `useFetch` function can be used by simply providing a url. The url can be a string,
a `{ current }` ref-like object, or a getter function. The `data` value will contain the
result of the request, the `error` value will contain any errors, and the `isFetching`
value will indicate if the request is loading.

```ts
import { useFetch } from '@reaxuse/core'

const { isFetching, error, data } = useFetch(url)
```

### Asynchronous Usage

`useFetch` can also be awaited just like a normal fetch:

```ts
import { useFetch } from '@reaxuse/core'
// ---cut---
const { isFetching, error, data } = await useFetch(url)
```

### Refetching on URL change

Using a `{ current }` object (or a getter) for the url parameter will allow the
`useFetch` function to automatically trigger another request when the url changes.
A plain string url re-fetches when the render value changes.

```ts
import { useFetch } from '@reaxuse/core'
// ---cut---
const url = { current: 'https://my-api.com/user/1' }

const { data } = useFetch(url, { refetch: true })

url.current = 'https://my-api.com/user/2' // Will trigger another request
```

### Prevent request from firing immediately

Setting the `immediate` option to false will prevent the request from firing until the
`execute` function is called.

```ts
import { useFetch } from '@reaxuse/core'
// ---cut---
const { execute } = useFetch(url, { immediate: false })

execute()
```

### Aborting a request

A request can be aborted by using the `abort` function from the `useFetch` function. The
`canAbort` property indicates if the request can be aborted.

```ts
import { useFetch } from '@reaxuse/core'
// ---cut---
const { abort, canAbort } = useFetch(url)

setTimeout(() => {
  if (canAbort)
    abort()
}, 100)
```

A request can also be aborted automatically by using `timeout` property. It will call
`abort` function when the given timeout is reached.

```ts
import { useFetch } from '@reaxuse/core'
// ---cut---
const { data } = useFetch(url, { timeout: 100 })
```

### Intercepting a request

The `beforeFetch` option can intercept a request before it is sent and modify the
request options and url.

```ts
import { useFetch } from '@reaxuse/core'
// ---cut---
const { data } = useFetch(url, {
  async beforeFetch({ url, options, cancel }) {
    const myToken = await getMyToken()

    if (!myToken)
      cancel()

    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${myToken}`,
    }

    return {
      options,
    }
  },
})
```

The `afterFetch` option can intercept the response data before it is updated.

```ts
import { useFetch } from '@reaxuse/core'
// ---cut---
const { data } = useFetch(url, {
  afterFetch(ctx) {
    if (ctx.data.title === 'HxH')
      ctx.data.title = 'Hunter x Hunter' // Modifies the response data

    return ctx
  },
})
```

The `onFetchError` option can intercept the response data and error before it is updated
when `updateDataOnError` is set to `true`.

```ts
import { useFetch } from '@reaxuse/core'
// ---cut---
const { data } = useFetch(url, {
  updateDataOnError: true,
  onFetchError(ctx) {
    // ctx.data can be null when 5xx response
    if (ctx.data === null)
      ctx.data = { title: 'Hunter x Hunter' } // Modifies the response data

    ctx.error = new Error('Custom Error') // Modifies the error
    return ctx
  },
})

console.log(data) // { title: 'Hunter x Hunter' }
```

### Setting the request method and return type

The request method and return type can be set by adding the appropriate methods to the
end of `useFetch`

```ts
import { useFetch } from '@reaxuse/core'
// ---cut---
// Request will be sent with GET method and data will be parsed as JSON
const { data } = useFetch(url).get().json()

// Request will be sent with POST method and data will be parsed as text
const { data } = useFetch(url).post().text()

// Or set the method using the options

// Request will be sent with GET method and data will be parsed as blob
const { data } = useFetch(url, { method: 'GET' }, { refetch: true }).blob()
```

### Creating a Custom Instance

The `createFetch` function will return a useFetch function with whatever pre-configured
options that are provided to it. This is useful for interacting with API's throughout an
application that uses the same base URL or needs Authorization headers.

```ts
import { createFetch } from '@reaxuse/core'
// ---cut---
const useMyFetch = createFetch({
  baseUrl: 'https://my-api.com',
  options: {
    async beforeFetch({ options }) {
      const myToken = await getMyToken()
      options.headers.Authorization = `Bearer ${myToken}`

      return { options }
    },
  },
  fetchOptions: {
    mode: 'cors',
  },
})

const { isFetching, error, data } = useMyFetch('users')
```

If you want to control the behavior of `beforeFetch`, `afterFetch`, `onFetchError`
between the pre-configured instance and newly spawned instance. You can provide a
`combination` option to toggle between `overwrite` or `chaining`.

```ts
import { createFetch } from '@reaxuse/core'
// ---cut---
const useMyFetch = createFetch({
  baseUrl: 'https://my-api.com',
  combination: 'overwrite',
  options: {
    // beforeFetch in pre-configured instance will only run when the newly spawned instance do not pass beforeFetch
    async beforeFetch({ options }) {
      const myToken = await getMyToken()
      options.headers.Authorization = `Bearer ${myToken}`

      return { options }
    },
  },
})

// use useMyFetch beforeFetch
const { isFetching, error, data } = useMyFetch('users')

// use custom beforeFetch
const { isFetching, error, data } = useMyFetch('users', {
  async beforeFetch({ url, options, cancel }) {
    const myToken = await getMyToken()

    if (!myToken)
      cancel()

    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${myToken}`,
    }

    return {
      options,
    }
  },
})
```

### Events

The `onFetchResponse` and `onFetchError` will fire on fetch request responses and errors
respectively.

```ts
import { useFetch } from '@reaxuse/core'
// ---cut---
const { onFetchResponse, onFetchError } = useFetch(url)

onFetchResponse((response) => {
  console.log(response.status)
})

onFetchError((error) => {
  console.error(error.message)
})
```

<DemoContainer name="UseFetch" />

## Type Declarations

```ts
export interface UseFetchReturn<T> {
  isFinished: boolean
  statusCode: number | null
  response: Response | null
  error: any
  data: T | null
  isFetching: boolean
  canAbort: boolean
  aborted: boolean
  abort: (reason?: any) => void
  execute: (throwOnFailed?: boolean) => Promise<any>
  onFetchResponse: EventHookOn<Response>
  onFetchError: EventHookOn
  onFetchFinally: EventHookOn

  // methods
  get: () => UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>
  post: (payload?: MaybeRefOrGetter<unknown>, type?: string) => UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>
  put: (payload?: MaybeRefOrGetter<unknown>, type?: string) => UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>
  delete: (payload?: MaybeRefOrGetter<unknown>, type?: string) => UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>
  patch: (payload?: MaybeRefOrGetter<unknown>, type?: string) => UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>
  head: (payload?: MaybeRefOrGetter<unknown>, type?: string) => UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>
  options: (payload?: MaybeRefOrGetter<unknown>, type?: string) => UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>

  // type
  json: <JSON = any>() => UseFetchReturn<JSON> & PromiseLike<UseFetchReturn<JSON>>
  text: () => UseFetchReturn<string> & PromiseLike<UseFetchReturn<string>>
  blob: () => UseFetchReturn<Blob> & PromiseLike<UseFetchReturn<Blob>>
  arrayBuffer: () => UseFetchReturn<ArrayBuffer> & PromiseLike<UseFetchReturn<ArrayBuffer>>
  formData: () => UseFetchReturn<FormData> & PromiseLike<UseFetchReturn<FormData>>
}

export interface BeforeFetchContext {
  url: string
  options: RequestInit
  cancel: () => void
}

export interface AfterFetchContext<T = any> {
  response: Response
  data: T | null
  context: BeforeFetchContext
  execute: (throwOnFailed?: boolean) => Promise<any>
}

export interface OnFetchErrorContext<T = any, E = any> {
  error: E
  data: T | null
  response: Response | null
  context: BeforeFetchContext
  execute: (throwOnFailed?: boolean) => Promise<any>
}

export interface UseFetchOptions {
  fetch?: typeof window.fetch
  immediate?: boolean
  refetch?: MaybeRefOrGetter<boolean>
  initialData?: any
  timeout?: number
  updateDataOnError?: boolean
  beforeFetch?: (ctx: BeforeFetchContext) => Promise<Partial<BeforeFetchContext> | void> | Partial<BeforeFetchContext> | void
  afterFetch?: (ctx: AfterFetchContext) => Promise<Partial<AfterFetchContext>> | Partial<AfterFetchContext>
  onFetchError?: (ctx: OnFetchErrorContext) => Promise<Partial<OnFetchErrorContext>> | Partial<OnFetchErrorContext>
}

export interface CreateFetchOptions {
  baseUrl?: MaybeRefOrGetter<string>
  combination?: 'overwrite' | 'chain'
  options?: UseFetchOptions
  fetchOptions?: RequestInit
}

export function useFetch<T>(url: MaybeRefOrGetter<string>): UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>
export function useFetch<T>(url: MaybeRefOrGetter<string>, useFetchOptions: UseFetchOptions): UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>
export function useFetch<T>(url: MaybeRefOrGetter<string>, options: RequestInit, useFetchOptions?: UseFetchOptions): UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>
export function createFetch(config?: CreateFetchOptions): typeof useFetch
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useFetch/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFetch/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFetch/index.test.ts) (mirrored here in `useFetch.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFetch/demo.vue) (ported to `demo.tsx`)
- reaxuse: [`packages/core/src/useFetch.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useFetch.ts), docs + demo co-located in `packages/core/useFetch/`

<Contributors name="useFetch" />
