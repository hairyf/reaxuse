---
category: Utilities
---

# useConfirmDialog

Creates event hooks to support modals and confirmation dialog chains — React port of VueUse's [`useConfirmDialog`](https://vueuse.org/core/useConfirmDialog/).

Functions can be used on the template, and hooks are a handy skeleton for the business logic of modals dialog or other actions that require user confirmation.

## Functions and hooks

- `reveal()` - triggers `onReveal` hook and sets `isRevealed` to `true`. Returns promise that resolves by `confirm()` or `cancel()`.
- `confirm()` - sets `isRevealed` to `false` and triggers `onConfirm` hook.
- `cancel()` - sets `isRevealed` to `false` and triggers `onCancel` hook.

## Usage

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

<DemoContainer name="UseConfirmDialog" />

## Type Declarations

```ts
export type UseConfirmDialogRevealResult<C, D>
  = {
    data?: C
    isCanceled: false
  } | {
    data?: D
    isCanceled: true
  }

export interface UseConfirmDialogReturn<RevealData, ConfirmData, CancelData> {
  isRevealed: boolean
  reveal: (data?: RevealData) => Promise<UseConfirmDialogRevealResult<ConfirmData, CancelData>>
  confirm: (data?: ConfirmData) => void
  cancel: (data?: CancelData) => void
  onReveal: (fn: (data: RevealData) => void) => { off: () => void }
  onConfirm: (fn: (data: ConfirmData) => void) => { off: () => void }
  onCancel: (fn: (data: CancelData) => void) => { off: () => void }
}

export function useConfirmDialog<
  RevealData = any,
  ConfirmData = any,
  CancelData = any,
>(revealed?: { current: boolean }): UseConfirmDialogReturn<RevealData, ConfirmData, CancelData>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useConfirmDialog/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useConfirmDialog/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useConfirmDialog/index.browser.test.ts) (mirrored in `packages/core/src/useConfirmDialog.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useConfirmDialog/demo.vue) (ported to `demo.tsx` below).
- reaxuse: [`packages/core/src/useConfirmDialog.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useConfirmDialog.ts), docs + demo co-located in `packages/core/useConfirmDialog/`

<Contributors name="useConfirmDialog" />
