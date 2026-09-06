---
category: Browser
---

# useNavigatorLanguage

Reactive [navigator.language](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/language) — React port of VueUse's [`useNavigatorLanguage`](https://vueuse.org/core/useNavigatorLanguage/).

**Mapping:** `shallowRef(navigator?.language)` + `useEventListener(window, 'languagechange', ...)`
→ `useState`-backed `isSupported` and `language` values updated by a self-contained `useEffect`
subscribing the window `languagechange` listener (upstream `useEventListener`, passive) and
removing it on unmount. `isSupported` (upstream `useSupported`) and the initial
`navigator.language` read are computed in the mount effect, so nothing touches `navigator` during
render (SSR-safe); the `language` state updates on the `languagechange` event, so read it directly
instead of `watch`ing it.

## Usage

```tsx
import { useNavigatorLanguage } from '@reaxuse/core'

const { language, isSupported } = useNavigatorLanguage()
// `language` is a `string | undefined` state — the component re-renders on
// the window `languagechange` event
```

<DemoContainer name="UseNavigatorLanguage" />

## Type Declarations

```ts
export interface UseNavigatorLanguageOptions extends ConfigurableWindow {
  window?: Window
}

export interface UseNavigatorLanguageReturn {
  isSupported: boolean
  language: string | undefined
}

export function useNavigatorLanguage(options?: UseNavigatorLanguageOptions): UseNavigatorLanguageReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useNavigatorLanguage/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useNavigatorLanguage/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useNavigatorLanguage/index.browser.test.ts) (tests mirrored in `packages/core/src/useNavigatorLanguage.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useNavigatorLanguage/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useNavigatorLanguage.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useNavigatorLanguage.ts), docs + demo co-located in `packages/core/useNavigatorLanguage/`

<Contributors name="useNavigatorLanguage" />
