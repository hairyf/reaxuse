---
category: Browser
---

# useScriptTag

Creates a script tag

## Usage

```tsx
import { useScriptTag } from '@reaxuse/core'

const { scriptTag, load, unload } = useScriptTag(
  'https://player.twitch.tv/js/embed/v1.js',
  // on script tag loaded.
  (el: HTMLScriptElement) => {
    // do something
  },
)
```

The script will be automatically loaded when the component is mounted and removed when the component is unmounted.

Set `manual: true` to have manual control over the timing to load the script:

```tsx
const { scriptTag, load, unload } = useScriptTag(
  'https://player.twitch.tv/js/embed/v1.js',
  () => {
    // do something
  },
  { manual: true },
)

// manual controls
await load()
await unload()
```
