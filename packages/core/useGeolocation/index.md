---
category: Sensors
---

# useGeolocation

Reactive [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)

## Usage

```tsx
import { useGeolocation } from '@reaxuse/core'

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
