import { useFileDialog, useListener } from '@reaxuse/core'
import { useState } from 'react'

export default function UseFileDialogDemo() {
  const { files, open, reset, onChange, onCancel } = useFileDialog()
  const [message, setMessage] = useState<string | null>(null)

  useListener(onChange, (selected) => {
    setMessage(selected ? `You have selected ${selected.length} ${selected.length === 1 ? 'file' : 'files'}` : null)
  })

  useListener(onCancel, () => {
    setMessage('Selection cancelled')
  })

  return (
    <div>
      <button type="button" onClick={() => open()}>
        Choose files
      </button>
      <button type="button" disabled={!files} onClick={() => reset()}>
        Reset
      </button>
      {files
        ? (
            <ul>
              {Array.from(files).map(file => <li key={file.name}>{file.name}</li>)}
            </ul>
          )
        : null}
      {message ? <p>{message}</p> : null}
    </div>
  )
}
