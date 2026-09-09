---
category: Browser
---

# useFileDialog

Open file dialog with ease

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
