---
category: Browser
---

# useFavicon

Reactive favicon — React port of VueUse's
[`useFavicon`](https://vueuse.org/core/useFavicon/).

**Mapping:** upstream keeps the favicon URL in a writable Vue `Ref` and applies
it to the `<link rel="icon">` element(s) in `document.head` through a
`watch(..., { immediate: true })`; here it becomes a `[icon, setIcon]` tuple
backed by `useState` and the DOM write happens in a `useEffect` on the state
(so rendering is SSR-safe — nothing touches the DOM until the mount effect).
The options keep their upstream semantics: `baseUrl` is prepended to the icon
path and `rel` selects which `<link rel>` attribute to manage (defaulting to
`icon`). Passing a ref-like (`{ current }`) or getter source keeps it in sync
— the source is re-read after every render and any change is applied; for a
ref-like source the setter also writes through to its `.current`, mirroring
upstream's "the return ref is the source ref" behavior.

## Usage

```tsx
import { useFavicon } from '@reaxuse/core'

const [icon, setIcon] = useFavicon()

setIcon('dark.png') // change current icon
```

### Passing a source

You can pass a getter to it — changes to the underlying value will be
reflected in your favicon automatically on re-render.

```tsx
import { useFavicon, usePreferredDark } from '@reaxuse/core'

const isDark = usePreferredDark()
const favicon = () => (isDark ? 'dark.png' : 'light.png')

useFavicon(favicon)
```

For a ref-like source the returned setter writes through to the source's
`.current`, just like upstream's "the return ref is identical to the source
ref".

```tsx
const source = { current: 'icon.png' }
const [icon, setIcon] = useFavicon(source)

console.log(icon) // 'icon.png'
console.log(source.current) // 'icon.png'
```

<DemoContainer name="UseFavicon" />

## Type Declarations

```ts
export interface UseFaviconOptions {
  /**
   * The base URL to prepend to the favicon path.
   *
   * @default ''
   */
  baseUrl?: string
  /**
   * Specify a custom `document` instance, e.g. working with iframes or in
   * testing environments. Inlined here — `ConfigurableDocument` is not ported
   * to `@reaxuse/shared`, so `document?` mirrors the option `useTitle` exposes
   * (defaults to the global `document` when not provided).
   */
  document?: Document | null
  /**
   * The `<link>` `rel` attribute to manage.
   *
   * @default 'icon'
   */
  rel?: string
}

export type UseFaviconReturn = [
  icon: string | null | undefined,
  setIcon: Dispatch<SetStateAction<string | null | undefined>>,
]

export function useFavicon(
  newIcon?: MaybeRefOrGetter<string | null | undefined>,
  options?: UseFaviconOptions,
): UseFaviconReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useFavicon/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFavicon/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFavicon/index.browser.test.ts) (mirrored as `packages/core/src/useFavicon.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFavicon/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useFavicon.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useFavicon.ts), docs + demo co-located in `packages/core/useFavicon/`

<Contributors name="useFavicon" />
