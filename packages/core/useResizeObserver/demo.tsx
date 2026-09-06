import { useResizeObserver } from '@reaxuse/core'
import { useRef, useState } from 'react'

export default function UseResizeObserverDemo() {
  const el = useRef<HTMLTextAreaElement | null>(null)
  const [text, setText] = useState('')

  useResizeObserver(el, (entries) => {
    const [entry] = entries
    const { width, height } = entry.contentRect
    setText(`width: ${width}\nheight: ${height}`)
  })

  return (
    <div>
      <p style={{ margin: '0 0 8px' }}>
        Resize the box to see changes
      </p>
      <textarea
        ref={el}
        value={text}
        readOnly
        style={{
          width: 260,
          height: 90,
          minWidth: 80,
          minHeight: 40,
          resize: 'both',
          overflow: 'hidden',
        }}
      />
    </div>
  )
}
