---
category: Sensors
related: useDevicesList, usePermission
---

# useUserMedia

Streaming via [`mediaDevices.getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

## Usage

```tsx
import { useUserMedia } from '@reause/core'
import { useEffect, useRef } from 'react'

const { stream, start } = useUserMedia()

const videoRef = useRef<HTMLVideoElement>(null)
useEffect(() => {
  // acquire the stream once mounted
  start()
}, [])

useEffect(() => {
  // preview on a video element
  videoRef.current.srcObject = stream ?? null
}, [stream])
```

### Devices

```tsx
import { useDevicesList, useUserMedia } from '@reause/core'

const {
  videoInputs: cameras,
  audioInputs: microphones,
} = useDevicesList({
  requestPermissions: true,
})
const currentCamera = cameras[0]?.deviceId
const currentMicrophone = microphones[0]?.deviceId

const { stream } = useUserMedia({
  constraints: {
    video: { deviceId: currentCamera },
    audio: { deviceId: currentMicrophone },
  },
})
```
