---
category: Sensors
---

# useFps

Reactive FPS (frames per second)

## Usage

```tsx
import { useFps } from '@reaxuse/core'

const fps = useFps()
// 60

const fpsEvery2 = useFps({ every: 2 }) // measure over every 2 frames
```
