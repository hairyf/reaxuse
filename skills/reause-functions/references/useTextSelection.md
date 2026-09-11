---
category: Sensors
---

# useTextSelection

Reactively track user text selection based on [`Window.getSelection`](https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection)

## Usage

```tsx
import { useTextSelection } from '@reause/core'

const { text, rects, ranges, selection } = useTextSelection()
```

## Type Declarations

```ts
export interface UseTextSelectionOptions extends ConfigurableWindow {}
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
/**
 * React port of VueUse's `useTextSelection`.
 *
 * Map from @vueuse/core `useTextSelection`
 * (`source/vueuse/packages/core/useTextSelection/`). Reactively track user
 * text selection based on
 * [`Window.getSelection`](https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection).
 *
 * React divergences:
 * - the Vue `computed` refs (`text` / `rects` / `ranges`) and the `shallowRef`
 *   `selection` become plain values in a single `useState` snapshot, replaced
 *   on every `selectionchange` so all members update together and the object
 *   identity stays stable between changes;
 * - upstream reads `window.getSelection()` during setup — here the initial
 *   read happens in the mount effect instead (SSR-safe: render never touches
 *   `window` / `document`, so the server renders the empty snapshot);
 * - the `document` `selectionchange` listener lives in a self-contained
 *   `useEffect` (upstream uses `useEventListener`) and is removed on unmount;
 * - upstream's `selection.value = null` re-assign trick to force computed
 *   updates is unnecessary — React replaces the whole snapshot.
 *
 * @example
 * const { text, rects, ranges, selection } = useTextSelection()
 */
export declare function useTextSelection(
  options?: UseTextSelectionOptions,
): UseTextSelectionReturn
```
