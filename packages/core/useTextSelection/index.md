---
category: Sensors
---

# useTextSelection

Reactively track user text selection based on [`Window.getSelection`](https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection) — React port of VueUse's [`useTextSelection`](https://vueuse.org/core/useTextSelection/).

**Mapping:** upstream returns Vue `computed` refs (`text` / `rects` / `ranges`) plus a `shallowRef`
`selection` → one `useState` snapshot of plain values, replaced on every `selectionchange` so all
members update together and the object identity stays stable between changes. The `document`
`selectionchange` listener lives in a self-contained `useEffect` (upstream uses `useEventListener`)
and is removed on unmount; the initial `window.getSelection()` read happens in that mount effect
instead of during setup, so SSR renders the empty snapshot without touching `window` / `document`.

## Usage

```tsx
import { useTextSelection } from '@reaxuse/core'

const { text, rects, ranges, selection } = useTextSelection()
```

<DemoContainer name="UseTextSelection" />

## Type Declarations

```ts
export interface UseTextSelectionOptions extends ConfigurableWindow { }

export interface UseTextSelectionReturn {
  /** The currently selected text. */
  text: string
  /** Bounding rects of the selected ranges. */
  rects: DOMRect[]
  /** Ranges contained in the selection. */
  ranges: Range[]
  /** The raw `Selection` object, or `null` when unavailable. */
  selection: Selection | null
}

export function useTextSelection(options?: UseTextSelectionOptions): UseTextSelectionReturn
```

> `ConfigurableWindow` (`window?: Window`) is the shared options interface re-exported by `useOnline`.

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useTextSelection/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTextSelection/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTextSelection/index.browser.test.ts) (mirrored in `packages/core/src/useTextSelection.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTextSelection/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useTextSelection.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useTextSelection.ts), docs + demo co-located in `packages/core/useTextSelection/`

<Contributors name="useTextSelection" />
