---
category: Utilities
---

# useConfirmDialog

Creates event hooks to support modals and confirmation dialog chains

## Functions and hooks

- `reveal()` - triggers `onReveal` hook and sets `isRevealed` to `true`. Returns promise that resolves by `confirm()` or `cancel()`.
- `confirm()` - sets `isRevealed` to `false` and triggers `onConfirm` hook.
- `cancel()` - sets `isRevealed` to `false` and triggers `onCancel` hook.

## Basic Usage

### Using hooks

The returned `onReveal` / `onConfirm` / `onCancel` are stable registration functions following the `useListener` protocol — each accepts a callback and returns an `off` handle, so listeners never leak and never fire after the component unmounts:

```tsx
import { useConfirmDialog } from '@reaxuse/core'
import { useListener } from '@reaxuse/shared'

const { isRevealed, reveal, confirm, cancel, onReveal, onConfirm, onCancel }
  = useConfirmDialog()

useListener(onReveal, () => {
  // modal shown
})

function Component() {
  return (
    <>
      <button type="button" onClick={() => reveal()}>
        Reveal Modal
      </button>

      {isRevealed && (
        <div className="modal-bg">
          <div className="modal">
            <h2>Confirm?</h2>
            <button type="button" onClick={() => confirm()}>
              Yes
            </button>
            <button type="button" onClick={() => cancel()}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}
```

### Promise

If you prefer working with promises:

```tsx
import { useConfirmDialog } from '@reaxuse/core'

const {
  isRevealed,
  reveal,
  confirm,
  cancel,
} = useConfirmDialog()

async function openDialog() {
  const { data, isCanceled } = await reveal()
  if (!isCanceled)
    console.log(data)
}
```

`useConfirmDialog` accepts an optional React ref source (`RefObject<boolean>`, e.g. the result of `useRef`) that the controls keep in sync — mirroring upstream's optional `shallowRef` parameter. When omitted, the revealed state is internal:

```tsx
import { useConfirmDialog } from '@reaxuse/core'
import { useRef } from 'react'

const show = useRef(false)
const { isRevealed, reveal, confirm, cancel } = useConfirmDialog(show)
```

## Divergences from upstream

- **`isRevealed` is state, not a computed ref.** Upstream returns
  `computed(() => revealed.value)`, which reads the ref live, so writing to the
  external ref out of band (for example closing the modal outside the controls)
  is visible immediately. The React port keeps `isRevealed` in `useState` and
  re-syncs it from the external ref during render, so an out-of-band write is
  mirrored on the **next render only** — a write with no subsequent re-render
  cannot be observed. Prefer driving the dialog through `reveal()` /
  `confirm()` / `cancel()`, which update state and ref together.
- **Listener return values are collected with `Promise.all`.** Upstream's
  `createEventHook().trigger()` is
  `Promise.all(Array.from(fns).map(fn => fn(...args)))` and the returned
  promise is discarded, so a rejected async listener becomes an unhandled
  rejection. The port collects return values the same way: rejections from
  async listeners surface as unhandled rejections, while a synchronous throw
  inside a listener propagates out of the calling `reveal()` / `confirm()` /
  `cancel()` (identical to upstream).
- **Subscriptions are cleared on unmount.** Upstream relies on
  `tryOnScopeDispose` inside `createEventHook`'s `on`; React has no effect
  scope, so the port clears its listener sets in an unmount effect. Use the
  `off` handle or `useListener` for finer-grained cleanup.
