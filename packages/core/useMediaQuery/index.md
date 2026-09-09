---
category: Browser
---

# useMediaQuery

Reactive [Media Query](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Testing_media_queries)

## Usage

```tsx
import { useMediaQuery } from '@reaxuse/core'

const isLargeScreen = useMediaQuery('(min-width: 1024px)')
const isPreferredDark = useMediaQuery('(prefers-color-scheme: dark)')
```

### Server Side Rendering

If you are using `useMediaQuery` with SSR enabled, specify which screen size you would like to
render on the server and before hydration to avoid a hydration mismatch:

```tsx
const isLarge = useMediaQuery('(min-width: 1024px)', {
  ssrWidth: 768, // Will enable SSR mode and render like if the screen was 768px wide
})

console.log(isLarge) // always false because ssrWidth of 768px is smaller than 1024px
useEffect(() => {
  console.log(isLarge) // false if screen is smaller than 1024px, true if larger than 1024px
}, [isLarge])
```
