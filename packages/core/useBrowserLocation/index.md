---
category: Browser
---

# useBrowserLocation

Reactive browser location

## Usage

```tsx
import { useBrowserLocation } from '@reaxuse/core'

const location = useBrowserLocation()

// read the current URL parts
const { href, pathname, search, hash } = location
console.log(href) // 'https://example.com/path?q=1#anchor'

// navigate by assigning a writable field
location.hash = '#top'
```

> NOTE: If you're using React Router, use the location utilities provided by
> the router instead.
