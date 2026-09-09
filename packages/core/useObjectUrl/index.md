---
category: Browser
---

# useObjectUrl

Reactive URL representing an object.

## Usage

```tsx
import type { ChangeEvent } from 'react'
import { useObjectUrl } from '@reaxuse/core'
import { useState } from 'react'

const [file, setFile] = useState<File>()
const url = useObjectUrl(file)

function onFileChange(event: ChangeEvent<HTMLInputElement>) {
  const files = event.target.files
  setFile(files && files.length > 0 ? files[0] : undefined)
}
```

```tsx
return (
  <>
    <input type="file" onChange={onFileChange} />

    <a href={url}>Open file</a>
  </>
)
```

Reactive updates need no wrapper in React — pass state directly; whenever the object
changes, the previous URL is revoked and a new one is created:

```tsx
const [file, setFile] = useState<File>()
const url = useObjectUrl(file) // `undefined` until a file is set
```
