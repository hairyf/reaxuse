---
category: Browser
---

# useClipboard

Reactive [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) — React port of VueUse's [`useClipboard`](https://vueuse.org/core/useClipboard/). Copy text to the system clipboard, optionally track the current clipboard text on `copy`/`cut` events, and fall back to `document.execCommand` when the native API is unavailable.

**Mapping:** upstream's `ShallowRef<string>` / `ShallowRef<boolean>` returns become plain React `useState` values (`text`, `copied`, `copyPending`), and the `ComputedRef<boolean>` `isSupported` becomes plain boolean state resolved through `useSupported` in a mount effect (SSR-safe). Upstream's maybe-ref `source` is resolved with the shared `toValue`, and the `copy` callback is stable — it reads the latest `source`/`navigator`/permission state through refs. The `copy`/`cut` listeners are wired in a `useEffect` (guarded by `isSupported && read`) with cleanup, instead of upstream's synchronous `useEventListener` call.

## Usage

```tsx
import { useClipboard } from '@reaxuse/core'

const { text, copy, copied, isSupported } = useClipboard({ source: 'Hello' })

copy('Hello') // writes to the clipboard; `copied` auto-resets after 1.5s
```

Pass React state directly — the hook always reads the latest value, so reactive sources need no wrapper:

```tsx
const [source, setSource] = useState('Hello')
const { text, copy, copied } = useClipboard({ source })

setSource('World')
copy() // copies 'World'
```

<DemoContainer name="UseClipboard" />

## Type Declarations

```ts
export interface UseClipboardOptions<Source> {
  read?: boolean
  source?: Source
  copiedDuring?: number
  legacy?: boolean
  navigator?: Navigator
}

type ClipboardValue = string | (() => Promise<string | undefined>)

export interface UseClipboardReturn<Optional> {
  isSupported: boolean
  text: string
  copied: boolean
  copyPending: boolean
  copy: Optional extends true
    ? (text?: ClipboardValue) => Promise<void>
    : (text: ClipboardValue) => Promise<void>
}

export function useClipboard(options?: UseClipboardOptions<undefined>): UseClipboardReturn<false>
export function useClipboard(options: UseClipboardOptions<RefOrValue<string>>): UseClipboardReturn<true>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useClipboard/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useClipboard/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useClipboard/index.test.ts) + [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useClipboard/index.browser.test.ts) (mirrored in `packages/core/src/useClipboard.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useClipboard/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useClipboard.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useClipboard.ts), docs + demo co-located in `packages/core/useClipboard/`

<Contributors name="useClipboard" />
