---
category: Browser
---

# useCssVar

Manipulate CSS variables — React port of VueUse's [`useCssVar`](https://vueuse.org/core/useCssVar/).

**Mapping:** upstream's single writable Vue `ShallowRef` return becomes the `[value, setValue]` tuple (see
[hairyf/reaxuse#100](https://github.com/hairyf/reaxuse/issues/100)). The value is read from the target element's computed
style (falling back to `document.documentElement`), kept in state and written back to the element's inline style;
setting `null`/`undefined` through the setter removes the property. The prop accepts a string, a ref-like `{ current }`
object or a getter; the target accepts a ref-like `{ current: HTMLElement | null }` object or an element. Because React
refs are not reactive, a ref-like target/key is re-resolved on the next render (a changing key re-reads the variable via
an effect).

## Usage

```tsx
import { useCssVar } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLDivElement>(null)
const [color1, setColor1] = useCssVar('--color', el)
// force a re-render (e.g. with your own state) once `el` is populated

const [key] = useState('--color')
const [colorVal, setColorVal] = useCssVar(key, el)

const [color2, setColor2] = useCssVar('--color', el, { initialValue: '#eee' })
setColor2(null) // removes the --color property from the element
```

<DemoContainer name="UseCssVar" />

## Type Declarations

```ts
export interface UseCssVarOptions extends ConfigurableWindow {
  /**
   * Initial value, also the SSR default — no `document` access happens during render.
   *
   * @default undefined
   */
  initialValue?: string
  /**
   * Use MutationObserver to monitor variable changes.
   *
   * @default false
   */
  observe?: boolean
}

export type UseCssVarElement = HTMLElement | SVGElement | null | undefined

export type UseCssVarReturn = [
  value: string | null | undefined,
  setValue: Dispatch<SetStateAction<string | null | undefined>>,
]

export function useCssVar(
  prop: MaybeRefOrGetter<string | null | undefined>,
  target?: MaybeRefOrGetter<UseCssVarElement>,
  options?: UseCssVarOptions,
): UseCssVarReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useCssVar/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useCssVar/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useCssVar/index.test.ts) (tests mirrored in `packages/core/src/useCssVar.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useCssVar/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useCssVar.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useCssVar.ts), docs + demo co-located in `packages/core/useCssVar/`

<Contributors name="useCssVar" />
