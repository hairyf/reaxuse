---
category: Browser
---

# useHash

Shorthand for a reactive `window.location.hash`.

## Usage

```tsx
import { useHash } from '@reaxuse/core'

const [hash, setHash] = useHash()

console.log(hash) // '#foobar'
setHash('foobar') // window.location.hash becomes '#foobar'
```

Pass a default value exposed while the hash is empty, and pick the history mode used when writing it:

```tsx
import { useHash } from '@reaxuse/core'
// ---cut---
const [hash, setHash] = useHash('foobar', { mode: 'push' })
setHash('') // clears the hash, `hash` falls back to 'foobar'
```
