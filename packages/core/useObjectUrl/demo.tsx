import type { ChangeEvent } from 'react'
import { useObjectUrl } from '@reaxuse/core'
import { useState } from 'react'

export default function UseObjectUrlDemo() {
  const [file, setFile] = useState<File>()
  const url = useObjectUrl(file)

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    setFile(files && files.length > 0 ? files[0] : undefined)
  }

  return (
    <div>
      <p className="mb-1">
        Select file:
      </p>
      <input type="file" onChange={onFileChange} />

      <p className="mt-4 mb-1">
        Object URL:
      </p>
      <code>
        {url
          ? <a href={url} target="_blank" rel="noreferrer">{url}</a>
          : <span>none</span>}
      </code>
    </div>
  )
}
