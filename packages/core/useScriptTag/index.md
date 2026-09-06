---
category: Browser
---

# useScriptTag

Creates a script tag — React port of VueUse's [`useScriptTag`](https://vueuse.org/core/useScriptTag/), with support for automatically unloading (deleting) the script tag on unmount.

If a script tag already exists for the given URL, `useScriptTag()` will not create another script tag, but keep in mind that depending on how you use it, `useScriptTag()` might have already loaded then unloaded that particular JS file from a previous call of `useScriptTag()`.

**Mapping:** the `scriptTag` shallowRef becomes plain `HTMLScriptElement | null` state and `src` a
plain string; auto-load on mount / auto-unload on unmount happen in a mount `useEffect` (upstream
`tryOnMounted` / `tryOnUnmounted`). Rendering never touches the `document` (SSR-safe) — `load()`
resolves `false` when no `document` exists.

## Usage

```tsx
import { useScriptTag } from '@reaxuse/core'

const { scriptTag, load, unload } = useScriptTag(
  'https://player.twitch.tv/js/embed/v1.js',
  // on script tag loaded.
  (el: HTMLScriptElement) => {
    // do something
  },
)
```

The script will be automatically loaded when the component is mounted and removed when the component is unmounted.

Set `manual: true` to have manual control over the timing to load the script:

```tsx
const { scriptTag, load, unload } = useScriptTag(
  'https://player.twitch.tv/js/embed/v1.js',
  () => {
    // do something
  },
  { manual: true },
)

// manual controls
await load()
await unload()
```

<DemoContainer name="UseScriptTag" />

## Type Declarations

```ts
export interface UseScriptTagOptions {
  /**
   * Load the script immediately
   *
   * @default true
   */
  immediate?: boolean
  /**
   * Manual controls the timing of loading and unloading
   *
   * @default false
   */
  manual?: boolean
  /**
   * Add `async` attribute to the script tag
   *
   * @default true
   */
  async?: boolean
  /**
   * Script type
   *
   * @default 'text/javascript'
   */
  type?: string
  crossOrigin?: 'anonymous' | 'use-credentials'
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url'
  noModule?: boolean
  defer?: boolean
  /**
   * Add custom attribute to the script tag
   */
  attrs?: Record<string, string>
  /**
   * Nonce value for CSP (Content Security Policy)
   *
   * @default undefined
   */
  nonce?: string
  /**
   * Custom `document` instance (upstream folds this option into
   * `ConfigurableDocument`). Resolved lazily at load time and defaults to the
   * global `document`, so importing and rendering on the server is safe.
   */
  document?: Document
}

export interface UseScriptTagReturn {
  scriptTag: HTMLScriptElement | null
  load: (waitForScriptLoad?: boolean) => Promise<HTMLScriptElement | boolean>
  unload: () => void
}

export function useScriptTag(
  src: string,
  onLoaded: (el: HTMLScriptElement) => void,
  options?: UseScriptTagOptions,
): UseScriptTagReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useScriptTag/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useScriptTag/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useScriptTag/index.browser.test.ts) (tests mirrored in `packages/core/src/useScriptTag.test.tsx`);
  upstream ships no `demo.vue` here — the demo below follows the upstream docs usage snippet
- reaxuse: [`packages/core/src/useScriptTag.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useScriptTag.ts), docs + demo co-located in `packages/core/useScriptTag/`

<Contributors name="useScriptTag" />
