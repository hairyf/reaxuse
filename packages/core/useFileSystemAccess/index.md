---
category: Browser
---

# useFileSystemAccess

Create and read and write local files with [FileSystemAccessAPI](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)

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
