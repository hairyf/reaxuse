---
category: Sensors
---

# useDeviceOrientation

Reactive [DeviceOrientationEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent)

## Usage

```tsx
import { useDeviceOrientation } from '@reause/core'

const { isAbsolute, alpha, beta, gamma } = useDeviceOrientation()
```

| State      | Type              | Description                                                                                                       |
| ---------- | ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| isAbsolute | `boolean \| null` | Whether the device orientation is absolute (relative to the Earth's coordinate system) or relative to the device. |
| alpha      | `number \| null`  | The rotation of the device around the z axis (0–360 degrees).                                                     |
| beta       | `number \| null`  | The rotation of the device around the x axis (−180–180 degrees).                                                  |
| gamma      | `number \| null`  | The rotation of the device around the y axis (−90–90 degrees).                                                    |

You can find [more information about the state on the MDN](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent#instance_properties).
