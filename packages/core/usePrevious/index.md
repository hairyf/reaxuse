---
category: Utilities
---

# usePrevious

Holds the previous value of a source — React port of VueUse's [`usePrevious`](https://vueuse.org/core/usePrevious/).

**Mapping:** `shallowRef` + `watch(..., { flush: 'sync' })` → a `useRef` cache updated in a `useEffect` keyed
on the value. The hook returns the value the source had on the previous render — `undefined` until the first
change. The update happens after each committed change, so it stays `undefined` during render and on the server
(SSR-safe). React values are plain, so the source is a plain value instead of a `MaybeRefOrGetter`, and the hook
returns the value itself instead of a readonly shallow ref.

## Usage

```tsx
import { usePrevious } from '@reaxuse/core'

const previous = usePrevious(counter) // `undefined` until the first change
// after each change, `previous` is the value the source had before it
```

<DemoContainer name="UsePrevious" />

## Type Declarations

```ts
export function usePrevious<T>(value: T): T | undefined
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/usePrevious/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePrevious/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePrevious/index.browser.test.ts) (mirrored to `packages/core/src/usePrevious.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePrevious/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/usePrevious.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/usePrevious.ts), docs + demo co-located in `packages/core/usePrevious/`

<Contributors name="usePrevious" />
