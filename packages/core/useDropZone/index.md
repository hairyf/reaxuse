---
category: Elements
---

# useDropZone

Create a zone where files can be dropped

::: warning

Due to Safari browser limitations, file type validation is only possible during the drop event, not during drag events. As a result, the `isOverDropZone` value will always be `true` during drag operations in Safari, regardless of file type.

:::

## Usage

```tsx
import { useDropZone } from '@reaxuse/core'
import { useRef } from 'react'

function Component() {
  const dropZoneRef = useRef<HTMLDivElement>(null)

  function onDrop(files: File[] | null) {
    // called when files are dropped on zone
  }

  const { isOverDropZone } = useDropZone(dropZoneRef, {
    onDrop,
    // specify the types of data to be received.
    dataTypes: ['image/jpeg'],
    // control multi-file drop
    multiple: true,
    // whether to prevent default behavior for unhandled events
    preventDefaultForUnhandled: false,
  })

  return (
    <div ref={dropZoneRef}>
      Drop files here
    </div>
  )
}
```

The returned `onDrop` / `onDragEnter` / `onDragLeave` are stable registration functions following the `useListener` protocol — each accepts a callback and returns an `off` handle:

```tsx
import { useDropZone } from '@reaxuse/core'
import { useListener } from '@reaxuse/shared'
import { useRef } from 'react'

const dropZoneRef = useRef<HTMLDivElement>(null)
const { isOverDropZone, onDrop, onDragEnter, onDragLeave } = useDropZone(dropZoneRef)

useListener(onDrop, (files) => {
  console.log('dropped:', files)
})

useListener(onDragEnter, () => {
  console.log('drag entered')
})

useListener(onDragLeave, () => {
  console.log('drag left')
})
```
