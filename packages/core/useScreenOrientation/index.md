---
category: Browser
---

# useScreenOrientation

Reactive [Screen Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Orientation_API)

## Usage

```tsx
import { useScreenOrientation } from '@reause/core'

const {
  isSupported,
  orientation,
  angle,
  lockOrientation,
  unlockOrientation,
} = useScreenOrientation()
```

To lock the orientation, you can pass an [OrientationLockType](https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/type) to the lockOrientation function:

```tsx
lockOrientation('portrait-primary')
```

and then unlock again, with the following:

```tsx
unlockOrientation()
```

Accepted orientation types are one of `"landscape-primary"`, `"landscape-secondary"`, `"portrait-primary"`, `"portrait-secondary"`, `"any"`, `"landscape"`, `"natural"` and `"portrait"`.

[Screen Orientation API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Orientation_API)
