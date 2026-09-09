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

### Source Forms

`newIcon` is a read-only value source and takes a plain `string | null | undefined` (upstream:
`MaybeRef<string | null | undefined>`). Resolve a React ref at the call site; the returned setter
owns the state from mount on, so a new argument is not adopted afterwards:

```tsx
const [icon, setIcon] = useFavicon('dark.png')

setIcon('light.png') // change the favicon
const [refIcon] = useFavicon(iconRef.current) // resolve a React ref at the call site
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
