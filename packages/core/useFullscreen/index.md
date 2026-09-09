---
category: Browser
---

# useFullscreen

Reactive [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)

## Usage

```tsx
import { useFullscreen } from '@reaxuse/core'

const { isFullscreen, enter, exit, toggle } = useFullscreen()
```

Fullscreen specified element. Some platforms (like iOS's Safari) only allow fullscreen on video elements.

```tsx
import { useFullscreen } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLVideoElement>(null)
const { isFullscreen, enter, exit, toggle } = useFullscreen(el)

// <video ref={el} controls />
```

## Component Usage

Not ported — upstream ships a `UseFullscreen` component (Vue, render-slot based); in React the hook is used directly.
