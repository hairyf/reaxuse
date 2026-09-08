---
category: Browser
---

# useBluetooth

Reactive [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) — React port of VueUse's [`useBluetooth`](https://vueuse.org/core/useBluetooth/). Provides the ability to connect and interact with Bluetooth Low Energy peripherals.

The Web Bluetooth API lets websites discover and communicate with devices over the Bluetooth 4 wireless standard using the Generic Attribute Profile (GATT).

N.B. It is currently partially implemented in Android M, Chrome OS, Mac, and Windows 10. For a full overview of browser compatibility please see [Web Bluetooth API Browser Compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API#browser_compatibility).

N.B. There are a number of caveats to be aware of with the web bluetooth API specification. Please refer to the [Web Bluetooth W3C Draft Report](https://webbluetoothcg.github.io/web-bluetooth/) for numerous caveats around device detection and connection.

N.B. This API is not available in Web Workers (not exposed via WorkerNavigator).

**Mapping:** upstream returns an object of shallow refs (`device`, `server`, `error`) plus a boolean ref `isConnected` and the `requestDevice` control function → a plain object of plain values held in `useState`s. `requestDevice` opens the browser's device chooser (must be called from a user gesture) and stores the picked device in `device`; an effect keyed on `device` auto-connects to its GATT server (`server`, `isConnected`), a per-device `gattserverdisconnected` listener resets the connection state, and unmount disconnects the GATT server (upstream `tryOnScopeDispose`). `isSupported` (upstream `useSupported`) is resolved in a mount effect, so SSR renders the defaults.

## Usage Default

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

<DemoContainer name="UseBluetooth" />

## Type Declarations

```ts
export type BluetoothServiceUUID = string | number

export interface BluetoothLEScanFilter {
  services?: BluetoothServiceUUID[]
  name?: string
  namePrefix?: string
}

export interface BluetoothRemoteGATTServer {
  readonly connected: boolean
  readonly device: BluetoothDevice
  connect: () => Promise<BluetoothRemoteGATTServer>
  disconnect: () => void
  getPrimaryService: (service: BluetoothServiceUUID) => Promise<BluetoothRemoteGATTService>
  getPrimaryServices: (service?: BluetoothServiceUUID) => Promise<BluetoothRemoteGATTService[]>
}

export interface BluetoothDevice extends EventTarget {
  readonly id: string
  readonly name?: string
  readonly gatt?: BluetoothRemoteGATTServer
  readonly connected?: boolean
}

export interface UseBluetoothRequestDeviceOptions {
  filters?: BluetoothLEScanFilter[] | undefined
  optionalServices?: BluetoothServiceUUID[] | undefined
}

export interface UseBluetoothOptions extends UseBluetoothRequestDeviceOptions, ConfigurableNavigator {
  acceptAllDevices?: boolean
}

export interface UseBluetoothReturn {
  isSupported: boolean
  isConnected: boolean
  device: BluetoothDevice | undefined
  requestDevice: () => Promise<void>
  server: BluetoothRemoteGATTServer | undefined
  error: unknown | null
}

export function useBluetooth(options?: UseBluetoothOptions): UseBluetoothReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useBluetooth/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBluetooth/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBluetooth/index.browser.test.ts) (tests mirrored in `packages/core/src/useBluetooth.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBluetooth/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useBluetooth.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useBluetooth.ts), docs + demo co-located in `packages/core/useBluetooth/`

<Contributors name="useBluetooth" />
