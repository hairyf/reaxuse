---
category: Browser
---

# useUrlSearchParams

Reactive [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

## Usage

```tsx
import { useUrlSearchParams } from '@reaxuse/core'

const [params, setParams] = useUrlSearchParams('history')

console.log(params.foo) // 'bar'

setParams({ ...params, foo: 'bar' })
// url updated to `?foo=bar`

setParams((prev) => {
  const next = { ...prev }
  delete next.foo
  return next
})
// url updated to remove `foo`
```
