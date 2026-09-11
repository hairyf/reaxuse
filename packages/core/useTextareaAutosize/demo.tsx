import { useTextareaAutosize } from '@reause/core'

export default function UseTextareaAutosizeDemo() {
  const { input, setInput, textarea } = useTextareaAutosize()

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
