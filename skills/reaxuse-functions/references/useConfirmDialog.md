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

## Type Declarations

```ts
export type UseConfirmDialogRevealResult<C, D> =
  | {
      data?: C
      isCanceled: false
    }
  | {
      data?: D
      isCanceled: true
    }
export interface UseConfirmDialogReturn<RevealData, ConfirmData, CancelData> {
  /**
   * Revealing state
   */
  isRevealed: boolean
  /**
   * Opens the dialog.
   * Create promise and return it. Triggers `onReveal` hook.
   */
  reveal: (
    data?: RevealData,
  ) => Promise<UseConfirmDialogRevealResult<ConfirmData, CancelData>>
  /**
   * Confirms and closes the dialog. Triggers a callback inside `onConfirm` hook.
   * Resolves promise from `reveal()` with `data` and `isCanceled` ref with `false` value.
   * Can accept any data and to pass it to `onConfirm` hook.
   */
  confirm: (data?: ConfirmData) => void
  /**
   * Cancels and closes the dialog. Triggers a callback inside `onCancel` hook.
   * Resolves promise from `reveal()` with `data` and `isCanceled` ref with `true` value.
   * Can accept any data and to pass it to `onCancel` hook.
   */
  cancel: (data?: CancelData) => void
  /**
   * Event Hook to be triggered right before dialog creating.
   */
  onReveal: (fn: (data: RevealData) => void) => {
    off: () => void
  }
  /**
   * Event Hook to be called on `confirm()`.
   * Gets data object from `confirm` function.
   */
  onConfirm: (fn: (data: ConfirmData) => void) => {
    off: () => void
  }
  /**
   * Event Hook to be called on `cancel()`.
   * Gets data object from `cancel` function.
   */
  onCancel: (fn: (data: CancelData) => void) => {
    off: () => void
  }
}
/**
 * React port of VueUse's `useConfirmDialog`.
 *
 * Map from @vueuse/core `useConfirmDialog`
 * (`source/vueuse/packages/core/useConfirmDialog/`). Creates event hooks to
 * support modals and confirmation dialog chains.
 *
 * The hook exposes `isRevealed` (boolean state), the `reveal` / `confirm` /
 * `cancel` controls and three listener registration functions (`onReveal` /
 * `onConfirm` / `onCancel`) following the `useListener` protocol.
 *
 * React divergences:
 * - upstream's `isRevealed` computed ref becomes plain boolean state; the
 *   optional external `shallowRef` parameter becomes a React ref object
 *   (`RefObject<boolean>`) that the controls keep in sync when provided.
 *   Upstream's computed reads `revealed.value` live, so an out-of-band write
 *   is visible immediately; React state re-syncs on the next render only
 *   (render-time comparison), so a write with no subsequent re-render cannot
 *   be observed;
 * - `reveal()` still returns a promise that resolves with `{ data,
 *   isCanceled }` when `confirm()` / `cancel()` is called;
 * - upstream's `createEventHook()` on* members become stable subscribe
 *   functions with the `(fn) => { off }` shape, managed with Sets, so they
 *   are identity-stable across renders and compatible with the `useListener`
 *   protocol;
 * - listener return values are collected with `Promise.all`, mirroring
 *   upstream `createEventHook().trigger()`: a rejected async listener surfaces
 *   as an unhandled rejection on the discarded aggregate promise, while a
 *   synchronous throw propagates to the `reveal()` / `confirm()` / `cancel()`
 *   caller in both implementations;
 * - the event subscriptions are cleared on unmount (upstream:
 *   `tryOnScopeDispose` inside `createEventHook`'s `on`).
 *
 * @example
 * const { isRevealed, reveal, confirm, cancel, onReveal, onConfirm, onCancel } = useConfirmDialog()
 *
 * useListener(onReveal, () => {
 *   // modal shown
 * })
 *
 * async function openDialog() {
 *   const { data, isCanceled } = await reveal()
 *   if (!isCanceled)
 *     console.log(data)
 * }
 */
export declare function useConfirmDialog<
  RevealData = any,
  ConfirmData = any,
  CancelData = any,
>(
  revealed?: RefObject<boolean>,
): UseConfirmDialogReturn<RevealData, ConfirmData, CancelData>
```
