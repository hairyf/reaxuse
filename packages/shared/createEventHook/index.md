---
category: Utilities
---

# createEventHook

Utility for creating event hooks

## Usage

Creating a function that uses `createEventHook`:

```tsx
import { createEventHook } from '@reaxuse/shared'

export function useMyFetch(url: string) {
  const fetchResult = createEventHook<Response>()
  const fetchError = createEventHook<any>()

  fetch(url)
    .then(result => fetchResult.trigger(result))
    .catch(error => fetchError.trigger(error.message))

  return {
    onResult: fetchResult.on,
    onError: fetchError.on,
  }
}
```

Using it from a component, with automatic cleanup on unmount:

```tsx
import { useListener } from '@reaxuse/shared'
import { useMyFetch } from './my-fetch-function'

function MyApp() {
  const { onResult, onError } = useMyFetch('/my-api-url')

  useListener(onResult, (result) => {
    console.log(result)
  })

  useListener(onError, (error) => {
    console.error(error)
  })

  return <div>...</div>
}
```
