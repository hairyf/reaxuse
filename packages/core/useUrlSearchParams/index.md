---
category: Browser
---

# useUrlSearchParams

Reactive [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) — React port of VueUse's [`useUrlSearchParams`](https://vueuse.org/core/useUrlSearchParams/).

**Mapping:** upstream returns a deep-reactive params record backed by a Vue `reactive` object; here the record is a stable proxy over `useState` — property reads, writes, `delete`, `Object.keys` and spread behave like upstream, and every mutation applies a new record object so the component re-renders. Upstream's deep `watchPausable` write-back becomes a commit effect that serializes the record into `window.history` (`replaceState` by default, `pushState` with `writeMode: 'push'`); updates arriving from `popstate`/`hashchange` skip the write-back since the URL already matches, and several mutations in one tick are batched into a single history write. SSR-safe: no `window`/`location` access during render — the record hydrates from the URL in a mount effect, and without a window it stays a shallow copy of `initialValue` (upstream returns `reactive(initialValue)`).

## Usage

```tsx
import { useUrlSearchParams } from '@reaxuse/core'

const params = useUrlSearchParams('history')

console.log(params.foo) // 'bar'

params.foo = 'bar'
// url updated to `?foo=bar`

delete params.foo
// url updated to remove `foo`
```

<DemoContainer name="UseUrlSearchParams" />

## Type Declarations

```ts
export type UrlParams = Record<string, string[] | string>

export interface UseUrlSearchParamsOptions<T> extends ConfigurableWindow {
  /**
   * Remove nullish values from the URL when writing back.
   *
   * @default true
   */
  removeNullishValues?: boolean

  /**
   * Remove falsy values from the URL when writing back.
   *
   * @default false
   */
  removeFalsyValues?: boolean

  /**
   * Fallback params used when the URL carries none (URL params win when
   * present, like upstream) and written back to the URL on hydration.
   *
   * @default {}
   */
  initialValue?: T

  /**
   * Write back to `window.history` automatically when the params state
   * changes. As upstream, this only gates the popstate/hashchange → state
   * sync, not the state → URL write-back.
   *
   * @default true
   */
  write?: boolean

  /**
   * Write mode for `window.history` when `write` is enabled
   * - `replace`: replace the current history entry
   * - `push`: push a new history entry
   *
   * @default 'replace'
   */
  writeMode?: 'replace' | 'push'

  /**
   * Custom function to serialize URL parameters. When provided, this
   * function is used instead of the default `URLSearchParams.toString()`.
   */
  stringify?: (params: URLSearchParams) => string
}

export function useUrlSearchParams<T extends Record<string, any> = UrlParams>(
  mode: 'history' | 'hash' | 'hash-params' = 'history',
  options: UseUrlSearchParamsOptions<T> = {},
): T
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useUrlSearchParams/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useUrlSearchParams/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useUrlSearchParams/index.test.ts) (mirrored in `packages/core/src/useUrlSearchParams.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useUrlSearchParams/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useUrlSearchParams.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useUrlSearchParams.ts), docs + demo co-located in `packages/core/useUrlSearchParams/`

<Contributors name="useUrlSearchParams" />
