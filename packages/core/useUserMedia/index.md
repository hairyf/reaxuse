---
category: Sensors
---

# useUserMedia

Reactive [`mediaDevices.getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) streaming

## Usage

```tsx
import { useUserMedia } from '@reaxuse/core'

const { stream, start } = useUserMedia()
start()

const videoRef = useRef<HTMLVideoElement>(null)
useEffect(() => {
  // preview on a video element
  videoRef.current.srcObject = stream ?? null
}, [stream])
```
