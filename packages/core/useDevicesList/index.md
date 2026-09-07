---
category: Sensors
---

# useDevicesList

Reactive [`enumerateDevices`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices) listing available input/output devices — React port of VueUse's [`useDevicesList`](https://vueuse.org/core/useDevicesList/).

**Mapping:** upstream keeps the device list in a `shallowRef` refreshed by `enumerateDevices()` plus a `devicechange` listener, with `computed` kind-filters → `useState` + `useEffect`: `devices`/`permissionGranted`/`isSupported` become plain state, `videoInputs`/`audioInputs`/`audioOutputs` are `useMemo` filters, and the enumeration + listener + optional permission request live in a mount effect gated by `useSupported` (SSR-safe `false` until mounted). `ensurePermissions()` re-queries `navigator.permissions` and prompts via `getUserMedia` when not granted, so `device.label`/`deviceId` become non-empty. Upstream's `onUpdated` option becomes an `onUpdated` registration function in the return (`(fn) => { off }`, `useListener` protocol), fired after every successful enumeration.

## Usage

```tsx
import { useDevicesList } from '@reaxuse/core'

const {
  devices,
  videoInputs: cameras,
  audioInputs: microphones,
  audioOutputs: speakers,
} = useDevicesList()
```

<DemoContainer name="UseDevicesList" />

## Requesting Permissions

To request permissions, use the `ensurePermissions` method.

```tsx
import { useDevicesList } from '@reaxuse/core'

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

## Type Declarations

```ts
export interface UseDevicesListOptions {
  navigator?: Navigator
  requestPermissions?: boolean
  constraints?: MediaStreamConstraints
}

export interface UseDevicesListReturn {
  devices: MediaDeviceInfo[]
  videoInputs: MediaDeviceInfo[]
  audioInputs: MediaDeviceInfo[]
  audioOutputs: MediaDeviceInfo[]
  isSupported: boolean
  permissionGranted: boolean
  ensurePermissions: () => Promise<boolean>
  onUpdated: (fn: (devices: MediaDeviceInfo[]) => void) => { off: () => void }
}

export function useDevicesList(options?: UseDevicesListOptions): UseDevicesListReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useDevicesList/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDevicesList/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDevicesList/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useDevicesList.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useDevicesList.ts), docs + demo co-located in `packages/core/useDevicesList/`
- Upstream ships no test file — the vitest-browser-react suite is written fresh in `packages/core/src/useDevicesList.test.tsx`

<Contributors name="useDevicesList" />
