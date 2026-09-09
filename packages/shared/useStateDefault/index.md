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
