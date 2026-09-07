---
category: Sensors
---

# useDeviceMotion

Reactive [DeviceMotionEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent) — React port of VueUse's [`useDeviceMotion`](https://vueuse.org/core/useDeviceMotion/). Provides web developers with information about the speed of changes for the device's position and orientation.

**Mapping:** upstream returns an object of shallow refs → a plain object of plain values held in `useState`s (no `.value`). The `devicemotion` window listener attaches in a mount `useEffect` (passive), removed on unmount. `isSupported` / `requirePermissions` are resolved in the same mount effect — nothing touches `DeviceMotionEvent` during render, so the server renders the defaults (SSR-safe). iOS: when the platform requires permission (`requirePermissions`), call `ensurePermissions()` from a user interaction — the API starts automatically once granted; pass `requestPermissions: true` to request on mount instead.

## Usage

```tsx
import { useDeviceMotion } from '@reaxuse/core'

const {
  acceleration,
  accelerationIncludingGravity,
  rotationRate,
  interval,
  isSupported,
} = useDeviceMotion()
```

> Note: For iOS, you need to use `ensurePermissions` and bind it with user interaction.
> After permission is granted, the API will run automatically.

| State                        | Type            | Description                                                                                                          |
| ---------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------- |
| acceleration                 | `object`        | An object giving the acceleration of the device on the three axis X, Y and Z.                                        |
| accelerationIncludingGravity | `object`        | An object giving the acceleration of the device on the three axis X, Y and Z with the effect of gravity.             |
| rotationRate                 | `object`        | An object giving the rate of change of the device's orientation on the three orientation axis alpha, beta and gamma. |
| interval                     | `Number`        | A number representing the interval of time, in milliseconds, at which data is obtained from the device.              |
| isSupported                  | `boolean`       | Whether the current environment supports the `DeviceMotionEvent` API.                                                |
| requirePermissions           | `boolean`       | Whether the platform requires permission to use the API.                                                             |
| ensurePermissions            | `Promise<void>` | An async function to request user permission. The API runs automatically once permission is granted.                 |
| permissionGranted            | `boolean`       | Whether the user has granted permission. The default is always `false`.                                              |

You can find [more information about the state on the MDN](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent#instance_properties).

<DemoContainer name="UseDeviceMotion" />

## Type Declarations

```ts
export interface UseDeviceMotionOptions extends ConfigurableWindow {
  /**
   * Request for permissions immediately if it's not granted,
   * otherwise label and deviceIds could be empty
   *
   * @default false
   */
  requestPermissions?: boolean

  /**
   * Filter for if events should to be received (upstream:
   * `ConfigurableEventFilter`).
   *
   * @default invoke directly
   */
  eventFilter?: EventFilter
}

export interface UseDeviceMotionReturn {
  acceleration: DeviceMotionEventAcceleration | null
  accelerationIncludingGravity: DeviceMotionEventAcceleration | null
  rotationRate: DeviceMotionEventRotationRate | null
  interval: number
  isSupported: boolean
  requirePermissions: boolean
  ensurePermissions: () => Promise<void>
  permissionGranted: boolean
}

export function useDeviceMotion(options?: UseDeviceMotionOptions): UseDeviceMotionReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useDeviceMotion/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDeviceMotion/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDeviceMotion/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useDeviceMotion.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useDeviceMotion.ts), docs + demo co-located in `packages/core/useDeviceMotion/`

<Contributors name="useDeviceMotion" />
