---
category: Browser
---

# useWakeLock

Reactive [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API). Provides a way to prevent devices from dimming or locking the screen when an application needs to keep running.

## Usage

```tsx
import { useWakeLock } from '@reause/core'

const { isSupported, isActive, forceRequest, request, release } = useWakeLock()
```

When `request` is called, the wake lock will be requested if the document is visible. Otherwise, the request will be queued until the document becomes visible. If the request is successful, `isActive` will be **true**. Whenever the document is hidden, the `isActive` will be **false**.

When `release` is called, the wake lock will be released. If there is a queued request, it will be canceled.

To request a wake lock immediately, even if the document is hidden, use `forceRequest`. Note that this may throw an error if the document is hidden.

## Type Declarations

```ts
/**
 * The type of wake lock to request. Mirrors upstream's own
 * `WakeLockType` (defined locally rather than referenced from lib.dom, for
 * parity with older TS libs) and is re-exported from the package barrel.
 */
export type WakeLockType = "screen"
/**
 * Mirrors upstream's own `WakeLockSentinel` interface (upstream defines it
 * locally for older TS libs instead of referencing lib.dom directly) and is
 * re-exported from the package barrel. lib.dom's `WakeLockSentinel` is
 * assignable to this shape.
 */
export interface WakeLockSentinel extends EventTarget {
  type: WakeLockType
  released: boolean
  release: () => Promise<void>
}
/**
 * Specify a custom `navigator` or `document` instance, e.g. working with
 * iframes or in testing environments.
 *
 * Upstream composes these from the shared `ConfigurableNavigator` /
 * `ConfigurableDocument` option types; they are inlined here.
 */
export interface UseWakeLockOptions {
  /**
   * Specify a custom `navigator` instance, e.g. working with iframes or in
   * testing environments.
   *
   * @default typeof navigator !== 'undefined' ? navigator : undefined
   */
  navigator?: Navigator
  /**
   * Specify a custom `document` instance, e.g. working with iframes or in
   * testing environments.
   *
   * @default typeof document !== 'undefined' ? document : undefined
   */
  document?: Document
}
export interface UseWakeLockReturn {
  /**
   * The current `WakeLockSentinel` instance, or `null` when no wake lock is
   * held.
   */
  sentinel: WakeLockSentinel | null
  /**
   * If the Wake Lock API is supported by the current navigator.
   */
  isSupported: boolean
  /**
   * Whether a wake lock is currently held and the document is visible.
   */
  isActive: boolean
  /**
   * Request a wake lock of the given type. When the document is hidden, the
   * request is queued and replayed once the document becomes visible.
   */
  request: (type: WakeLockType) => Promise<void>
  /**
   * Request a wake lock immediately, even if the document is hidden. Note
   * that this may throw an error if the document is hidden.
   */
  forceRequest: (type: WakeLockType) => Promise<void>
  /**
   * Release the wake lock. A queued (not yet replayed) request is canceled.
   */
  release: () => Promise<void>
}
/**
 * React port of VueUse's `useWakeLock`.
 *
 * Map from @vueuse/core `useWakeLock`
 * (`source/vueuse/packages/core/useWakeLock/`). Reactive Screen Wake Lock
 * API — prevents devices from dimming or locking the screen.
 *
 * The upstream return shape is mirrored 1:1 as a plain object: `sentinel`,
 * `isSupported` and `isActive` are plain values, while `request`,
 * `forceRequest` and `release` are stable functions.
 *
 * React divergences:
 * - the Vue `shallowRef`/`computed` returns become plain state values;
 *   `request`/`forceRequest`/`release` are stable `useCallback` functions
 *   reading sync refs (`sentinelRef`/`visibilityRef`/`navigatorRef`) the way
 *   upstream reads its refs at call time;
 * - `isSupported` is computed in a mount effect (upstream: `useSupported`),
 *   so SSR renders `false` and the global `navigator` is never touched
 *   during render;
 * - `document.visibilityState` tracking (upstream: `useDocumentVisibility`)
 *   and the queued-request replay (upstream: `whenever`) live in
 *   self-contained `useEffect`s; the initial visibility defaults to
 *   `'visible'` (upstream's server default) and syncs on mount;
 * - the sentinel `release` listener re-queues the released sentinel's type
 *   only while it is still the current sentinel — upstream achieves the
 *   same by re-binding its listener through the sentinel ref;
 * - auto-release on unmount mirrors upstream's `tryOnScopeDispose`;
 * - `WakeLockSentinel`/`WakeLockType` are defined locally and re-exported,
 *   mirroring upstream's own interfaces (defined for older TS libs rather
 *   than referenced from lib.dom directly), so `` keeps parity.
 *
 * @example
 * const { isSupported, isActive, request, release } = useWakeLock()
 */
export declare function useWakeLock(
  options?: UseWakeLockOptions,
): UseWakeLockReturn
```
