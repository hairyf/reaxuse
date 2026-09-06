import type { UseMouseEventExtractor } from '@reaxuse/core'
import type { CSSProperties } from 'react'
import { useMouse } from '@reaxuse/core'
import { useRef } from 'react'

const panelStyle: CSSProperties = {
  minHeight: 96,
  margin: '8px 0',
  padding: '8px 12px',
  borderRadius: 4,
  background: 'rgba(107, 114, 128, 0.1)',
}

export default function UseMouseDemo() {
  const parentRef = useRef<HTMLDivElement>(null)

  const mouseDefault = useMouse()

  const extractor: UseMouseEventExtractor = event => (
    event instanceof MouseEvent
      ? [event.offsetX, event.offsetY]
      : null
  )
  const mouseWithExtractor = useMouse({ target: parentRef, type: extractor })

  return (
    <div>
      <p>Basic Usage</p>
      <pre style={panelStyle}>
        {JSON.stringify(mouseDefault, null, 2)}
      </pre>
      <p>Extractor Usage</p>
      <div ref={parentRef} style={panelStyle}>
        <pre>
          {JSON.stringify(mouseWithExtractor, null, 2)}
        </pre>
      </div>
    </div>
  )
}
