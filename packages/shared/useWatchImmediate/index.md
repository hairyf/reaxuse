---
category: Watch
---

# useWatchImmediate

Shorthand for watching value with `{ immediate: true }`

## Usage

Similar to `useWatch`, but the callback also fires once on mount with the
current value.

```tsx
import { useWatchImmediate } from '@reaxuse/shared'

const [obj, setObj] = useState('vue-use')

// changing the value from some external store/composables
setObj('VueUse')

useWatchImmediate(obj, (updated) => {
  console.log(updated) // Console.log will be logged twice
})
```
