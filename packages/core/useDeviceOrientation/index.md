---
category: Sensors
---

# useDeviceOrientation

Reactive [DeviceOrientationEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent) — React port of VueUse's [`useDeviceOrientation`](https://vueuse.org/core/useDeviceOrientation/). Provides information about the physical orientation of the device, as detected by a device sensor such as a gyroscope.

**Mapping:** upstream returns an object of Vue refs → a plain object of plain values held in `useState`s (no `.value`). All four values start `null` and update on every `deviceorientation` event; the window listener attaches in a mount `useEffect` (passive) and is removed on unmount — nothing touches `window` during render, so the server renders the defaults (SSR-safe).

## Usage

```tsx
import { useDeviceOrientation } from '@reaxuse/core'

const { isAbsolute, alpha, beta, gamma } = useDeviceOrientation()
```

| State      | Type              | Description                                                                                                       |
| ---------- | ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| isAbsolute | `boolean \| null` | Whether the device orientation is absolute (relative to the Earth's coordinate system) or relative to the device. |
| alpha      | `number \| null`  | The rotation of the device around the z axis (0–360 degrees).                                                     |
| beta       | `number \| null`  | The rotation of the device around the x axis (−180–180 degrees).                                                  |
| gamma      | `number \| null`  | The rotation of the device around the y axis (−90–90 degrees).                                                    |

You can find [more information about the state on the MDN](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent#instance_properties).

<DemoContainer name="UseDeviceOrientation" />

## Type Declarations

```ts
export interface UseDeviceOrientationOptions extends ConfigurableWindow {}

export interface UseDeviceOrientationReturn {
  isAbsolute: boolean | null
  alpha: number | null
  beta: number | null
  gamma: number | null
}

export function useDeviceOrientation(options?: UseDeviceOrientationOptions): UseDeviceOrientationReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useDeviceOrientation/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDeviceOrientation/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDeviceOrientation/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useDeviceOrientation.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useDeviceOrientation.ts), docs + demo co-located in `packages/core/useDeviceOrientation/`

<Contributors name="useDeviceOrientation" />
