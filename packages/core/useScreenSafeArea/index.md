---
category: Browser
---

# useScreenSafeArea

Reactive `env(safe-area-inset-*)`

## Usage

In order to make the page to be fully rendered in the screen, the additional attribute
`viewport-fit=cover` within `viewport` meta tag must be set firstly, the viewport meta tag may look
like this:

```html
<meta name="viewport" content="initial-scale=1, viewport-fit=cover" />
```

Then we could use `useScreenSafeArea` in the component as shown below:

```tsx
import { useScreenSafeArea } from '@reaxuse/core'

const {
  top,
  right,
  bottom,
  left,
  update,
} = useScreenSafeArea()
```
