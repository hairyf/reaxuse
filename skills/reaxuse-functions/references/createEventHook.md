---
category: Utilities
---

# createEventHook

Utility for creating event hooks

## Usage

Creating a function that uses `createEventHook`

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

Using a function that uses `createEventHook`

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

## Type Declarations

```ts
/**
 * Utility for creating event hooks — React port of VueUse's `createEventHook`.
 *
 * Map from @vueuse/shared `createEventHook`
 * Mapping notes:
 * - VueUse auto-disposes listeners through the Vue effect scope
 *   (`tryOnScopeDispose`); React has no scope equivalent, so that call is
 *   dropped. Clean up manually with the `{ off }` object returned by `on`
 *   (e.g. in an effect cleanup), or bind the hook with `useListener(on, cb)`
 *   for automatic cleanup on unmount.
 * - `trigger` matches upstream error semantics: a synchronous throw inside
 *   one listener propagates out of `trigger` and aborts the remaining
 *   listeners (upstream has no per-listener guard); rejections from async
 *   listeners still surface on the promise returned by `trigger`.
 *
 * The source code for this function was inspired by vue-apollo's `useEventHook` util
 * https://github.com/vuejs/vue-apollo/blob/v4/packages/vue-apollo-composable/src/util/useEventHook.ts
 *
 * @see https://vueuse.org/createEventHook
 *
 * @example
 * const resultEvent = createEventHook<Response>()
 * useListener(resultEvent.on, (response) => { console.log(response) })
 * resultEvent.trigger(response)
 */
type IsAny<T> = 0 extends 1 & T ? true : false
type Callback<T> =
  IsAny<T> extends true
    ? (...param: any) => void
    : [T] extends [void]
      ? (...param: unknown[]) => void
      : [T] extends [any[]]
        ? (...param: T) => void
        : (...param: [T, ...unknown[]]) => void
export type EventHookOn<T = any> = (fn: Callback<T>) => {
  off: () => void
}
export type EventHookOff<T = any> = (fn: Callback<T>) => void
export type EventHookTrigger<T = any> = (
  ...param: Parameters<Callback<T>>
) => Promise<unknown[]>
export interface EventHook<T = any> {
  on: EventHookOn<T>
  off: EventHookOff<T>
  trigger: EventHookTrigger<T>
  clear: () => void
}
export type EventHookReturn<T> = EventHook<T>
/**
 * Utility for creating event hooks
 *
 * @see https://vueuse.org/createEventHook
 *
 * @__NO_SIDE_EFFECTS__
 */
export declare function createEventHook<T = any>(): EventHookReturn<T>
```
