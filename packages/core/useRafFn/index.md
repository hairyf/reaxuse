---
category: Animation
---

# useRafFn

Call function on every `requestAnimationFrame` — React port of VueUse's
[`useRafFn`](https://vueuse.org/core/useRafFn/). The returned
`{ isActive, pause, resume }` controls inspect, stop and restart the frame
loop; `immediate: true` (default) starts it on mount.

**Mapping:** upstream's rAF chain + `isActive` ref + `tryOnScopeDispose(pause)`
→ `useState` + a self-contained `useEffect` whose cleanup pauses the loop.
`fpsLimit` is a `MaybeRefOrGetter` resolved with `toValue` on every frame, so
a React ref-like `{ current }` limit updates live; the `once` option stops the
loop after the first run.

## Usage

```tsx
import { useRafFn } from '@reaxuse/core'
import { useState } from 'react'

const [count, setCount] = useState(0)

const { pause, resume } = useRafFn(() => {
  setCount(c => c + 1)
  console.log(count)
})
```

<DemoContainer name="UseRafFn" />

## Type Declarations

```ts
export interface UseRafFnCallbackArguments {
  delta: number
  timestamp: DOMHighResTimeStamp
}

export interface UseRafFnOptions extends ConfigurableWindow {
  immediate?: boolean // @default true
  fpsLimit?: MaybeRefOrGetter<number | null> // @default null
  once?: boolean // @default false
}

export interface UseRafFnReturn {
  isActive: boolean
  pause: () => void
  resume: () => void
}

export function useRafFn(
  fn: (args: UseRafFnCallbackArguments) => void,
  options?: UseRafFnOptions,
): UseRafFnReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useRafFn/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useRafFn/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useRafFn/index.browser.test.ts) (mirrored in `packages/core/src/useRafFn.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useRafFn/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useRafFn.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useRafFn.ts), docs + demo co-located in `packages/core/useRafFn/`

<Contributors name="useRafFn" />
