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
