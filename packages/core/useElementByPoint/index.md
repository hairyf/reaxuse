---
category: Sensors
---

# useElementByPoint

Reactive element by point — React port of VueUse's [`useElementByPoint`](https://vueuse.org/core/useElementByPoint/).

**Mapping:** upstream hit-tests the element under the `x` / `y` point with `document.elementFromPoint`
(`document.elementsFromPoint` when `multiple` is enabled) on every scheduler tick (upstream default
`useRafFn`); here the `ShallowRef<HTMLElement | HTMLElement[] | null>` return becomes a plain `element`
value refreshed on the same rAF loop, and the `ComputedRef<boolean>` `isSupported` becomes a plain
boolean computed in the mount effect. `x` / `y` / `multiple` accept plain values, ref-like `{ current }`
objects or getters (upstream `MaybeRefOrGetter`) and are re-resolved on every tick, so a moving `useMouse`
position updates the hit element automatically. `isActive` / `pause` / `resume` come from the scheduler
(default `useRafFn`, overridable via the `scheduler` option, composed during render — Rules of Hooks).
SSR-safe — no `window` / `document` access during render.

## Usage

```tsx
import { useElementByPoint, useMouse } from '@reaxuse/core'

const { x, y } = useMouse({ type: 'client' })
const { element } = useElementByPoint({ x, y })
```

`x` and `y` accept plain numbers, ref-like objects (`{ current: 0 }`) or getters. When `multiple` is
enabled, `element` is an `HTMLElement[]` with every element under the point (`document.elementsFromPoint`):

```tsx
const { element } = useElementByPoint({ x, y, multiple: true })
```

<DemoContainer name="UseElementByPoint" />

## Type Declarations

```ts
export interface UseElementByPointOptions<Multiple extends boolean = false> {
  x: MaybeRefOrGetter<number>
  y: MaybeRefOrGetter<number>
  multiple?: MaybeRefOrGetter<Multiple>
  document?: Document
  scheduler?: (cb: () => void) => Pausable
}

export interface UseElementByPointReturn<Multiple extends boolean = false> {
  isSupported: boolean
  element: Multiple extends true ? HTMLElement[] : HTMLElement | null
  isActive: boolean
  pause: () => void
  resume: () => void
}

export function useElementByPoint<M extends boolean = false>(
  options: UseElementByPointOptions<M>,
): UseElementByPointReturn<M>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useElementByPoint/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementByPoint/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementByPoint/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useElementByPoint.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useElementByPoint.ts), docs + demo co-located in `packages/core/useElementByPoint/`

<Contributors name="useElementByPoint" />
