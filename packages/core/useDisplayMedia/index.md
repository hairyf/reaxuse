---
category: Sensors
related: useUserMedia
---

# useDisplayMedia

Reactive [`mediaDevices.getDisplayMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia) streaming

## Usage

```tsx
import { useDisplayMedia } from '@reaxuse/core'

const { stream, start } = useDisplayMedia()
start()

const videoRef = useRef<HTMLVideoElement>(null)
useEffect(() => {
  // preview on a video element
  videoRef.current.srcObject = stream ?? null
}, [stream])
```
