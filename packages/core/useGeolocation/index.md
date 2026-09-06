---
category: Sensors
---

# useGeolocation

Reactive [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) — React port of VueUse's [`useGeolocation`](https://vueuse.org/core/useGeolocation/). It allows the user to provide their location to web applications if they so desire. For privacy reasons, the user is asked for permission to report location information.

**Mapping:** upstream returns an object of shallow refs (`coords`, `locatedAt`, `error`, `isSupported`) plus the control functions `resume`/`pause` → a plain object of plain values held in `useState`s. The watch is started in a mount effect (`immediate`, default `true`) via `navigator.geolocation.watchPosition`, `resume`/`pause` wrap `watchPosition`/`clearWatch`, and the active watch is cleared on unmount. SSR-safe — no `navigator` access during render, so the server renders the defaults and nothing starts.

## Usage

```tsx
import { useGeolocation } from '@reaxuse/core'

const { coords, locatedAt, error, resume, pause } = useGeolocation()
```

| State     | Type                                                                                     | Description                                                              |
| --------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| coords    | [`Coordinates`](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates) | information about the position retrieved like the latitude and longitude |
| locatedAt | `number \| null`                                                                         | The time of the last geolocation call (epoch ms)                         |
| error     | `GeolocationPositionError \| null`                                                       | An error message in case geolocation API fails.                          |
| resume    | `function`                                                                               | Control function to resume updating geolocation                          |
| pause     | `function`                                                                               | Control function to pause updating geolocation                           |

## Config

`useGeolocation` function takes [PositionOptions](https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions) object as an optional parameter.

<DemoContainer name="UseGeolocation" />

## Type Declarations

```ts
export interface UseGeolocationOptions extends Partial<PositionOptions>, ConfigurableNavigator {
  immediate?: boolean
}

export interface UseGeolocationReturn {
  isSupported: boolean
  coords: Omit<GeolocationPosition['coords'], 'toJSON'>
  locatedAt: number | null
  error: GeolocationPositionError | null
  resume: () => void
  pause: () => void
}

export function useGeolocation(options?: UseGeolocationOptions): UseGeolocationReturn
```

> `ConfigurableNavigator` (`{ navigator?: Navigator }`) is declared in
> `packages/core/src/useGeolocation.ts` — pass a custom `navigator` instance,
> e.g. working with iframes or in testing environments.

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useGeolocation/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useGeolocation/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useGeolocation/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useGeolocation.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useGeolocation.ts), docs + demo co-located in `packages/core/useGeolocation/`

<Contributors name="useGeolocation" />
