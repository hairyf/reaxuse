---
category: Reactivity
---

# useStateDefault

Apply default value to a ref

## Usage

```tsx
import { useStateDefault } from '@reaxuse/shared'

const raw = { current: undefined as string | undefined }
const [value, setValue] = useStateDefault(raw, 'default')

setValue('hello')
console.log(value) // 'hello'
console.log(raw.current) // 'hello'

setValue(undefined)
console.log(value) // 'default'

raw.current = 'from outside' // external control — picked up on the next render
```

## Value sources

`source` accepts a `State<T | undefined | null>`: a plain value, a ref-like
`{ current }`, a getter, a `[value, setter]` tuple or a `{ value, onChange }`
pair. `setValue` writes through to the ref-like `current`, the tuple setter or
`onChange`; a plain value / getter source stays read-only.

> **Caveat** — the source contract is `T | undefined | null`, so a
> `[value, setter]` / `{ value, onChange }` source must be typed accordingly
> (e.g. `useState<T | null | undefined>`), because the setter has to accept
> `null` as well.
