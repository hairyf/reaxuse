---
category: State
---

# useListener

Bind a callback to a listener registration function returned by a reaxuse hook, with automatic cleanup on unmount.

## Usage

```tsx
import { useFileDialog } from '@reaxuse/core'
import { useListener } from '@reaxuse/shared'

const { files, open, onChange, onCancel } = useFileDialog({ accept: 'image/*' })

useListener(onChange, (files) => {
  console.log('selected:', files)
})

useListener(onCancel, () => {
  console.log('cancelled')
})
```

The callback is registered on mount and automatically unregistered on unmount, so listeners never leak and callbacks never fire after the component is gone.
