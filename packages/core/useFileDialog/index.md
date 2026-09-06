---
category: Browser
---

# useFileDialog

Open file dialog with ease — React port of VueUse's [`useFileDialog`](https://vueuse.org/core/useFileDialog/).

The hook drives a hidden `<input type="file">` (created on mount unless a custom `input` element is provided) and exposes `open` / `reset` / `files` plus the `onChange` / `onCancel` event hooks.

## Usage

```tsx
import { useFileDialog } from '@reaxuse/core'
import { useListener } from '@reaxuse/shared'

const {
  files,
  open,
  reset,
  onChange,
  onCancel,
} = useFileDialog({
  accept: 'image/*', // Set to accept only image files
  directory: true, // Select directories instead of files if set true
})

useListener(onChange, (files) => {
  /** do something with files */
})

useListener(onCancel, () => {
  /** do something on cancel */
})
```

The returned `onChange` / `onCancel` are stable registration functions following the `useListener` protocol — each accepts a callback and returns an `off` handle, so listeners never leak and never fire after the component unmounts:

```tsx
const { onChange } = useFileDialog()

const { off } = onChange(files => console.log(files))
// later: off() unsubscribes
```

With buttons:

```tsx
import { useFileDialog } from '@reaxuse/core'

function Component() {
  const { files, open, reset } = useFileDialog()

  return (
    <div>
      <button type="button" onClick={() => open()}>
        Choose files
      </button>
      <button type="button" disabled={!files} onClick={() => reset()}>
        Reset
      </button>
    </div>
  )
}
```

<DemoContainer name="UseFileDialog" />

## Type Declarations

```ts
export interface UseFileDialogOptions {
  document?: Document | null
  multiple?: MaybeRefOrGetter<boolean>
  accept?: MaybeRefOrGetter<string>
  capture?: MaybeRefOrGetter<string>
  reset?: MaybeRefOrGetter<boolean>
  directory?: MaybeRefOrGetter<boolean>
  initialFiles?: Array<File> | FileList
  input?: MaybeRefOrGetter<HTMLInputElement | null>
}

export interface UseFileDialogReturn {
  files: FileList | null
  open: (localOptions?: Partial<UseFileDialogOptions>) => void
  reset: () => void
  onChange: (fn: (files: FileList | null) => void) => { off: () => void }
  onCancel: (fn: () => void) => { off: () => void }
}

export function useFileDialog(options?: UseFileDialogOptions): UseFileDialogReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useFileDialog/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFileDialog/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFileDialog/index.browser.test.ts) (mirrored in `packages/core/src/useFileDialog.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFileDialog/demo.vue) (ported to `demo.tsx` below).
- reaxuse: [`packages/core/src/useFileDialog.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useFileDialog.ts), docs + demo co-located in `packages/core/useFileDialog/`

<Contributors name="useFileDialog" />
