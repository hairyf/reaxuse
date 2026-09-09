---
category: Browser
---

# useBluetooth

Reactive [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)

## Usage

```tsx
import { useBluetooth } from '@reaxuse/core'

const {
  isSupported,
  isConnected,
  device,
  requestDevice,
  server,
  error,
} = useBluetooth({
  acceptAllDevices: true,
})
```

Call `requestDevice()` from a user gesture (e.g. a click handler), then work with `server` once `isConnected` is `true`:

```tsx
function Component() {
  const { isSupported, isConnected, device, requestDevice, error } = useBluetooth({
    acceptAllDevices: true,
  })

  return (
    <div>
      <button type="button" onClick={() => void requestDevice()}>
        Request Bluetooth Device
      </button>
      {device
        ? (
            <div>
              Device Name:
              {device.name}
            </div>
          )
        : null}
      <div>{isConnected ? 'Connected' : 'Not Connected'}</div>
      {error
        ? (
            <div>
              Error:
              {String(error)}
            </div>
          )
        : null}
      {isSupported ? null : <div>Your browser does not support the Bluetooth Web API</div>}
    </div>
  )
}
```
