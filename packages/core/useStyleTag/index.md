---
category: Browser
---

# useStyleTag

Inject reactive `style` element in head.

## Usage

### Basic usage

Provide a CSS string, then `useStyleTag` will automatically generate an id and inject it in `<head>`.

```tsx
import { useStyleTag } from '@reaxuse/core'

const [css, setCss, { id, load, unload, isLoaded }] = useStyleTag('.foo { margin-top: 32px; }')

// Later you can modify styles
setCss('.foo { margin-top: 64px; }')
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

If you need to define your own id, you can pass `id` as first argument.

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

## Return Values

- `css` — the current CSS text of the style tag (plain state, seeded by the initial argument).
- `setCss(next | prev => next)` — replaces the CSS text: updates the injected `<style>` while loaded, and
  is stored for the next `load()` otherwise.
- `controls.id` — the DOM id of the style tag.
- `controls.load()` — inject the style tag into `document.head` (no-op when already loaded).
- `controls.unload()` — remove the style tag from `document.head` (reference-counted, so style tags
  shared by id are only removed with the last unloaded instance).
- `controls.isLoaded` — whether the style tag is currently injected.

The return is a React tuple `[css, setCss, { id, load, unload, isLoaded }]` — upstream returns an object
`{ id, css: ShallowRef<string>, load, unload, isLoaded }`, where `css` is a writable ref.
