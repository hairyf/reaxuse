---
category: State
---

# useListener

Bind a callback to a listener registration function returned by a reause hook, with automatic cleanup on unmount.

## Usage

```tsx
import { createEventHook, useListener } from '@reause/shared'

const resultEvent = createEventHook<Response>()

useListener(resultEvent.on, (response) => {
  console.log(response)
})

// elsewhere — deliver an event:
resultEvent.trigger(response)
```

`createEventHook`'s `on` returns an `{ off }` object, so when the component
unmounts the listener is automatically unregistered — listeners never leak
and callbacks never fire after the component is gone. (An `on` that returns
nothing provides no cleanup, so that guarantee cannot be made.)

The callback is kept in a ref: changing `cb` across renders does not
re-register the listener — the latest callback is used by the
already-registered listener. Only when `on` itself changes (a new hook
instance) does the effect re-run, unregistering the old listener and
registering the new one.

## Type Declarations

```ts
/**
 * A listener registration function — the `onXxx` callbacks returned by hooks
 * such as `useFileDialog`'s `onChange` / `onCancel`. Mirror of upstream
 * `EventHookOn<T>`.
 */
export type ListenerOn<T extends (...args: any[]) => void> = (fn: T) => {
  off: () => void
} | void
/**
 * React port of the `useListener` protocol — bind a callback to an event
 * registration function returned by a reause hook, with automatic cleanup
 * on unmount.
 *
 * Map from @reause/shared `useListener` (protocol: #129)
 * Motivation: hooks like `useFileDialog` return `onChange` / `onCancel`
 * registration functions (upstream `EventHookOn`). In Vue those auto-clean
 * via the effect scope; in React we need a hook to own that lifecycle.
 * `useListener` registers `cb` with `on` on mount and, when `on` returns an
 * `off` function, calls it on unmount, so listeners are cleaned up and
 * callbacks never fire after the component is gone. (An `on` that returns
 * nothing provides no cleanup — nothing can be released.) The callback is
 * kept in a ref, so changing `cb` across renders does not re-register — the
 * latest callback is used by the already-registered listener. If `on` itself
 * changes (a new hook instance), the effect re-runs and re-registers.
 *
 * @example
 * const { files, open, onChange } = useFileDialog()
 * useListener(onChange, (files) => { console.log(files) })
 */
export declare function useListener<T extends (...args: any[]) => void>(
  on: ListenerOn<T>,
  cb: T,
): void
```
