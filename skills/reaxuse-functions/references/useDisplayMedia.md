---
category: Sensors
related: useUserMedia
---

# useDisplayMedia

Reactive [`mediaDevices.getDisplayMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia) streaming

## Usage

```tsx
import { useDisplayMedia } from '@reaxuse/core'

const { stream, start } = useDisplayMedia()
start()

const videoRef = useRef<HTMLVideoElement>(null)
useEffect(() => {
  // preview on a video element
  videoRef.current.srcObject = stream ?? null
}, [stream])
```

## Type Declarations

```ts
/**
 * Options for `useDisplayMedia`.
 */
export interface UseDisplayMediaOptions extends ConfigurableNavigator {
  /**
   * If the stream is enabled. With an initial `true` the stream is acquired
   * automatically once mounted (and supported).
   * @default false
   */
  enabled?: boolean
  /**
   * If the stream video media constraints
   */
  video?: boolean | MediaTrackConstraints | undefined
  /**
   * If the stream audio media constraints
   */
  audio?: boolean | MediaTrackConstraints | undefined
}
/**
 * Return type of `useDisplayMedia`.
 */
export interface UseDisplayMediaReturn {
  isSupported: boolean
  stream: MediaStream | undefined
  start: () => Promise<MediaStream | undefined>
  stop: () => void
  /**
   * Whether the stream is currently enabled (acquired). A writable control
   * mirroring upstream's `enabled` ref — read it to render the current
   * state, write it through `setEnabled`.
   */
  enabled: boolean
  /**
   * Set the `enabled` control: `setEnabled(true)` acquires the stream (like
   * `start()`), `setEnabled(false)` stops it (like `stop()`). Accepts the
   * React functional-updater form (`setEnabled(prev => !prev)`).
   */
  setEnabled: Dispatch<SetStateAction<boolean>>
}
/**
 * React port of VueUse's `useDisplayMedia`.
 *
 * Map from @vueuse/core `useDisplayMedia`
 * (`source/vueuse/packages/core/useDisplayMedia/`). Reactive
 * [`mediaDevices.getDisplayMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)
 * streaming.
 *
 * Adjustment for React:
 * - the Vue `stream`/`isSupported` refs become plain state values read off
 *   the result object (no `.value`);
 * - `enabled` mirrors upstream's writable control ref as plain boolean state
 *   paired with `setEnabled`: `setEnabled(true)` acquires the stream (like
 *   `start()`), `setEnabled(false)` stops it (like `stop()`), and the
 *   `enabled` option only seeds the initial value (upstream reads the option
 *   once during setup too) — a rejected acquisition leaves `enabled` `true`
 *   and `enabled` is `true` immediately at mount, before the stream
 *   resolves, matching upstream's edge cases;
 * - `start`/`stop` are stable callbacks reading the latest state and options
 *   through refs; the effect keyed on `enabled` mirrors upstream's
 *   `watch(enabled, ..., { immediate: true })`, driving `start`/`stop` on
 *   every change. The auto-start call swallows its rejection (a
 *   fire-and-forget background acquisition must not surface an unhandled
 *   rejection); manual `start()` calls still propagate errors;
 * - upstream's per-track `useEventListener(t, 'ended', stop)` becomes one
 *   effect keyed on the stream binding an `ended` listener to every track,
 *   removed when the stream changes or the hook unmounts;
 * - concurrent `start()` calls share one pending acquisition (React effects
 *   can re-run; upstream's watcher fires once);
 * - stopping the capture on unmount is an intentional React addition:
 *   React effects own the resources they create, so unmounting stops the
 *   acquired tracks (upstream has no `tryOnScopeDispose(stop)` and leaves
 *   the capture running).
 *
 * @see https://vueuse.org/useDisplayMedia
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const { stream, start } = useDisplayMedia()
 * start()
 * // preview on a video element
 * videoEl.srcObject = stream
 */
export declare function useDisplayMedia(
  options?: UseDisplayMediaOptions,
): UseDisplayMediaReturn
```
