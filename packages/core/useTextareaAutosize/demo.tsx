import { useTextareaAutosize } from '@reaxuse/core'
import { useRef, useState } from 'react'

export default function UseTextareaAutosizeDemo() {
  const textarea = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState('')
  useTextareaAutosize({ element: textarea, input })

  return (
    <div>
      <span>Type, the textarea will grow:</span>
      <textarea
        ref={textarea}
        value={input}
        onChange={event => setInput(event.target.value)}
        placeholder="What's on your mind?"
        style={{
          resize: 'none',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      />
    </div>
  )
}
