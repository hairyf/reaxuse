---
category: Watch
---

# useWatchImmediate

Shorthand for watching value with `{ immediate: true }` — React port of
VueUse's [`watchImmediate`](https://vueuse.org/shared/watchImmediate/).

**Mapping:** built on the house `useWatch`. Upstream is a shorthand for
`watch(source, cb, { ...options, immediate: true })`; this port hardcodes the
same `immediate: true`, so the callback fires once on mount with the current
value (old value `undefined`), then again on every subsequent change with
`(value, oldValue)`. Upstream's remaining options (`deep`, `flush`) are not
ported.

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

<DemoContainer name="UseWatchImmediate" />

## Type Declarations

```ts
export function useWatchImmediate<T extends any[]>(source: readonly [...T], callback: UseWatchCallback<[...T]>): void
export function useWatchImmediate<T>(source: T, callback: UseWatchCallback<T>): void
```

## Source

- VueUse docs: [`watchImmediate`](https://vueuse.org/shared/watchImmediate/)
- VueUse source: [`packages/shared/watchImmediate/index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchImmediate/index.ts)
- VueUse tests: [`packages/shared/watchImmediate/index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchImmediate/index.test.ts)
- reaxuse: [`packages/shared/src/useWatchImmediate.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatchImmediate.ts)

<Contributors name="useWatchImmediate" />
