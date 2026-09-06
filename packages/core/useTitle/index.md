---
category: Browser
---

# useTitle

Reactive document title — React port of VueUse's [`useTitle`](https://vueuse.org/core/useTitle/).

**Mapping:** upstream's writable Vue `Ref` return becomes a `[title, setTitle]` tuple backed by
`useState`, and the `watch` write becomes a `useEffect` on the state. Upstream adopts
`document.title` synchronously at setup (`newTitle ?? document.title`) — React must initialize
state during render without touching `document` (SSR-safe), so the adoption happens in a mount
effect and the value is `newTitle ?? null` during the first render / on the server. The options
keep their upstream semantics: `titleTemplate` (string with a `%s` placeholder or a function),
`restoreOnUnmount` (defaults to restoring the pre-hook title) and `observe` (a MutationObserver
on the `<title>` element, ignored when `titleTemplate` is set).

## Usage

```tsx
import { useTitle } from '@reaxuse/core'

const [title, setTitle] = useTitle()
console.log(title) // print current title
setTitle('Hello') // change current title
```

<DemoContainer name="UseTitle" />

## Type Declarations

```ts
export interface UseTitleOptions {
  /**
   * Specify a custom `document` instance, e.g. working with iframes or in
   * testing environments.
   */
  document?: Document | null
  /**
   * Restore the original title when unmounted
   * @param originTitle original title
   * @returns restored title
   */
  restoreOnUnmount?: false | ((originalTitle: string, currentTitle: string) => string | null | undefined)
  /**
   * Observe `document.title` changes using a MutationObserver.
   * Cannot be used together with `titleTemplate` option.
   *
   * @default false
   */
  observe?: boolean
  /**
   * The template string to parse the title (e.g., '%s | My Website')
   * Cannot be used together with `observe` option.
   *
   * @default '%s'
   */
  titleTemplate?: string | ((title: string) => string)
}

export type UseTitleReturn = [
  title: string | null | undefined,
  setTitle: Dispatch<SetStateAction<string | null | undefined>>,
]

export function useTitle(
  newTitle?: string | null | undefined,
  options?: UseTitleOptions,
): UseTitleReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useTitle/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTitle/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTitle/index.browser.test.ts) (mirrored tests),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTitle/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useTitle.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useTitle.ts), docs + demo co-located in `packages/core/useTitle/`

<Contributors name="useTitle" />
