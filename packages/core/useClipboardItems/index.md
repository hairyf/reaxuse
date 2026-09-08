---
category: Browser
related:
  - useClipboard
---

# useClipboardItems

Reactive [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API). Provides the ability to respond to clipboard commands (cut, copy, and paste) as well as to asynchronously read from and write to the system clipboard. Access to the contents of the clipboard is gated behind the [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API). Without user permission, reading or altering the clipboard contents is not permitted.

**Mapping:** upstream returns an object of shallow refs (`content`, `copied`) plus the `isSupported` support flag and the `copy` / `read` controls → a plain object of plain values held in `useState`s. `copy` resolves the `source` option at call time through `toValue` (React has no reactive refs), writes the items, then sets `content` and toggles `copied`, which resets after `copiedDuring` via a `useTimeoutFn`. The copy/cut listeners that keep `content` fresh only register when `read: true` and the Clipboard API is supported, and everything is SSR-safe: support is probed in a mount effect, so the first render (and the server) sees the defaults.

## Usage

```tsx
import { useClipboardItems } from '@reaxuse/core'

const source = [
  new ClipboardItem({
    'text/plain': new Blob(['plain text'], { type: 'text/plain' }),
  }),
]

const { content, copy, copied, isSupported } = useClipboardItems({ source })
```

<DemoContainer name="UseClipboardItems" />

## Type Declarations

```ts
export interface UseClipboardItemsOptions<Source> {
  read?: boolean
  source?: Source
  copiedDuring?: number
  navigator?: Navigator
}

export interface UseClipboardItemsReturn<Optional> {
  isSupported: boolean
  content: ClipboardItems
  copied: boolean
  copy: Optional extends true ? (content?: ClipboardItems) => Promise<void> : (content: ClipboardItems) => Promise<void>
  read: () => void
}

export function useClipboardItems(options?: UseClipboardItemsOptions<undefined>): UseClipboardItemsReturn<false>
export function useClipboardItems(options: UseClipboardItemsOptions<RefOrValue<ClipboardItems>>): UseClipboardItemsReturn<true>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useClipboardItems/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useClipboardItems/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useClipboardItems/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useClipboardItems.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useClipboardItems.ts), docs + demo co-located in `packages/core/useClipboardItems/`

<Contributors name="useClipboardItems" />
