---
category: Sensors
related: useDevicesList, usePermission
---

# useUserMedia

Streaming via [`mediaDevices.getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

## Usage

```tsx
import { useUserMedia } from '@reaxuse/core'
import { useEffect, useRef } from 'react'

const { stream, start } = useUserMedia()

const videoRef = useRef<HTMLVideoElement>(null)
useEffect(() => {
  // acquire the stream once mounted
  start()
}, [])

useEffect(() => {
  // preview on a video element
  videoRef.current.srcObject = stream ?? null
}, [stream])
```

### Devices

```tsx
import { useDevicesList, useUserMedia } from '@reaxuse/core'

const {
  videoInputs: cameras,
  audioInputs: microphones,
} = useDevicesList({
  requestPermissions: true,
})
const currentCamera = cameras[0]?.deviceId
const currentMicrophone = microphones[0]?.deviceId

const { stream } = useUserMedia({
  constraints: {
    video: { deviceId: currentCamera },
    audio: { deviceId: currentMicrophone },
  },
})
```

## Type Declarations

```ts
/**
 * Specify a custom `navigator` instance, e.g. working with iframes or in
 * testing environments.
 */
export interface ConfigurableNavigator {
  navigator?: Navigator
}
/**
 * Options for `useUserMedia`.
 */
export interface UseUserMediaOptions extends ConfigurableNavigator {
  /**
   * If the stream is enabled. With an initial `true` the stream is acquired
   * automatically once mounted (and supported).
   * @default false
   */
  enabled?: boolean
  /**
   * Recreate the stream when the `constraints` option changed while
   * streaming.
   * @default true
   */
  autoSwitch?: boolean
  /**
   * MediaStreamConstraints to be applied to the requested MediaStream.
   * When provided, its `video`/`audio` members are passed to
   * `getUserMedia` as-is.
   * @default {}
   */
  constraints?: MediaStreamConstraints
}
/**
 * Return type of `useUserMedia`.
 */
export interface UseUserMediaReturn {
  isSupported: boolean
  stream: MediaStream | undefined
  start: () => Promise<MediaStream | undefined>
  stop: () => void
  restart: () => Promise<MediaStream | undefined>
  constraints: MediaStreamConstraints | undefined
  enabled: boolean
  autoSwitch: boolean
}
/**
 * React port of VueUse's `useUserMedia`.
 *
 * Map from @vueuse/core `useUserMedia`
 * (`source/vueuse/packages/core/useUserMedia/`), which wraps
 * `mediaDevices.getUserMedia` into a stream ref with `start`/`stop`/
 * `restart` controls and an `enabled` flag whose watcher auto-starts and
 * auto-stops the stream.
 *
 * React divergences:
 * - the Vue `stream`/`enabled`/`isSupported` refs become plain state values;
 *   `start`/`stop`/`restart` are stable callbacks reading the latest state
 *   and options through refs;
 * - the writable `enabled` ref becomes state mutated through `start`/`stop`;
 *   `autoSwitch` and `constraints` are read-only snapshots of the latest
 *   options (re-render with new options to change them);
 * - the supported check runs in a mount effect, so `isSupported` stays
 *   `false` during render and on the server (SSR-safe);
 * - upstream deep-watches its `constraints` ref: here a changed
 *   `constraints` option (compared structurally, since React hands the hook
 *   new option objects) recreates the stream while streaming when
 *   `autoSwitch` is on;
 * - concurrent `start()` calls share one pending acquisition (React effects
 *   can re-run; upstream's watcher fires once), while `stop()`/`restart()`
 *   drop it so a late resolve cannot re-enable a stream that was stopped;
 * - `tryOnScopeDispose(stop)` becomes an unmount cleanup.
 *
 * @example
 * const { stream, start } = useUserMedia()
 * start()
 * // preview on a video element
 * videoEl.srcObject = stream
 */
export declare function useUserMedia(
  options?: UseUserMediaOptions,
): UseUserMediaReturn
```
