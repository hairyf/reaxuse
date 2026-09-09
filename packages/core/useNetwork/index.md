---
category: Sensors
---

# useNetwork

Reactive [Network status](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)

## Usage

```tsx
import { useNetwork } from '@reaxuse/core'

const { isOnline, offlineAt, onlineAt, downlink, downlinkMax, effectiveType, saveData, rtt, type } = useNetwork()

console.log(isOnline)
```
