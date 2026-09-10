---
category: State
---

# useStorageAsync

Reactive Storage with async support.

## Usage

The basic usage refers to [`useStorage`](/core/useStorage/).

```tsx
import { useStorageAsync } from '@reaxuse/core'

const [accessToken, setAccessToken] = useStorageAsync('access.token', '', SomeAsyncStorage)

// accessToken may be empty before the async storage is ready
console.log(accessToken) // ""
```

## Wait First Loaded

When the user enters your app, `useStorageAsync()` starts loading the value
from an async storage, so you may get the default initial value instead of the
real stored value at the very beginning.

```tsx
import { useStorageAsync } from '@reaxuse/core'

const [accessToken, setAccessToken] = useStorageAsync('access.token', '', SomeAsyncStorage)

// accessToken may be empty before the async storage is ready
console.log(accessToken) // ""

setTimeout(() => {
  // In React this closure captured the first render — the loaded value
  // arrives on a re-render and cannot be read from here. Use the `onReady`
  // option below to act on the loaded value.
  console.log(accessToken) // "" — the first render value, unchanged
}, 500)
```

Upstream lets you wait for the storage to be prepared by `await`-ing the
returned ref. In React the tuple cannot be awaited; instead the `onReady`
callback fires once the first value has been loaded:

```tsx
const [accessToken, setAccessToken] = useStorageAsync('access.token', '', SomeAsyncStorage, {
  onReady(value) {
    // accessToken has loaded — safe to mount the app now
  },
})
```
