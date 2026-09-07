---
category: Elements
---

# useDropZone

Create a zone where files can be dropped — React port of VueUse's [`useDropZone`](https://vueuse.org/core/useDropZone/).

The hook attaches `dragenter` / `dragover` / `dragleave` / `drop` listeners to a target element (a plain element, a ref-like `{ current }` or a getter) in a mount effect and tracks whether a valid drag is currently over the zone. Dropped files flow through the `onDrop` callback — either the `onDrop` option or the returned `onDrop` subscription.

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

<DemoContainer name="UseDropZone" />

## Type Declarations

```ts
export type UseDropZoneCallback = (files: File[] | null, event: DragEvent) => void

export interface UseDropZoneOptions {
  dataTypes?: MaybeRef<readonly string[]> | ((types: readonly string[]) => boolean)
  checkValidity?: (items: DataTransferItemList) => boolean
  onDrop?: UseDropZoneCallback
  onEnter?: UseDropZoneCallback
  onLeave?: UseDropZoneCallback
  onOver?: UseDropZoneCallback
  multiple?: MaybeRefOrGetter<boolean>
  preventDefaultForUnhandled?: MaybeRefOrGetter<boolean>
}

export interface UseDropZoneReturn {
  isOverDropZone: boolean
  onDrop: (fn: UseDropZoneCallback) => { off: () => void }
  onDragEnter: (fn: UseDropZoneCallback) => { off: () => void }
  onDragLeave: (fn: UseDropZoneCallback) => { off: () => void }
}

export function useDropZone(
  target: MaybeRefOrGetter<HTMLElement | Document | null | undefined>,
  options?: UseDropZoneOptions | UseDropZoneOptions['onDrop'],
): UseDropZoneReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useDropZone/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDropZone/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDropZone/demo.vue) (ported to `demo.tsx` below).
  Upstream has no tests, so `packages/core/src/useDropZone.test.tsx` covers the initial state, drag-enter/leave transitions, drop callbacks, `useListener` subscriptions and SSR safety.
- reaxuse: [`packages/core/src/useDropZone.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useDropZone.ts), docs + demo co-located in `packages/core/useDropZone/`

<Contributors name="useDropZone" />
