---
category: Utilities
---

# useMemoize

Cache results of functions depending on arguments — React port of VueUse's [`useMemoize`](https://vueuse.org/core/useMemoize/).

**Mapping:** upstream returns a memoized function plus cache controls built once per setup call and backed by a
`shallowReactive` `Map`. React has no reactivity, so the cache is a plain `Map` and cached results are plain values —
they do not trigger re-renders on their own; pair with your own state (e.g. re-render after a forced `load()`). The
memoized function, the cache and the helpers are built once (`useMemo`) so their identity is stable across renders,
while the latest `resolver` / `options` are mirrored into refs so every call sees fresh values.

It can also be used for asynchronous functions and will reuse existing promises — since the in-flight promise is what
gets cached, concurrent calls with the same arguments share the same pending request.

::: tip
The results are not cleared automatically. Call `clear()` in case you no longer need the results or use your own
caching mechanism to avoid memory leaks.
:::

## Usage

```tsx
import { useMemoize } from '@reaxuse/core'

const getUser = useMemoize(
  async (userId: number): Promise<UserData> =>
    axios.get(`users/${userId}`).then(({ data }) => data),
)

const user1 = await getUser(1) // Request users/1
const user2 = await getUser(2) // Request users/2
// ...
const user1 = await getUser(1) // Retrieve from cache

// ...
const user1 = await getUser.load(1) // Request users/1

// ...
getUser.delete(1) // Delete cache from user 1
getUser.clear() // Clear full cache
```

### Resolving cache key

The key for caching is determined by the arguments given to the function and will be serialized by default with
`JSON.stringify`. This allows equal objects to receive the same cache key. In case you want to customize the key you
can pass `getKey`.

::: warning Performance Consideration
Using `JSON.stringify` as the default key generator can be **slow for large or complex objects**. For better
performance with complex arguments, it's highly recommended to provide a custom `getKey` function that generates keys
based on primitive values or unique identifiers.
:::

```tsx
import { useMemoize } from '@reaxuse/core'

const getUser = useMemoize(
  async (userId: number, headers: AxiosRequestHeaders): Promise<UserData> =>
    axios.get(`users/${userId}`, { headers }).then(({ data }) => data),
  {
    // Use only userId to get/set cache and ignore headers
    getKey: (userId, headers) => userId,
  },
)
```

### Customize cache mechanism

By default, the results are cached within a `Map`. You can implement your own mechanism by passing `cache` as options
with the following structure:

```ts
export interface UseMemoizeCache<Key, Value> {
  /**
   * Get value for key
   */
  get: (key: Key) => Value | undefined
  /**
   * Set value for key
   */
  set: (key: Key, value: Value) => void
  /**
   * Return flag if key exists
   */
  has: (key: Key) => boolean
  /**
   * Delete value for key
   */
  delete: (key: Key) => void
  /**
   * Clear cache
   */
  clear: () => void
}
```

<DemoContainer name="UseMemoize" />

## Type Declarations

```ts
export interface UseMemoizeCache<Key, Value> {
  get: (key: Key) => Value | undefined
  set: (key: Key, value: Value) => void
  has: (key: Key) => boolean
  delete: (key: Key) => void
  clear: () => void
}

export interface UseMemoizeReturn<Result, Args extends unknown[]> {
  (...args: Args): Result
  load: (...args: Args) => Result
  delete: (...args: Args) => void
  clear: () => void
  generateKey: (...args: Args) => string | number | any
  cache: UseMemoizeCache<string | number | any, Result>
}

export interface UseMemoizeOptions<Result, Args extends unknown[]> {
  getKey?: (...args: Args) => string | number
  cache?: UseMemoizeCache<string | number | any, Result>
}

export function useMemoize<Result, Args extends unknown[]>(
  resolver: (...args: Args) => Result,
  options?: UseMemoizeOptions<Result, Args>,
): UseMemoizeReturn<Result, Args>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useMemoize/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMemoize/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMemoize/index.browser.test.ts) (mirrored to `packages/core/src/useMemoize.test.tsx`; the `computed` reactivity case becomes a component re-render after `load()`)
- reaxuse: [`packages/core/src/useMemoize.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useMemoize.ts), docs + demo co-located in `packages/core/useMemoize/`

<Contributors name="useMemoize" />
