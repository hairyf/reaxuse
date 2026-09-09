---
category: Network
---

# useFetch

Reactive [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) provides the ability to abort requests, intercept requests before they are fired, automatically refetch requests when the url changes, and create your own `useFetch` with predefined options.

## Usage

### Basic Usage

The `useFetch` function can be used by simply providing a url. The url can be a string
or a React ref object. The `data` value will contain the
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

### Source Forms

`url` and `baseUrl` are read-only value sources and take plain strings, and the request `payload` is
a plain `unknown` (upstream: `MaybeRefOrGetter`). Resolve a React ref or state value at the call
site:

```tsx
const [url, setUrl] = useState('https://example.com')

const { data } = useFetch(url, { refetch: true }) // re-fetches when `url` changes
const { data: refData } = useFetch(urlRef.current, { refetch: true }) // resolve a ref yourself
```

`refetch` itself stays a plain value or React ref (a behavior toggle, not a value source).

### Refetching on URL change

Using a React ref object for the url parameter will allow the
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
