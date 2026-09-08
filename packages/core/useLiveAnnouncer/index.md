---
category: Browser
---

# useLiveAnnouncer

Accessible way to announce messages to screen reader users (ARIA live regions) — React port of VueUse's [`useLiveAnnouncer`](https://vueuse.org/core/useLiveAnnouncer/).

## Usage

```tsx
import { useLiveAnnouncer } from '@reaxuse/core'

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

The hook renders a visually hidden ARIA live region into the document. Calling `announce` (or `polite` / `assertive`) writes a message into the matching region, which screen readers then announce.

The message stays in the live region until it is replaced by the next announcement. Pass a `timeout` (in milliseconds) to automatically clear it after a delay:

```tsx
const { announce, polite, assertive } = useLiveAnnouncer()

// clears the message after 3000ms
announce('Saved successfully', 'polite', 3000)
polite('Saved successfully', 3000)
assertive('Network error', 3000)
```

A new announcement cancels any pending auto-clear for the same mode, so a re-announced message is never wiped early.

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
- Default: `defaultWindow`

The window object where the announcer elements will be created.

## Type Declarations

```ts
export interface UseLiveAnnouncerOptions extends ConfigurableWindow {
  idPrefix?: string
}

export interface UseLiveAnnouncerReturn {
  announce: (message: string, mode?: 'polite' | 'assertive', timeout?: number) => void
  polite: (message: string, timeout?: number) => void
  assertive: (message: string, timeout?: number) => void
}

export function useLiveAnnouncer(options?: UseLiveAnnouncerOptions): UseLiveAnnouncerReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useLiveAnnouncer/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useLiveAnnouncer/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useLiveAnnouncer/index.browser.test.ts) (mirrored in `packages/core/src/useLiveAnnouncer.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useLiveAnnouncer/demo.vue) (ported to `demo.tsx` below).
- reaxuse: [`packages/core/src/useLiveAnnouncer.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useLiveAnnouncer.ts), docs + demo co-located in `packages/core/useLiveAnnouncer/`

<DemoContainer name="UseLiveAnnouncer" />
<Contributors name="useLiveAnnouncer" />
