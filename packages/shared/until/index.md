---
category: Watch
---

# until

Promised one-time watch for changes

## Usage

### Wait for some async data to be ready

```tsx
import { until } from '@reaxuse/shared'

const isReady = { current: false }
// ... somewhere later: isReady.current = true
const ready = await until(isReady).toBe(true)
```

### Wait for custom conditions

```tsx
import { until } from '@reaxuse/shared'

const count = { current: 0 }

void until(count).toMatch(v => v > 7).then(() => {
  alert('Count is now larger than 7!')
})
```

### Timeout

```tsx
import { until } from '@reaxuse/shared'
// ---cut---
// will be resolved until `ref.current === true` or 1000ms passed
await until(ref).toBe(true, { timeout: 1000 })

// will throw if timeout
try {
  await until(ref).toBe(true, { timeout: 1000, throwOnTimeout: true })
  // ref.current === true
}
catch (e) {
  // timeout
}
```

### More Examples

```tsx
import { until } from '@reaxuse/shared'
// ---cut---
await until(ref).toBe(true)
await until(ref).toBe(true, { timeout: 1000 })
await until(ref).toMatch(v => v > 10 && v < 100)
await until(ref).changed()
await until(ref).changedTimes(10)
await until(ref).toBeTruthy()
await until(ref).toBeNull()

await until(ref).not.toBeNull()
await until(ref).not.toBeTruthy()
```
