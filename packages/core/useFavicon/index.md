---
category: Browser
---

# useFavicon

Reactive favicon

## Usage

```tsx
import { useFavicon } from '@reause/core'

const [icon, setIcon] = useFavicon()

setIcon('dark.png') // change current icon
```

### Passing a source ref

`newIcon` is a read-only value source and takes a plain `string | null | undefined` (upstream:
`MaybeRef<string | null | undefined>`). Resolve a React ref at the call site; the returned setter
owns the state from mount on, so a new argument is not adopted afterwards:

```tsx
const [icon, setIcon] = useFavicon('dark.png')

setIcon('light.png') // change the favicon
const [refIcon] = useFavicon(iconRef.current) // resolve a React ref at the call site
```
