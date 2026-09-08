---
category: Browser
---

# useFileSystemAccess

Create and read and write local files with [FileSystemAccessAPI](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) — React port of VueUse's [`useFileSystemAccess`](https://vueuse.org/core/useFileSystemAccess/).

The hook wraps the Chromium-only `window.showOpenFilePicker` / `window.showSaveFilePicker` and keeps the picked file's content (`data`) plus its `File` snapshot (`file`, `fileName`, `fileMIME`, `fileSize`, `fileLastModified`) fresh. It is SSR-safe: `isSupported` starts `false` and is resolved in a mount effect, and the native picker functions are only invoked from your event handlers.

**Mapping:** upstream returns an object of shallow/computed refs plus the control functions → a plain object of state + derived values. `dataType` (`'Text'` | `'ArrayBuffer'` | `'Blob'`, default `'Text'`) controls how the file is read; switching it re-reads the current file. `save()` writes the current `data` back to the picked handle (falling back to `saveAs` when no handle is picked yet); `create()` picks a brand-new empty file.

## Usage

```tsx
import { useFileSystemAccess } from '@reaxuse/core'

const {
  isSupported,
  data,
  file,
  fileName,
  fileMIME,
  fileSize,
  fileLastModified,
  open,
  create,
  save,
  saveAs,
  updateData,
} = useFileSystemAccess()

function handleOpen() {
  await open() // native "open file" picker → reads the file into `data`
}

function handleSave() {
  await save() // writes `data` to the current handle
}
```

Pass options to restrict the picker and choose the data type:

```tsx
const { open, save, data } = useFileSystemAccess({
  dataType: 'Text',
  types: [{
    description: 'text',
    accept: {
      'text/plain': ['.txt', '.html'],
    },
  }],
  excludeAcceptAllOption: true,
})
```

<DemoContainer name="UseFileSystemAccess" />

## Type Declarations

```ts
export interface FileSystemAccessShowOpenFileOptions {
  multiple?: boolean
  types?: Array<{
    description?: string
    accept: Record<string, string[]>
  }>
  excludeAcceptAllOption?: boolean
}

export interface FileSystemAccessShowSaveFileOptions {
  suggestedName?: string
  types?: Array<{
    description?: string
    accept: Record<string, string[]>
  }>
  excludeAcceptAllOption?: boolean
}

export interface FileSystemFileHandle {
  getFile: () => Promise<File>
  createWritable: () => FileSystemWritableFileStream
}

export type UseFileSystemAccessCommonOptions = Pick<FileSystemAccessShowOpenFileOptions, 'types' | 'excludeAcceptAllOption'>
export type UseFileSystemAccessShowSaveFileOptions = Pick<FileSystemAccessShowSaveFileOptions, 'suggestedName'>

export interface UseFileSystemAccessOptions extends ConfigurableWindow {
  types?: UseFileSystemAccessCommonOptions['types']
  excludeAcceptAllOption?: boolean
  dataType?: MaybeRefOrGetter<'Text' | 'ArrayBuffer' | 'Blob'>
}

export interface UseFileSystemAccessReturn<T = string> {
  isSupported: boolean
  data: T | undefined
  file: File | undefined
  fileName: string
  fileMIME: string
  fileSize: number
  fileLastModified: number
  open: (_options?: UseFileSystemAccessCommonOptions) => Promise<void>
  create: (_options?: UseFileSystemAccessShowSaveFileOptions) => Promise<void>
  save: (_options?: UseFileSystemAccessShowSaveFileOptions) => Promise<void>
  saveAs: (_options?: UseFileSystemAccessShowSaveFileOptions) => Promise<void>
  updateData: () => Promise<void>
}

export function useFileSystemAccess(): UseFileSystemAccessReturn<string | ArrayBuffer | Blob>
export function useFileSystemAccess(options: UseFileSystemAccessOptions & { dataType: 'Text' }): UseFileSystemAccessReturn<string>
export function useFileSystemAccess(options: UseFileSystemAccessOptions & { dataType: 'ArrayBuffer' }): UseFileSystemAccessReturn<ArrayBuffer>
export function useFileSystemAccess(options: UseFileSystemAccessOptions & { dataType: 'Blob' }): UseFileSystemAccessReturn<Blob>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useFileSystemAccess/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFileSystemAccess/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFileSystemAccess/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useFileSystemAccess.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useFileSystemAccess.ts), docs + demo co-located in `packages/core/useFileSystemAccess/`

<Contributors name="useFileSystemAccess" />
