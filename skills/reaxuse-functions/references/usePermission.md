---
category: Browser
---

# usePermission

Reactive [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API) state

## Usage

```tsx
import { usePermission } from '@reaxuse/core'

const microphoneAccess = usePermission('microphone') // 'granted' | 'denied' | 'prompt'
```

## Type Declarations

```ts
type DescriptorNamePolyfill =
  | "accelerometer"
  | "accessibility-events"
  | "ambient-light-sensor"
  | "background-sync"
  | "camera"
  | "clipboard-read"
  | "clipboard-write"
  | "gyroscope"
  | "magnetometer"
  | "microphone"
  | "notifications"
  | "payment-handler"
  | "persistent-storage"
  | "push"
  | "speaker"
  | "local-fonts"
export type GeneralPermissionDescriptor =
  | PermissionDescriptor
  | {
      name: DescriptorNamePolyfill
    }
export interface UsePermissionOptions<Controls extends boolean = false> {
  /**
   * Expose more controls
   *
   * @default false
   */
  controls?: Controls
  /**
   * Specify a custom `navigator` instance (upstream `ConfigurableNavigator`),
   * e.g. when the Permissions API should be queried against an iframe or a
   * testing environment instead of the global `navigator`. Defaults to the
   * global `navigator`; substitution only happens for `undefined`.
   */
  navigator?: Navigator
}
export type UsePermissionReturn = PermissionState
export interface UsePermissionReturnWithControls {
  state: UsePermissionReturn
  isSupported: boolean
  query: () => Promise<PermissionStatus | undefined>
}
/**
 * React port of VueUse's `usePermission`.
 *
 * Map from @vueuse/core `usePermission`
 * (`source/vueuse/packages/core/usePermission/`). Reactive
 * [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
 * state as a plain string — `'granted' | 'denied' | 'prompt'`.
 *
 * React divergences:
 * - the `ShallowRef<PermissionState | undefined>` return becomes a plain
 *   string state; it starts as `'prompt'` and stays there until the async
 *   query resolves (SSR-safe — nothing touches `navigator` during render),
 *   mirroring upstream's `permissionStatus?.state ?? 'prompt'` fallback;
 * - the query runs in a mount `useEffect` (upstream queries once during
 *   setup) and re-queries when the descriptor changes; the descriptor is
 *   serialized for change detection, so inline object literals are safe and
 *   descriptor objects don't need a stable identity;
 * - the `change` listener attaches to the resolved `PermissionStatus` and is
 *   removed on unmount and when the descriptor changes; an in-flight query
 *   that resolves after unmount is ignored (no listener re-attach, no state
 *   update);
 * - `navigator` is a read-only option that defaults to the global
 *   `navigator` (upstream `ConfigurableNavigator`) — pass a custom instance
 *   to query the Permissions API against another environment;
 * - with `controls: true`, `isSupported` resolves after mount instead of
 *   during setup, and `query()` re-queries instead of returning upstream's
 *   cached singleton result.
 *
 * @example
 * const microphoneAccess = usePermission('microphone')
 */
export declare function usePermission(
  permissionDesc:
    GeneralPermissionDescriptor | GeneralPermissionDescriptor["name"],
  options?: UsePermissionOptions<false>,
): UsePermissionReturn
export declare function usePermission(
  permissionDesc:
    GeneralPermissionDescriptor | GeneralPermissionDescriptor["name"],
  options: UsePermissionOptions<true>,
): UsePermissionReturnWithControls
```
