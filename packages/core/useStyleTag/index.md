---
category: Browser
---

# useStyleTag

Inject reactive `style` element in head — React port of VueUse's
[`useStyleTag`](https://vueuse.org/core/useStyleTag/).

**Mapping:** the initial `css` argument is a plain string and the returned `css` is a setter — call
`css('...')` to update the injected `<style>` (upstream: writable ref, `css.value = '...'`). The
element is injected from a mount `useEffect` (the `immediate` + `manual` options, like upstream's
`tryOnMounted`) and removed on unmount unless `manual: true` (upstream: `tryOnScopeDispose`).
`isLoaded` is a plain boolean state. Shared-id instances are reference-counted, so a `<style>` tag
is only removed with its last unloaded instance.

## Usage

### Basic usage

Provide a CSS string, then `useStyleTag` will automatically generate an id and inject it in `<head>`.

```tsx
import { useStyleTag } from '@reaxuse/core'

const {
  id,
  css,
  load,
  unload,
  isLoaded,
} = useStyleTag('.foo { margin-top: 32px; }')

// Later you can modify styles
css('.foo { margin-top: 64px; }')
```

This code will be injected to `<head>`:

```html
<style id="reaxuse_styletag_1">
  .foo {
    margin-top: 64px;
  }
</style>
```

### Custom ID

If you need to define your own id, you can pass `id` in the options.

```tsx
import { useStyleTag } from '@reaxuse/core'
// ---cut---
useStyleTag('.foo { margin-top: 32px; }', { id: 'custom-id' })
```

```html
<!-- injected to <head> -->
<style id="custom-id">
  .foo {
    margin-top: 32px;
  }
</style>
```

### Media query

You can pass media attributes as last argument within object.

```tsx
import { useStyleTag } from '@reaxuse/core'
// ---cut---
useStyleTag('.foo { margin-top: 32px; }', { media: 'print' })
```

```html
<!-- injected to <head> -->
<style id="reaxuse_styletag_1" media="print">
  .foo {
    margin-top: 32px;
  }
</style>
```

<DemoContainer name="UseStyleTag" />

## Type Declarations

```ts
export interface UseStyleTagOptions {
  /**
   * Media query for styles to apply
   */
  media?: string
  /**
   * Load the style immediately
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
   * DOM id of the style tag
   *
   * @default auto-incremented (`reaxuse_styletag_N`)
   */
  id?: string
  /**
   * Nonce value for CSP (Content Security Policy)
   *
   * @default undefined
   */
  nonce?: string
  /**
   * Specify a custom `document` instance, e.g. working with iframes or in
   * testing environments.
   */
  document?: Document
}

export interface UseStyleTagReturn {
  /**
   * DOM id of the style tag
   */
  id: string
  /**
   * Set the CSS text of the style tag — updates the live `<style>` element
   * while loaded, and is stored for the next `load()` otherwise
   */
  css: (value: string) => void
  /**
   * Inject the style tag into `document.head` (no-op when already loaded)
   */
  load: () => void
  /**
   * Remove the style tag from `document.head` (reference-counted for shared ids)
   */
  unload: () => void
  /**
   * Whether the style tag is currently injected
   */
  isLoaded: boolean
}

export declare function useStyleTag(
  css: string,
  options?: UseStyleTagOptions,
): UseStyleTagReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useStyleTag/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useStyleTag/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useStyleTag/index.test.ts) (mirrored in `packages/core/src/useStyleTag.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useStyleTag/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useStyleTag.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useStyleTag.ts), docs + demo co-located in `packages/core/useStyleTag/`

<Contributors name="useStyleTag" />
