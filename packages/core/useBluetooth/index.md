---
category: Browser
---

# useBluetooth

Reactive [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API). Provides the ability to connect and interact with Bluetooth Low Energy peripherals.

The Web Bluetooth API lets websites discover and communicate with devices over the Bluetooth 4 wireless standard using the Generic Attribute Profile (GATT).

N.B. It is currently partially implemented in Android M, Chrome OS, Mac, and Windows 10. For a full overview of browser compatibility please see [Web Bluetooth API Browser Compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API#browser_compatibility)

N.B. There are a number of caveats to be aware of with the web bluetooth API specification. Please refer to the [Web Bluetooth W3C Draft Report](https://webbluetoothcg.github.io/web-bluetooth/) for numerous caveats around device detection and connection.

N.B. This API is not available in Web Workers (not exposed via `WorkerNavigator`).

## Usage

```tsx
import { useBluetooth } from '@reause/core'

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

### Return Values

| Property        | Type                                     | Description                                |
| --------------- | ---------------------------------------- | ------------------------------------------ |
| `isSupported`   | `boolean`                                | Whether the Web Bluetooth API is supported |
| `isConnected`   | `boolean`                                | Whether a device is currently connected    |
| `device`        | `BluetoothDevice \| undefined`           | The connected Bluetooth device             |
| `server`        | `BluetoothRemoteGATTServer \| undefined` | The GATT server for the connected device   |
| `error`         | `unknown \| null`                        | Any error that occurred during connection  |
| `requestDevice` | `() => Promise<void>`                    | Function to request a Bluetooth device     |

Unlike upstream, the members are plain values read off the returned object instead of refs — read them during render (or from `result.current` in tests); no `.value` is involved.

When the device has paired and is connected, you can then work with the `server` object as you wish.

## Usage Battery Level Example

This sample illustrates the use of the Web Bluetooth API to read battery level and be notified of changes from a nearby Bluetooth Device advertising Battery information with Bluetooth Low Energy.

Here, we use the characteristicvaluechanged event listener to handle reading battery level characteristic value. This event listener will optionally handle upcoming notifications as well.

```tsx
import type { BluetoothRemoteGATTCharacteristic } from '@reause/core'
import { useBluetooth, useEventListener } from '@reause/core'
import { useEffect, useState } from 'react'

export default function Component() {
  const {
    isSupported,
    isConnected,
    device,
    requestDevice,
    server,
    error,
  } = useBluetooth({
    acceptAllDevices: true,
    optionalServices: [
      'battery_service',
    ],
  })

  const [batteryPercent, setBatteryPercent] = useState<number>()
  const [batteryLevelCharacteristic, setBatteryLevelCharacteristic]
    = useState<BluetoothRemoteGATTCharacteristic>()

  // Attempt to get the battery levels once, on the initial connection:
  useEffect(() => {
    if (!isConnected || !server || batteryLevelCharacteristic)
      return

    let cancelled = false

    async function getBatteryLevels() {
      // Get the battery service:
      const batteryService = await server.getPrimaryService('battery_service')

      // Get the current battery level characteristic:
      const characteristic = await batteryService.getCharacteristic('battery_level')

      if (cancelled)
        return

      setBatteryLevelCharacteristic(characteristic)

      // Convert received buffer to number:
      const batteryLevel = await characteristic.readValue()
      if (!cancelled)
        setBatteryPercent(batteryLevel.getUint8(0))
    }

    void getBatteryLevels()

    return () => {
      cancelled = true
    }
  }, [isConnected, server, batteryLevelCharacteristic])

  // Listen to when characteristic value changes on `characteristicvaluechanged` event:
  useEventListener(batteryLevelCharacteristic, 'characteristicvaluechanged', (event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic
    setBatteryPercent(target.value.getUint8(0))
  }, { passive: true })

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
      {batteryPercent != null
        ? <div>{`Battery Level: ${batteryPercent}%`}</div>
        : null}
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

More samples can be found on [Google Chrome's Web Bluetooth Samples](https://googlechrome.github.io/samples/web-bluetooth/).
