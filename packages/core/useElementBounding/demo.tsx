import { useElementBounding } from '@reaxuse/core'
import { useRef } from 'react'

export default function UseElementBoundingDemo() {
  const el = useRef<HTMLTextAreaElement | null>(null)
  const { x, y, top, right, bottom, left, width, height } = useElementBounding(el)

  return (
    <div>
      <p style={{ margin: '0 0 8px' }}>
        Resize the box to see changes
      </p>
      <textarea
        ref={el}
        readOnly
        className="resizer"
        value={`x: ${x}\ny: ${y}\ntop: ${top}\nright: ${right}\nbottom: ${bottom}\nleft: ${left}\nwidth: ${width}\nheight: ${height}`}
        style={{
          width: 260,
          height: 120,
          minWidth: 80,
          minHeight: 40,
          resize: 'both',
          overflow: 'hidden',
        }}
      />
    </div>
  )
}
