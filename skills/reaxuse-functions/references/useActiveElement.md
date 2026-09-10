---
category: Elements
---

# useActiveElement

Reactive `document.activeElement`

## Usage

```tsx
import { useActiveElement } from '@reaxuse/core'

const activeElement = useActiveElement()

// React keyed on the element — re-runs when focus moves
useEffect(() => {
  console.log('focus changed to', activeElement)
}, [activeElement])
```

### Options

| Option             | Type                     | Default                            | Description                                                                                           |
| ------------------ | ------------------------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `deep`             | `boolean`                | `true`                             | Traverse into open shadow roots to find the deeply active element                                     |
| `triggerOnRemoval` | `boolean`                | `false`                            | Re-read the active element when the tracked element is removed from the DOM (`MutationObserver`)      |
| `document`         | `Document \| ShadowRoot` | the resolved `window`'s `document` | Custom `Document` or open `ShadowRoot` to read `activeElement` from — e.g. a shadow root or an iframe |
| `window`           | `Window`                 | the global `window` on the client  | Custom `Window` instance — e.g. an iframe's `window` or a testing environment                         |

### Shadow DOM Support

By default, `useActiveElement` will traverse into shadow DOM to find the deeply active element. Set `deep: false` to disable this behavior.

```tsx
import { useActiveElement } from '@reaxuse/core'

// Only get the shadow host, not the element inside shadow DOM
const activeElement = useActiveElement({ deep: false })
```

### Track Element Removal

Set `triggerOnRemoval: true` to update the active element when the currently active element is removed from the DOM. This uses a `MutationObserver` under the hood.

```tsx
import { useActiveElement } from '@reaxuse/core'

const activeElement = useActiveElement({ triggerOnRemoval: true })
```

### Custom document / window

Read `activeElement` from a different root than the global `document` — an open shadow root, an iframe's document, or a test environment. `document` wins when both are given; otherwise it falls back to the resolved `window`'s `document`. The `blur` / `focus` / `pointerdown` listeners are always bound to the resolved `window`.

```tsx
import { useActiveElement } from '@reaxuse/core'

// Read from an open shadow root instead of document
const activeElement = useActiveElement({ document: shadowRoot })

// Read from another window (its document is used when `document` is omitted)
const activeElementInFrame = useActiveElement({ window: iframe.contentWindow })
```

### React divergences from upstream

- **`undefined` instead of `null`.** The return value is `T | undefined`; upstream returns a `ShallowRef<T | null | undefined>`. The observable difference shows up only when nothing is focused inside the resolved root: upstream holds `null` (an empty `ShadowRoot` has `activeElement === null`), while this port returns `undefined`. For `document`, `activeElement` falls back to `<body>`, so both agree in the common case.
- **Extra `pointerdown` trigger.** Upstream binds only `blur` (re-read when `event.relatedTarget === null`) and `focus`; this port adds a third window listener, `pointerdown`, that re-reads the active element. Observable difference: a pointer press re-reads `activeElement` even when no `focus` / `blur` event follows, so the value can update earlier than upstream would. When the element is unchanged, React bails out of the same-value state update, so no extra re-render occurs.
- **Initial read on mount.** `document.activeElement` is read in the mount effect rather than during setup, so the first render (and SSR) returns `undefined`; upstream reads during setup.
- **Listeners attach in an effect** (upstream composes `useEventListener`) and are removed on unmount.
- **`triggerOnRemoval`** observes the resolved `document` / `ShadowRoot` with a `MutationObserver` directly (upstream composes `onElementRemoval`) and disconnects it on unmount.

## Type Declarations

```ts
export interface UseActiveElementOptions extends ConfigurableWindow {
  /**
   * Custom `document` or open `ShadowRoot` to read `activeElement` from, e.g.
   * working with iframes or in testing environments (upstream:
   * `ConfigurableDocumentOrShadowRoot`). Inlined here —
   * `ConfigurableDocument` is not ported to `@reaxuse/shared`, so `document?`
   * mirrors the option `useDocumentVisibility` exposes.
   *
   * @default the resolved `window`'s `document` on the client
   */
  document?: Document | ShadowRoot
  /**
   * Search active element deeply inside shadow DOM
   *
   * @default true
   */
  deep?: boolean
  /**
   * Track the active element when it is removed from the DOM. Uses a
   * `MutationObserver` under the hood.
   *
   * @default false
   */
  triggerOnRemoval?: boolean
}
/**
 * React port of VueUse's `useActiveElement`.
 *
 * Map from @vueuse/core `useActiveElement`
 * (`source/vueuse/packages/core/useActiveElement/`). Reactively track
 * `document.activeElement` — the focused element, falling back to
 * `document.body` when nothing is focused — re-reading it when focus changes,
 * the window loses focus, or a pointer is pressed (`deep`, default `true`,
 * descends into open shadow roots). The Vue `ShallowRef` return becomes a
 * plain `T | undefined` state value.
 *
 * React divergences:
 * - the Vue `ShallowRef<T | null | undefined>` return becomes a plain
 *   `T | undefined` value — `undefined` wherever upstream would hold `null`
 *   (e.g. nothing focused inside a shadow root);
 * - the `focus` / `blur` / `pointerdown` listeners (upstream composes
 *   `useEventListener`) attach in an effect and are removed on unmount.
 *   `pointerdown` is kept as an additional trigger for environments where
 *   `activeElement` changes without a `focus` event — the current upstream
 *   relies on `focus` / `blur` alone (the listener, in `{ capture: true,
 *   passive: true }`, mirrors upstream);
 * - the `blur` handler re-reads only when `event.relatedTarget === null`, so
 *   focus moving inside the page is handled by the `focus` listener, exactly
 *   as upstream;
 * - the initial `document.activeElement` read happens in the mount effect
 *   instead of during setup, so SSR renders `undefined` without touching
 *   `window` or the DOM;
 * - `triggerOnRemoval` (upstream composes `onElementRemoval`, which wraps
 *   `useMutationObserver`) observes the resolved `document` / `shadowRoot`
 *   directly and re-triggers when the tracked element is removed from the
 *   tree, disconnecting the observer on unmount.
 *
 * SSR-safe: nothing touches `window` or the DOM during render — all reads
 * happen in effects.
 *
 * @see https://vueuse.org/core/useActiveElement/
 * @param options - UseActiveElementOptions
 *
 * @example
 * const activeElement = useActiveElement()
 * // re-renders when focus moves to another element
 */
export declare function useActiveElement<T extends HTMLElement = HTMLElement>(
  options?: UseActiveElementOptions,
): T | undefined
```
