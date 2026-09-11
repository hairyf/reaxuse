---
category: Browser
---

# useImage

Reactive load an image in the browser

## Usage

```tsx
import { useImage } from '@reause/core'

const avatarUrl = 'https://place.dog/300/200'
const { isLoading } = useImage({ src: avatarUrl })
```

```tsx
const { isLoading, error, url } = useImage({ src: avatarUrl })

if (isLoading)
  return <span>Loading...</span>

if (error)
  return <span>Failed to load image</span>

return <img src={url} alt="avatar" />
```
