---
category: Sensors
---

# useBattery

Reactive [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API), more often referred to as the Battery API, provides information about the system's battery charge level and lets you be notified by events that are sent when the battery level or charging status change. This can be used to adjust your app's resource usage to reduce battery drain when the battery is low, or to save changes before the battery runs out in order to prevent data loss.

Map from @vueuse/core `useBattery` (`source/vueuse/packages/core/useBattery/`). React port of VueUse's [`useBattery`](https://vueuse.org/core/useBattery/) — returns an object mirroring the upstream members `isSupported`, `charging`, `chargingTime`, `dischargingTime`, `level` as plain values held in `useState`s.

**Adjustment for React:** the upstream Vue shallow refs become plain state values read off the result object, so no `.value` is involved. `isSupported` comes from `useSupported` (resolves in a mount effect, stays `false` on the server) and gates a mount effect that acquires the battery manager via `navigator.getBattery()`, reads its initial state and registers the four battery event listeners (`chargingchange`, `chargingtimechange`, `dischargingtimechange`, `levelchange`), which are removed again in cleanup on unmount — there is no `navigator` access during render, so SSR renders the defaults without acquiring anything.

## Usage

```tsx
import { useBattery } from '@reaxuse/core'

const { isSupported, charging, chargingTime, dischargingTime, level } = useBattery()
```

| State           | Type      | Description                                                       |
| --------------- | --------- | ----------------------------------------------------------------- |
| isSupported     | `boolean` | If the Battery Status API is supported in the current browser.    |
| charging        | `boolean` | If the device is currently charging.                              |
| chargingTime    | `number`  | The number of seconds until the device becomes fully charged.     |
| dischargingTime | `number`  | The number of seconds before the device becomes fully discharged. |
| level           | `number`  | A number between 0 and 1 representing the current charge level.   |

::: warning Browser Support
The Battery Status API has limited browser support. It is currently only available in Chromium-based browsers. Always check `isSupported` before using the values.
:::

## Use-cases

Our applications normally are not empathetic to battery level, we can make a few adjustments to our applications that will be more friendly to low battery users.

- Trigger a special "dark-mode" battery saver theme settings.
- Stop auto playing videos in news feeds.
- Disable some background workers that are not critical.
- Limit network calls and reduce CPU/Memory consumption.

<DemoContainer name="UseBattery" />

## Type Declarations

```ts
export interface UseBatteryOptions extends ConfigurableNavigator {}

export interface UseBatteryReturn {
  isSupported: boolean
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
}

export function useBattery(options?: UseBatteryOptions): UseBatteryReturn
```

> `ConfigurableNavigator` (`{ navigator?: Navigator }`) is the interface
> exported by `packages/core/src/useUserMedia.ts` — pass a custom `navigator`
> instance, e.g. working with iframes or in testing environments.

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useBattery/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBattery/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBattery/demo.vue) (ported to `demo.tsx` below).
  Upstream ships no `index.test.ts` for `useBattery`, so no upstream tests are
  mirrored — `packages/core/src/useBattery.test.tsx` covers the behavior from
  scratch.
- reaxuse: [`packages/core/src/useBattery.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useBattery.ts), docs + demo co-located in `packages/core/useBattery/`

<Contributors name="useBattery" />
