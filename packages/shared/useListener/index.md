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

## Types

```ts
export type ListenerOn<T extends (...args: any[]) => void> = (fn: T) => { off: () => void } | void

export function useListener<T extends (...args: any[]) => void>(
  on: ListenerOn<T>,
  cb: T,
): void
```

## Source

- reaxuse: `packages/shared/src/useListener.ts`
- Protocol: [issue #129 comment](https://github.com/hairyf/reaxuse/issues/129) — all return listener callbacks go through `useListener`
