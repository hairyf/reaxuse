---
category: Browser
---

# useLiveAnnouncer

Accessible way to announce messages to screen reader users (ARIA live regions)

## Usage

```tsx
import { useLiveAnnouncer } from '@reause/core'

function ScreenReaderNotifications() {
  const { announce, polite, assertive } = useLiveAnnouncer()

  return (
    <div>
      <button type="button" onClick={() => announce('This is a polite announcement')}>
        Announce
      </button>
      <button type="button" onClick={() => polite('This is also a polite announcement')}>
        Announce Polite
      </button>
      <button type="button" onClick={() => assertive('Important message!')}>
        Announce Assertive
      </button>
    </div>
  )
}
```

The message stays in the live region until it is replaced by the next announcement. Pass a `timeout` (in milliseconds) to automatically clear it after a delay:

```tsx
const { announce, polite, assertive } = useLiveAnnouncer()

// clears the message after 3000ms
announce('Saved successfully', 'polite', 3000)
polite('Saved successfully', 3000)
assertive('Network error', 3000)
```

## Accessibility

The announcer uses the following ARIA attributes:

- **Polite**: `role="status"`, `aria-live="polite"`, `aria-atomic="true"`
- **Assertive**: `role="alert"`, `aria-live="assertive"`, `aria-atomic="true"`

These ensure robust support across different screen readers.

## Options

### idPrefix

- Type: `string`
- Default: `'vueuse-live-announcer'`

Prefix for the id of the announcer elements. The generated elements will have IDs `${idPrefix}-container`, `${idPrefix}-polite`, and `${idPrefix}-assertive`.

### window

- Type: `Window`
- Default: the global `window` (`undefined` on the server)

The window object where the announcer elements will be created.

## Type Declarations

```ts
export interface UseLiveAnnouncerOptions extends ConfigurableWindow {
  /**
   * The prefix for the id of the announcer elements.
   * @default 'vueuse-live-announcer'
   */
  idPrefix?: string
}
export interface UseLiveAnnouncerReturn {
  announce: (
    message: string,
    mode?: "polite" | "assertive",
    timeout?: number,
  ) => void
  polite: (message: string, timeout?: number) => void
  assertive: (message: string, timeout?: number) => void
}
/**
 * React port of VueUse's `useLiveAnnouncer`.
 *
 * Map from @vueuse/core `useLiveAnnouncer`
 * (`source/vueuse/packages/core/useLiveAnnouncer/`). Accessible way to
 * announce messages to screen reader users (ARIA live regions).
 *
 * The hook maintains a visually-hidden `<div>` (per `idPrefix`) containing a
 * `polite` (`role="status"`, `aria-live="polite"`) and an `assertive`
 * (`role="alert"`, `aria-live="assertive"`) region. `announce(message, mode,
 * timeout)` writes the message into the region with the given mode (default
 * `'polite'`), optionally auto-clearing it after `timeout` ms; a new
 * announcement cancels any pending auto-clear for the same mode so a
 * previously scheduled clear can never wipe a fresh message. `polite` /
 * `assertive` are shorthand for `announce` with a fixed mode.
 *
 * React divergences:
 * - upstream registers cleanup on the active effect scope
 *   (`tryOnScopeDispose`); here the DOM regions are created in a mount effect
 *   and torn down on unmount, so nothing touches the DOM during render or on
 *   the server (SSR-safe no-op when no `window` / `document` is available);
 * - the module-level `announcerMap` reference counting is kept 1:1: the
 *   container is only removed when the last mounted hook sharing an
 *   `idPrefix` unmounts;
 * - upstream `nextTick` becomes a microtask flush (see `nextTick` above);
 * - the return object `{ announce, polite, assertive }` mirrors upstream and
 *   is identity-stable across renders;
 * - the `window` option defaults to the global `window` (`undefined` on the
 *   server, where the hook becomes a no-op) — upstream's `defaultWindow`
 *   symbol is inlined here because the shared package does not export it.
 *
 * @example
 * const { announce, polite, assertive } = useLiveAnnouncer()
 *
 * announce('This is a polite announcement')
 * polite('This is also a polite announcement')
 * assertive('Important message!')
 */
export declare function useLiveAnnouncer(
  options?: UseLiveAnnouncerOptions,
): UseLiveAnnouncerReturn
```
