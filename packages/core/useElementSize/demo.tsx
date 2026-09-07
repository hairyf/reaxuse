import { useElementSize } from '@reaxuse/core'
import { useRef } from 'react'

export default function UseElementSizeDemo() {
  const el = useRef<HTMLTextAreaElement | null>(null)
  const { width, height } = useElementSize(el, { width: 0, height: 0 }, { box: 'border-box' })

  return (
    <div>
      <p style={{ margin: '0 0 8px' }}>
        Resize the box to see changes
      </p>
      <textarea
        ref={el}
        readOnly
        value={`width: ${width}\nheight: ${height}`}
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
