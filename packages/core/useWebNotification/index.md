---
category: Browser
---

# useWebNotification

Reactive [Notification](https://developer.mozilla.org/en-US/docs/Web/API/notification) — React port of VueUse's [`useWebNotification`](https://vueuse.org/core/useWebNotification/).

The Web Notification interface of the Notifications API is used to configure and display desktop notifications to the user.

**Mapping:** the `isSupported` / `permissionGranted` / `notification` shallowRefs become plain state values (no `.value`); `createEventHook` becomes stable `onClick` / `onShow` / `onError` / `onClose` subscribe functions with the same `(fn) => { off }` shape; capability detection (including the `new Notification('')` constructability probe for the Android Chrome illegal-constructor quirk) and the initial permission read run in a mount `useEffect`, so nothing touches `Notification` during render and the flags stay `false` on the server (SSR-safe). `requestPermissions: true` (default) requests permission on mount; unmount closes the current notification and clears subscriptions (upstream: `tryOnScopeDispose`); the document `visibilitychange` listener closes the now-stale notification when the tab becomes visible again.

## Usage

::: tip
Before an app can send a notification, the user must grant the application the right to do so. The user's OS settings may also prevent expected notification behaviour.
:::

```tsx
import { useWebNotification } from '@reaxuse/core'
import { useEffect } from 'react'

const {
  isSupported,
  notification,
  permissionGranted,
  show,
  close,
  onClick,
  onShow,
  onError,
  onClose,
} = useWebNotification({
  title: 'Hello, reaxuse world!',
  dir: 'auto',
  lang: 'en',
  renotify: true,
  tag: 'test',
})

useEffect(() => {
  if (isSupported && permissionGranted)
    show()
}, [isSupported, permissionGranted, show])
```

The on* members are stable subscribe functions returning an `off` handle:

```tsx
const { onClick, onShow, onError, onClose } = useWebNotification()

onClick((event) => {
  // Do something with the notification on:click event...
})

onShow((event) => {
  // Do something with the notification on:show event...
})

onError((event) => {
  // Do something with the notification on:error event...
})

onClose((event) => {
  // Do something with the notification on:close event...
})
```

<DemoContainer name="UseWebNotification" />

## Type Declarations

```ts
export interface WebNotificationOptions {
  title?: string
  body?: string
  dir?: 'auto' | 'ltr' | 'rtl'
  lang?: string
  tag?: string
  icon?: string
  renotify?: boolean
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
}

export interface UseWebNotificationOptions extends ConfigurableWindow, WebNotificationOptions {
  /**
   * Request for permissions on mount if it's not granted.
   *
   * @default true
   */
  requestPermissions?: boolean
}

export interface UseWebNotificationReturn {
  isSupported: boolean
  notification: Notification | null
  ensurePermissions: () => Promise<boolean | undefined>
  permissionGranted: boolean
  show: (overrides?: WebNotificationOptions) => Promise<Notification | undefined>
  close: () => void
  onClick: (fn: (event: Event) => void) => { off: () => void }
  onShow: (fn: (event: Event) => void) => { off: () => void }
  onError: (fn: (event: Event) => void) => { off: () => void }
  onClose: (fn: (event: Event) => void) => { off: () => void }
}

export function useWebNotification(options?: UseWebNotificationOptions): UseWebNotificationReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useWebNotification/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWebNotification/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWebNotification/demo.vue) (ported to `demo.tsx` below).
  Upstream ships no test file for this function; the tests mirror the house vitest-browser-react style with a deterministic `Notification` stub.
- reaxuse: [`packages/core/src/useWebNotification.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useWebNotification.ts), docs + demo co-located in `packages/core/useWebNotification/`

<Contributors name="useWebNotification" />
