---
category: Reactivity
alias: useThrottle, throttledRef
---

# useStateThrottled

Throttle changing of a state value — React port of VueUse's
[`refThrottled`](https://vueuse.org/shared/refThrottled/), renamed to
`useStateThrottled` per this repo's `ref*` naming convention.

**Mapping:** upstream `refThrottled(input, delay)` watches a `Ref<T>` and commits a
throttled copy through `useThrottleFn`, returning a single writable ref. This port
owns the state like a `useState` and returns the React tuple
`const [input, setInput, throttled] = useStateThrottled(initial, delay)` — the first
argument only seeds the value, later updates go through `setInput`, and `throttled`
follows at most once per throttle window (same `leading` / `trailing` edges). `delay`,
`trailing` and `leading` are re-read on every change, and pending timers are
cancelled on unmount.

## Usage

```tsx
import { useStateThrottled } from '@reaxuse/shared'

const [input, setInput, throttled] = useStateThrottled('', 1000)
```

An example with an object value.

```tsx
import { useStateThrottled } from '@reaxuse/shared'

const [data, setData, throttled] = useStateThrottled({
  count: 0,
  name: 'foo',
}, 1000)

setData({ count: 1, name: 'foo' })
console.log(throttled) // { count: 1, name: 'foo' } (immediate, leading edge)

setData({ count: 2, name: 'bar' })
setData({ count: 3, name: 'baz' })
setData({ count: 4, name: 'qux' })
console.log(throttled) // { count: 1, name: 'foo' } (still the first value)

// After 1000ms the trailing edge applies the latest change
await sleep(1100)
setData({ count: 5, name: 'final' })
console.log(throttled) // { count: 5, name: 'final' } (updated)
```

### Trailing

If you don't want to watch trailing changes, set the 3rd param `false` (it's
`true` by default):

```tsx
const [input, setInput, throttled] = useStateThrottled('', 1000, false)
```

### Leading

Allows the value to be committed immediately (on the leading edge of the `ms`
timeout). If you don't want this behavior, set the 4th param `false` (it's
`true` by default):

```tsx
const [input, setInput, throttled] = useStateThrottled('', 1000, undefined, false)
```

<DemoContainer name="UseStateThrottled" />

## Type Declarations

```ts
export type UseStateThrottledReturn<T = any> = [
  value: T,
  setValue: Dispatch<SetStateAction<T>>,
  throttled: T,
]

export function useStateThrottled<T = any>(
  value: MaybeRefOrGetter<T>,
  delay?: number,
  trailing?: boolean,
  leading?: boolean,
): UseStateThrottledReturn<T>
```

## Source

- VueUse: [`packages/shared/refThrottled`](https://github.com/vueuse/vueuse/tree/main/packages/shared/refThrottled) — source [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/refThrottled/index.ts), demo [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/shared/refThrottled/demo.vue)
- reaxuse: [`packages/shared/src/useStateThrottled.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useStateThrottled.ts)

<Contributors name="useStateThrottled" />
