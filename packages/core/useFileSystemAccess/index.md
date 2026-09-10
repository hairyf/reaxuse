---
category: Browser
---

# useFileSystemAccess

Create and read and write local files with [FileSystemAccessAPI](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)

## Usage

```tsx
import { useFileSystemAccess } from '@reaxuse/core'

const [data, setData, {
  isSupported,
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
}] = useFileSystemAccess()

function handleOpen() {
  await open() // native "open file" picker → reads the file into `data`
}

function handleSave() {
  await save() // writes `data` to the current handle
}
```

## Return Values

- `data` — the current file content, re-read as `Text`, `ArrayBuffer` or `Blob` per the `dataType` option (`undefined` before a file is picked or created).
- `setData(next | prev => next)` — replaces `data` with the React immutable-update protocol; it does not touch the picked file handle.
- `controls.isSupported` — whether the FileSystemAccess pickers are available (`false` during render and on the server, resolved in a mount effect).
- `controls.file` / `controls.fileName` / `controls.fileMIME` / `controls.fileSize` / `controls.fileLastModified` — the picked `File` snapshot and its metadata.
- `controls.open()` / `controls.create()` / `controls.save()` / `controls.saveAs()` / `controls.updateData()` — the picker and read/write controls.

The return is a React tuple `[data, setData, controls]` — upstream returns an object with a writable `data` shallow ref
(`ShallowRef<T | undefined>`) and no setter, so `setData` is a reaxuse addition and the controls are plain values and
functions (no `.value`).
