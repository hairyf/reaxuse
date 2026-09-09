---
category: Browser
---

# useFavicon

Reactive favicon

## Usage

```tsx
import { useFavicon } from '@reaxuse/core'

const [icon, setIcon] = useFavicon()

setIcon('dark.png') // change current icon
```

### Passing a source

You can pass a React ref to it — changes to the underlying value will be
reflected in your favicon automatically on re-render.

```tsx
import { useFavicon, usePreferredDark } from '@reaxuse/core'

const isDark = usePreferredDark()
const favicon = () => (isDark ? 'dark.png' : 'light.png')

useFavicon(favicon)
```

For a ref source the returned setter writes through to the source's
`.current`, just like upstream's "the return ref is identical to the source
ref".

```tsx
const source = { current: 'icon.png' }
const [icon, setIcon] = useFavicon(source)

console.log(icon) // 'icon.png'
console.log(source.current) // 'icon.png'
```
