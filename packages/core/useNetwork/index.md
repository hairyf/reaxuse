---
category: Sensors
---

# useNetwork

Reactive [Network status](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API) — React port of VueUse's [`useNetwork`](https://vueuse.org/core/useNetwork/). The Network Information API provides information about the system's connection in terms of general connection type (e.g., 'wifi', 'cellular', etc.). This can be used to select high definition content or low definition content based on the user's connection. The entire API consists of the addition of the NetworkInformation interface and a single property to the Navigator interface: Navigator.connection.

**Mapping:** the `isOnline`/`offlineAt`/`downlink`/`downlinkMax`/`effectiveType`/`saveData`/`type`
shallowRefs become plain state values and `isSupported` (upstream `useSupported`) a plain boolean —
all resolved in a mount `useEffect` that also subscribes the window `online`/`offline` listeners and
the `connection` `change` listener (upstream `useEventListener`, passive) and removes them on
unmount. The initial network read happens in the mount effect, so nothing touches `navigator` during
render (SSR-safe). Upstream's `onlineAt`/`rtt` members are dropped to keep the port aligned with the
documented usage.

## Usage

```tsx
import { useNetwork } from '@reaxuse/core'

const { isOnline, offlineAt, downlink, downlinkMax, effectiveType, saveData, type } = useNetwork()

console.log(isOnline)
```

<DemoContainer name="UseNetwork" />

## Type Declarations

```ts
export type NetworkType = 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown'
export type NetworkEffectiveType = 'slow-2g' | '2g' | '3g' | '4g'

export interface UseNetworkOptions {
  window?: Window
}

export interface UseNetworkReturn {
  isSupported: boolean
  isOnline: boolean
  offlineAt: number | undefined
  downlink: number | undefined
  downlinkMax: number | undefined
  effectiveType: NetworkEffectiveType | undefined
  saveData: boolean | undefined
  type: NetworkType
}

export function useNetwork(options?: UseNetworkOptions): UseNetworkReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useNetwork/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useNetwork/index.ts) (implementation),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/core/useNetwork/index.md) (docs),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useNetwork/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useNetwork.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useNetwork.ts), docs + demo co-located in `packages/core/useNetwork/`

<Contributors name="useNetwork" />
