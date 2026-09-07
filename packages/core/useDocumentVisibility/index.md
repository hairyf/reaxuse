---
category: Elements
---

# useDocumentVisibility

Reactively track [`document.visibilityState`](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState) — React port of VueUse's [`useDocumentVisibility`](https://vueuse.org/core/useDocumentVisibility/).

**Mapping:** upstream returns a `ShallowRef<DocumentVisibilityState>` seeded with `document.visibilityState` and
subscribes via `useEventListener` → a plain `DocumentVisibilityState` value (`'visible' | 'hidden'`) held in a
`useState` + a self-contained `useEffect` subscribing to the document `visibilitychange` event (passive), removed
on unmount. The initial `visibilityState` read happens in the mount effect, so SSR renders the `'visible'` default
without touching `document` (matching upstream's no-document value).

## Usage

```tsx
import { useDocumentVisibility } from '@reaxuse/core'

const visibility = useDocumentVisibility() // 'visible' | 'hidden'
```

<DemoContainer name="UseDocumentVisibility" />

## Type Declarations

```ts
export interface UseDocumentVisibilityOptions {
  /**
   * Specify a custom `document` instance, e.g. working with iframes or in
   * testing environments. Inlined here — `ConfigurableDocument` is not ported
   * to `@reaxuse/shared`, so `document?` mirrors the option `useFileDialog`
   * exposes (defaults to the global `document` when not provided).
   *
   * @default typeof document !== 'undefined' ? document : undefined
   */
  document?: Document | null
}

export function useDocumentVisibility(options?: UseDocumentVisibilityOptions): DocumentVisibilityState
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useDocumentVisibility/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDocumentVisibility/index.ts) (implementation),
  [`component.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDocumentVisibility/component.ts) (component variant — not ported),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDocumentVisibility/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useDocumentVisibility.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useDocumentVisibility.ts), docs + demo co-located in `packages/core/useDocumentVisibility/`

<Contributors name="useDocumentVisibility" />
