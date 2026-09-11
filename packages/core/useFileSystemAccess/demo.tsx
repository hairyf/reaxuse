import { useFileSystemAccess } from '@reause/core'
import { useState } from 'react'

type DataType = 'Text' | 'ArrayBuffer' | 'Blob'

export default function UseFileSystemAccessDemo() {
  const [dataType, setDataType] = useState<DataType>('Text')
  const [data, setData, {
    isSupported,
    fileName,
    fileMIME,
    fileSize,
    fileLastModified,
    open,
    create,
    save,
    saveAs,
    updateData,
  }] = useFileSystemAccess({
    dataType,
    types: [{
      description: 'text',
      accept: {
        'text/plain': ['.txt', '.html'],
      },
    }],
    excludeAcceptAllOption: true,
  })

  const content = typeof data === 'string' ? data : data ? `${data}` : ''

  return (
    <div>
      <div className="flex gap-2 items-center">
        <button type="button" onClick={() => open()}>
          Open
        </button>
        <button type="button" onClick={() => updateData()}>
          Update
        </button>
        <button type="button" onClick={() => create()}>
          New file
        </button>
        <button type="button" disabled={!fileName} onClick={() => save()}>
          Save
        </button>
        <button type="button" disabled={!fileName} onClick={() => saveAs()}>
          Save as
        </button>

        <label className="ml-5">
          DataType
          {' '}
          <select value={dataType} onChange={event => setDataType(event.target.value as DataType)}>
            <option value="Text">Text</option>
            <option value="ArrayBuffer">ArrayBuffer</option>
            <option value="Blob">Blob</option>
          </select>
        </label>
      </div>

      {!isSupported
        ? <p>Not supported by your browser</p>
        : null}

      <pre className="code-block">
        {JSON.stringify({
          isSupported,
          fileName,
          fileMIME,
          fileSize,
          fileLastModified,
        }, null, 2)}
      </pre>

      <div>
        Content
        <textarea
          value={content}
          // edits go through `setData` (React immutable update); `save()`
          // persists them to the picked handle
          onChange={(event) => {
            if (typeof data === 'string')
              setData(event.target.value)
          }}
          rows={20}
          cols={40}
        />
      </div>
    </div>
  )
}
