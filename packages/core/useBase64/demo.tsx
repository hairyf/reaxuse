import type { ChangeEvent } from 'react'
import { useBase64 } from '@reaxuse/core'
import { useState } from 'react'

const BUFFER = new ArrayBuffer(8)

export default function UseBase64Demo() {
  const [text, setText] = useState('')
  const [file, setFile] = useState<File>()
  const [image, setImage] = useState<HTMLImageElement>()

  const { base64: textBase64 } = useBase64(text)
  const { base64: fileBase64 } = useBase64(file)
  const { base64: bufferBase64 } = useBase64(BUFFER)
  const { base64: imageBase64 } = useBase64(image)

  function onFileInput(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    setFile(files && files.length > 0 ? files[0] : undefined)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-2">
        <div>
          <span>Text Input</span>
          <textarea
            className="h-40 w-full"
            value={text}
            placeholder="Type something..."
            onChange={event => setText(event.target.value)}
          />
        </div>
        <div>
          <span>Base64</span>
          <textarea className="h-40 w-full" value={textBase64} readOnly />
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div>
          <span>Buffer Input</span>
          <pre className="mt-2">new ArrayBuffer(8)</pre>
        </div>
        <div>
          <span>Base64</span>
          <textarea className="h-40 w-full" value={bufferBase64} readOnly />
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div>
          <span>File Input</span>
          <div>
            <input className="mt-2" type="file" onChange={onFileInput} />
          </div>
        </div>
        <div>
          <span>Base64</span>
          <textarea className="h-40 w-full" value={fileBase64} readOnly />
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div>
          <span>Image Input</span>
          <img
            className="mt-2 h-40 w-full rounded object-cover"
            src="https://images.unsplash.com/photo-1494256997604-768d1f608cac?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
            alt="unsplash"
            ref={el => setImage(el ?? undefined)}
          >
          </img>
        </div>
        <div>
          <span>Base64</span>
          <textarea className="h-40 w-full" value={imageBase64} readOnly />
        </div>
      </div>
    </div>
  )
}
