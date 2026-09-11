---
category: Browser
---

# useUrlSearchParams

Reactive [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

## Usage

```tsx
import { useUrlSearchParams } from '@reause/core'

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

### Hash Mode

When using with hash mode route, specify the `mode` to `hash`

```tsx
import { useUrlSearchParams } from '@reause/core'

const [params, setParams] = useUrlSearchParams('hash')

setParams({ ...params, foo: 'bar', vueuse: 'awesome' })
// url updated to `#/your/route?foo=bar&vueuse=awesome`
```

### Hash Params

When using with history mode route, but want to use hash as params, specify the `mode` to `hash-params`

```tsx
import { useUrlSearchParams } from '@reause/core'

const [params, setParams] = useUrlSearchParams('hash-params')

setParams({ ...params, foo: 'bar', vueuse: 'awesome' })
// url updated to `/your/route#foo=bar&vueuse=awesome`
```

### Custom Stringify Function

You can provide a custom function to serialize URL parameters using the `stringify` option. This is useful when you need special formatting for your query string.

```tsx
import { useUrlSearchParams } from '@reause/core'

// Custom stringify function that removes equal signs for empty values
const [params, setParams] = useUrlSearchParams('history', {
  stringify: (searchParams) => {
    return searchParams.toString().replace(/=(&|$)/g, '$1')
  },
})

setParams({ ...params, foo: '', bar: 'value' })
// url updated to `?foo&bar=value` instead of `?foo=&bar=value`
```
