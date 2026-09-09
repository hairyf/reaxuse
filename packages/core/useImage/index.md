---
category: Browser
---

# useImage

Reactive load an image in the browser

## Usage

```tsx
import { useImage } from '@reaxuse/core'

const avatarUrl = 'https://place.dog/300/200'
const { isLoading } = useImage({ src: avatarUrl })
```

While the image is loading you can show a fallback, and when it fails you can
render an error state:

```tsx
const { isLoading, error, url } = useImage({ src: avatarUrl })

if (isLoading)
  return <span>Loading...</span>

if (error)
  return <span>Failed to load image</span>

return <img src={url} alt="avatar" />
```

## Manual Control

Set `immediate: false` to defer the load and trigger it yourself with
`execute()`, optionally passing a delay in milliseconds:

```tsx
const { isLoading, execute } = useImage({ src: avatarUrl }, { immediate: false })

function handleClick() {
  execute()
}
```

## Component Usage

Not ported — upstream ships a `UseImage` component (Vue, render-slot based);
in React the hook is used directly.
