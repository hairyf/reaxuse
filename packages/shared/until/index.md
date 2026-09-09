---
category: Watch
---

# until

Promised one-time watch for changes

## Usage

### Wait for some async data to be ready

```tsx
import { until } from '@reaxuse/shared'

const isReady = { value: false }
// ... somewhere later: isReady.value = true
const ready = await until(() => isReady.value).toBe(true)
```

### Wait for custom conditions

```tsx
import { until } from '@reaxuse/shared'

const count = { value: 0 }

void until(() => count.value).toMatch(v => v > 7).then(() => {
  alert('Count is now larger than 7!')
})
count.value = 8 // the next poll resolves
```

### Timeout

```tsx
import { until } from '@reaxuse/shared'
// ---cut---
// will resolve once the source reads `true` or after 1000ms
await until(() => ready).toBe(true, { timeout: 1000 })

// will throw if timeout
try {
  await until(() => ready).toBe(true, { timeout: 1000, throwOnTimeout: true })
  // ready === true
}
catch (e) {
  // timeout
}
```

### More Examples

```tsx
import { until } from '@reaxuse/shared'
// ---cut---
await until(() => ready).toBe(true)
await until(() => ready).toBe(true, { timeout: 1000 })
await until(() => value).toMatch(v => v > 10 && v < 100)
await until(() => value).changed()
await until(() => value).changedTimes(10)
await until(() => value).toBeTruthy()
await until(() => value).toBeNull()

await until(() => value).not.toBeNull()
await until(() => value).not.toBeTruthy()
```

## Source

`until(source)` accepts a plain value or a zero-argument getter. The `value`
argument of `toBe(value)` / `toContains(value)` is a plain value.

> **Caveat** — `until` _polls the source it was given_. A plain value is a
> snapshot and never changes between polls, so use a getter when the value can
> change after `until` was called. A `Ref` / `{ current }` object is **not**
> accepted directly — pass `() => ref.current`. A source that is itself a
> function is treated as a getter and invoked.
