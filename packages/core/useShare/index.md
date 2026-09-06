---
category: Browser
---

# useShare

Reactive [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) — React port of VueUse's [`useShare`](https://vueuse.org/core/useShare/).

**Mapping:** upstream derives `isSupported` through its shared supported-check helper (a computed
re-evaluated on mount); here it is plain boolean state resolved in a mount effect — `false` during
render and on the server (SSR-safe), `true` when the navigator exposes `canShare` (upstream's exact
check). Upstream's `MaybeRefOrGetter` options become plain values read through a latest-value ref,
so the `share` callback stays stable across renders and always shares the newest options. Call-time
overrides merge over the hook options (overrides win), `canShare` still gates the call, and the
browser promise passes through untouched — a user-cancelled share (AbortError) rejects to the caller.

> The `share` method has to be called following a user gesture like a button click. It can't simply
> be called on page load for example. That's in place to help prevent abuse.

## Usage

```tsx
import { useShare } from '@reaxuse/core'

const { share, isSupported } = useShare()

function startShare() {
  share({
    title: 'Hello',
    text: 'Hello my friend!',
    url: location.href,
  })
}
```

Reactive options need no wrapper in React — pass state directly, the hook always reads the latest
values:

```tsx
const [text, setText] = useState('foo')
const { share } = useShare({ text })

setText('bar')
share() // shares `{ text: 'bar' }`
```

<DemoContainer name="UseShare" />

## Type Declarations

```ts
export interface UseShareOptions {
  title?: string
  files?: File[]
  text?: string
  url?: string
}

export interface UseShareReturn {
  isSupported: boolean
  share: (overrideOptions?: UseShareOptions) => Promise<void>
}

export function useShare(shareOptions?: UseShareOptions, options?: { navigator?: Navigator }): UseShareReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useShare/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useShare/index.ts) (implementation),
  [`demo.client.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useShare/demo.client.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useShare.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useShare.ts), docs + demo co-located in `packages/core/useShare/`

<Contributors name="useShare" />
