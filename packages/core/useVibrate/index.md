---
category: Browser
---

# useVibrate

Reactive [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)

## Usage

```tsx
import { useVibrate } from '@reaxuse/core'

// This vibrates the device for 300 ms,
// then pauses for 100 ms before vibrating the device again for another 300 ms:
const { vibrate, stop, isSupported } = useVibrate({ pattern: [300, 100, 300] })

// Start the vibration, it stops automatically when the pattern is complete:
vibrate()

// But if you want to stop it, you can:
stop()
```
