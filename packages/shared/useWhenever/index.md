---
category: Watch
---

# useWhenever

Shorthand for watching value to be truthy — React port of VueUse's [`whenever`](https://vueuse.org/shared/whenever/).

**Mapping:** upstream `whenever` is Vue's `watch` plus a truthy guard. This port becomes a
`useEffect` watching `[value]`: the callback runs every time the value changes to a truthy one,
the initial mount is skipped unless `immediate`, and the previous value is tracked in a ref
(mirroring `watch`'s `oldValue`, which advances through falsy values too). There is no stop
handle — React tears the effect down on unmount automatically.

## Usage

```tsx
import { useWhenever } from '@reaxuse/shared'

// this
useWhenever(ready, () => console.log(state))

// is equivalent to:
useEffect(() => {
  if (ready)
    console.log(state)
}, [ready])
```

### Callback Function

The callback will be called with `cb(value, oldValue)`.

```tsx
import { useWhenever } from '@reaxuse/shared'

useWhenever(height, (current, lastHeight) => {
  if (current > lastHeight)
    console.log(`Increasing height by ${current - lastHeight}`)
})
```

### Options

Fire the callback on mount if the value is already truthy.

```tsx
import { useWhenever } from '@reaxuse/shared'

useWhenever(ready, () => console.log(state), { immediate: true })
```

<DemoContainer name="UseWhenever" />

## Type Declarations

```ts
export type Truthy<T> = T extends false | null | undefined ? never : T

export interface UseWheneverOptions {
  /**
   * Fire the callback on mount if the value is already truthy
   *
   * @default false
   */
  immediate?: boolean
}

export function useWhenever<T>(
  value: T,
  cb: (value: Truthy<T>, oldValue: T | undefined) => void,
  options?: UseWheneverOptions,
): void
```

## Source

- VueUse: [`packages/shared/whenever`](https://github.com/vueuse/vueuse/tree/main/packages/shared/whenever) — source [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/whenever/index.ts), tests [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/whenever/index.test.ts) mirrored in [`packages/shared/src/useWhenever.test.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWhenever.test.tsx)
- reaxuse: [`packages/shared/src/useWhenever.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWhenever.ts)

<Contributors name="useWhenever" />
