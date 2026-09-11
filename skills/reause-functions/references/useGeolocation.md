---
category: Sensors
---

# useGeolocation

Reactive [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)

## Usage

```tsx
import { useGeolocation } from '@reause/core'

const { coords, locatedAt, error, resume, pause } = useGeolocation()
```

| State     | Type                                                                                     | Description                                                              |
| --------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| coords    | [`Coordinates`](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates) | information about the position retrieved like the latitude and longitude |
| locatedAt | `number \| null`                                                                         | The time of the last geolocation call (epoch ms)                         |
| error     | `GeolocationPositionError \| null`                                                       | The `GeolocationPositionError` in case the geolocation API fails.        |
| resume    | `function`                                                                               | Control function to resume updating geolocation                          |
| pause     | `function`                                                                               | Control function to pause updating geolocation                           |

## Config

`useGeolocation` function takes [PositionOptions](https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions) object as an optional parameter.

## Type Declarations

```ts
/**
 * Specify a custom `navigator` instance, e.g. working with iframes or in
 * testing environments. Declared inline instead of re-exporting upstream's
 * configurable-navigator interface (see `useUserMedia`) to keep the barrel
 * export collision-free.
 */
interface ConfigurableNavigator {
  navigator?: Navigator
}
export interface UseGeolocationOptions
  extends Partial<PositionOptions>, ConfigurableNavigator {
  /**
   * Start watching the position immediately on mount.
   *
   * @default true
   */
  immediate?: boolean
}
export interface UseGeolocationReturn {
  /**
   * Whether the `navigator.geolocation` API is available in the current
   * environment. `false` during render and on the server, resolved in a
   * mount effect.
   */
  isSupported: boolean
  /**
   * Information about the position retrieved like the latitude and longitude.
   */
  coords: Omit<GeolocationPosition["coords"], "toJSON">
  /**
   * The time of the last geolocation call.
   */
  locatedAt: number | null
  /**
   * An error in case the geolocation API fails.
   */
  error: GeolocationPositionError | null
  /**
   * Control function to resume updating geolocation.
   */
  resume: () => void
  /**
   * Control function to pause updating geolocation.
   */
  pause: () => void
}
/**
 * Reactive Geolocation API.
 *
 * Map from @vueuse/core `useGeolocation`
 * (`source/vueuse/packages/core/useGeolocation/`). Returns an object
 * mirroring the upstream members: `{ isSupported, coords, locatedAt, error,
 * resume, pause }`. `coords` holds the latest
 * [`GeolocationCoordinates`](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates)
 * (defaults as upstream: `accuracy: 0` and infinite latitude/longitude,
 * nulls elsewhere), `locatedAt` the timestamp of the last position update,
 * `error` the last `GeolocationPositionError` if any.
 *
 * React divergences:
 * - the Vue shallow refs returned by upstream become plain values read off
 *   the result object (`coords`/`locatedAt`/`error` are state values, and
 *   `isSupported` is a plain boolean settled in the mount effect), so no
 *   `.value` is involved;
 * - the watcher is started in a mount effect (upstream: during setup) when
 *   `immediate` (default `true`), and `resume`/`pause` are stable callbacks
 *   wrapping `navigator.geolocation.watchPosition` / `clearWatch`;
 * - unmount clears the active watch (upstream: `tryOnScopeDispose`), and
 *   there is no `navigator` access during render, so SSR renders the
 *   defaults without starting anything.
 *
 * @see https://vueuse.org/core/useGeolocation/
 * @param options
 *
 * @example
 * const { coords, locatedAt, error, resume, pause } = useGeolocation()
 */
export declare function useGeolocation(
  options?: UseGeolocationOptions,
): UseGeolocationReturn
```
