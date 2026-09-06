---
category: Browser
---

# useWakeLock

Reactive [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API) — React port of VueUse's [`useWakeLock`](https://vueuse.org/core/useWakeLock/). Provides a way to prevent devices from dimming or locking the screen when an application needs to keep running.

**Mapping:** the upstream `shallowRef`/`computed` returns become plain values — `sentinel` (`WakeLockSentinel | null`), `isSupported` and `isActive` (booleans) — while `request` / `forceRequest` / `release` are stable functions. `isSupported` is computed in a mount effect, so SSR renders `false` without touching the global `navigator`; visibility tracking and the queued-request replay live in self-contained effects; the wake lock is released automatically on unmount (upstream's `tryOnScopeDispose`).

## Usage

```tsx
import { useWakeLock } from '@reaxuse/core'

const { isSupported, isActive, forceRequest, request, release } = useWakeLock()
```

When `request` is called, the wake lock will be requested if the document is visible. Otherwise, the request will be queued until the document becomes visible. If the request is successful, `isActive` will be **true**. Whenever the document is hidden, the `isActive` will be **false**.

When `release` is called, the wake lock will be released. If there is a queued request, it will be canceled.

To request a wake lock immediately, even if the document is hidden, use `forceRequest`. Note that this may throw an error if the document is hidden.

<DemoContainer name="UseWakeLock" />

## Type Declarations

```ts
export interface UseWakeLockOptions {
  navigator?: Navigator
  document?: Document
}

export interface UseWakeLockReturn {
  sentinel: WakeLockSentinel | null
  isSupported: boolean
  isActive: boolean
  request: (type: WakeLockType) => Promise<void>
  forceRequest: (type: WakeLockType) => Promise<void>
  release: () => Promise<void>
}

export function useWakeLock(options: UseWakeLockOptions = {}): UseWakeLockReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useWakeLock/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWakeLock/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWakeLock/index.test.ts) + [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWakeLock/index.browser.test.ts) (mirrored in `packages/core/src/useWakeLock.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWakeLock/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useWakeLock.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useWakeLock.ts), docs + demo co-located in `packages/core/useWakeLock/`

<Contributors name="useWakeLock" />
