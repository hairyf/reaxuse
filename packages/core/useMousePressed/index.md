---
category: Sensors
---

# useMousePressed

Reactive mouse pressing state — React port of VueUse's [`useMousePressed`](https://vueuse.org/core/useMousePressed/).

**Mapping:** the Vue return object (`pressed` / `sourceType` shallow refs) becomes a plain `{ pressed, sourceType }` object backed by React state — `pressed` is a boolean and `sourceType` is `'mouse' | 'touch' | null`. The upstream `mousedown`/`touchstart` (optionally `dragstart`) listeners attach to the `target` option (default `window`) in a mount `useEffect`; the `mouseup`/`mouseleave`/`touchend`/`touchcancel` (optionally `drop`/`dragend`) release listeners attach to `window`, all removed on unmount. `touch` and `drag` are enabled by default, mirroring upstream. SSR-safe — listeners only attach in the mount effect and `initialValue` seeds the state.

## Usage

```tsx
import { useMousePressed } from '@reaxuse/core'

const { pressed, sourceType } = useMousePressed()

// only detect mouse changes
const mouse = useMousePressed({ touch: false })

// only capture presses on a specific element (accepts an element, a ref-like
// `{ current }` object or a getter)
const el = useRef<HTMLDivElement>(null)
const { pressed } = useMousePressed({ target: el })
```

<DemoContainer name="UseMousePressed" />

## Type Declarations

```ts
export type UseMouseSourceType = 'mouse' | 'touch' | null

export interface UseMousePressedOptions extends ConfigurableWindow {
  /**
   * Listen to `touchstart` `touchend` events
   *
   * @default true
   */
  touch?: boolean

  /**
   * Listen to `dragstart` `drop` and `dragend` events
   *
   * @default true
   */
  drag?: boolean

  /**
   * Add event listeners with the `capture` option set to `true`
   *
   * @default false
   */
  capture?: boolean

  /**
   * Initial values
   *
   * @default false
   */
  initialValue?: boolean

  /**
   * Element target to be capture the click
   */
  target?: MaybeRefOrGetter<EventTarget | null | undefined>

  /**
   * Callback to be called when the mouse is pressed
   */
  onPressed?: (event: MouseEvent | TouchEvent | DragEvent) => void

  /**
   * Callback to be called when the mouse is released
   */
  onReleased?: (event: MouseEvent | TouchEvent | DragEvent) => void
}

export interface UseMousePressedReturn {
  pressed: boolean
  sourceType: UseMouseSourceType
}

export function useMousePressed(options?: UseMousePressedOptions): UseMousePressedReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useMousePressed/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMousePressed/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMousePressed/index.browser.test.ts) (mirrored in `packages/core/src/useMousePressed.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMousePressed/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useMousePressed.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useMousePressed.ts), docs + demo co-located in `packages/core/useMousePressed/`

<Contributors name="useMousePressed" />
