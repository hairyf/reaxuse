---
category: Sensors
---

# usePointerLock

Reactive [pointer lock](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API) — React port of VueUse's [`usePointerLock`](https://vueuse.org/core/usePointerLock/).

**Mapping:** upstream's `element`/`triggerElement` shallow refs become plain `Element | null` state and
`isSupported` a boolean derived from the resolved document (`typeof document` guard keeps SSR renders at
`false` without touching `document`). The document `pointerlockchange`/`pointerlockerror` listeners attach
in a self-contained `useEffect` (removed on unmount, re-bound when the `document` option changes). `lock()`
and `unlock()` are stable async functions: `lock()` accepts an element, a React ref, or an event (native or
React synthetic), and Vue's `until(element).toBe(...)` becomes a waiter queue resolved by the change handler.
On `pointerlockerror` the pending `lock()`/`unlock()` promise rejects with upstream's
`Failed to {acquire,release} pointer lock.` message (upstream throws inside the listener, leaving the
promise pending). Unmount removes the listeners but never releases an active lock — upstream has no
scope-dispose unlock either.

## Usage

```tsx
import { usePointerLock } from '@reaxuse/core'

const targetRef = useRef<HTMLDivElement>(null)
const { isSupported, element, triggerElement, lock, unlock } = usePointerLock()

// <div ref={targetRef} onMouseDown={lock} onMouseUp={unlock} />
// lock(targetRef) — lock a specific element or ref
// lock(event) — lock the event's currentTarget (hook-level target first, if set)
// element mirrors document.pointerLockElement while the lock is held
```

<DemoContainer name="UsePointerLock" />

## Type Declarations

```ts
export interface UsePointerLockOptions {
  document?: Document
}

export interface UsePointerLockReturn {
  isSupported: boolean
  element: Element | null
  triggerElement: Element | null
  lock: (
    e: Element | { current: Element | null } | Event | SyntheticEvent,
  ) => Promise<Element | null>
  unlock: () => Promise<boolean>
}

export function usePointerLock(
  target?: Element | { current: Element | null },
  options?: UsePointerLockOptions,
): UsePointerLockReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/usePointerLock/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePointerLock/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePointerLock/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/usePointerLock.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/usePointerLock.ts), docs + demo co-located in `packages/core/usePointerLock/`

<Contributors name="usePointerLock" />
