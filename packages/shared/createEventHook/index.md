---
category: Utilities
---

# createEventHook

Utility for creating event hooks — React port of VueUse's [`createEventHook`](https://vueuse.org/shared/createEventHook/).

**Mapping:** the returned `EventHook` object is kept 1:1 (`on` / `off` / `trigger` / `clear`).
VueUse auto-disposes listeners through the Vue effect scope; React has no equivalent,
so `on` returns `{ off }` — clean it up manually in an effect cleanup, or bind the hook
with [`useListener`](/shared/useListener) for automatic cleanup on unmount.

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

<DemoContainer name="CreateEventHook" />

## Type Declarations

```ts
export type EventHookOn<T = any> = (fn: Callback<T>) => { off: () => void }
export type EventHookOff<T = any> = (fn: Callback<T>) => void
export type EventHookTrigger<T = any> = (...param: Parameters<Callback<T>>) => Promise<unknown[]>

export interface EventHook<T = any> {
  on: EventHookOn<T>
  off: EventHookOff<T>
  trigger: EventHookTrigger<T>
  clear: () => void
}

export type EventHookReturn<T> = EventHook<T>

export function createEventHook<T = any>(): EventHookReturn<T>
```

## Source

- VueUse: [`packages/shared/createEventHook`](https://github.com/vueuse/vueuse/tree/main/packages/shared/createEventHook) — [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/createEventHook/index.ts) · [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/createEventHook/index.test.ts)
- reaxuse: [`packages/shared/src/createEventHook.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/createEventHook.ts) · [`packages/shared/src/createEventHook.test.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/createEventHook.test.tsx)

<Contributors name="createEventHook" />
