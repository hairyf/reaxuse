---
category: Sensors
---

# useDevicesList

Reactive [`enumerateDevices`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices) listing available input/output devices

## Usage

```tsx
import { useDevicesList } from '@reause/core'

const {
  devices,
  videoInputs: cameras,
  audioInputs: microphones,
  audioOutputs: speakers,
} = useDevicesList()
```

## Requesting Permissions

To request permissions, use the `ensurePermissions` method.

```tsx
import { useDevicesList } from '@reause/core'

const {
  ensurePermissions,
  permissionGranted,
} = useDevicesList()

await ensurePermissions()
console.log(permissionGranted)
```

Call it from an event handler or an effect — never from render:

```tsx
function Component() {
  const { ensurePermissions, permissionGranted } = useDevicesList()

  return (
    <button type="button" onClick={() => void ensurePermissions()}>
      {permissionGranted ? 'Granted' : 'Request permissions'}
    </button>
  )
}
```

## Type Declarations

```ts
export interface UseDevicesListOptions extends ConfigurableNavigator {
  /**
   * Fired after every successful device enumeration (`devices` update).
   *
   * @default undefined
   */
  onUpdated?: (devices: MediaDeviceInfo[]) => void
  /**
   * Request for permissions immediately if it's not granted,
   * otherwise label and deviceIds could be empty
   *
   * @default false
   */
  requestPermissions?: boolean
  /**
   * Request for types of media permissions
   *
   * @default { audio: true, video: true }
   */
  constraints?: MediaStreamConstraints
}
export interface UseDevicesListReturn {
  /**
   * All devices
   */
  devices: MediaDeviceInfo[]
  videoInputs: MediaDeviceInfo[]
  audioInputs: MediaDeviceInfo[]
  audioOutputs: MediaDeviceInfo[]
  isSupported: boolean
  permissionGranted: boolean
  ensurePermissions: () => Promise<boolean>
  /**
   * Register a callback fired after every successful device enumeration
   * (`devices` update) — `useListener` protocol `(fn) => { off }`.
   */
  onUpdated: (fn: (devices: MediaDeviceInfo[]) => void) => {
    off: () => void
  }
}
/**
 * React port of VueUse's `useDevicesList`.
 *
 * Map from @vueuse/core `useDevicesList`
 * (`source/vueuse/packages/core/useDevicesList/`). Reactive
 * [enumerateDevices](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices)
 * listing available input/output devices.
 *
 * `devices` is plain state populated from
 * `navigator.mediaDevices.enumerateDevices()` in a mount effect and refreshed
 * on every `devicechange` event. `videoInputs` / `audioInputs` /
 * `audioOutputs` are derived filters over `devices`, and `ensurePermissions()`
 * requests media permissions on demand (so `device.label` and `deviceId`
 * become non-empty) — `permissionGranted` reflects the outcome.
 *
 * React divergences:
 * - the Vue `devices`/`permissionGranted` shallow refs become plain state;
 *   `videoInputs`/`audioInputs`/`audioOutputs` are `useMemo` filters instead
 *   of `computed`s;
 * - `isSupported` comes from `useSupported` (resolves after mount, stays
 *   `false` on the server) and gates a mount effect that registers the
 *   `devicechange` listener, runs the initial enumeration and optionally
 *   requests permissions (upstream: `if (isSupported.value)` setup block +
 *   `useEventListener`);
 * - upstream's `onUpdated` option is kept as an option (fired after every
 *   successful enumeration), and an `onUpdated` registration function in the
 *   return (`(fn) => { off }`, `useListener` protocol) is additionally
 *   provided for the same event;
 * - upstream calls `usePermission` lazily inside `ensurePermissions`; the
 *   permission query is inlined here and likewise only runs when
 *   `ensurePermissions` is called — no `navigator.permissions.query` fires on
 *   mount (upstream re-created the hook per call, re-querying the same
 *   status);
 * - the transient `getUserMedia` stream that triggers the permission prompt
 *   is held in a ref (upstream: closure variable) and stopped after the next
 *   enumeration.
 *
 * @example
 * const { devices, videoInputs: cameras, audioInputs: microphones, audioOutputs: speakers } = useDevicesList()
 */
export declare function useDevicesList(
  options?: UseDevicesListOptions,
): UseDevicesListReturn
```
