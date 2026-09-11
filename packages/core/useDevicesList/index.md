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
