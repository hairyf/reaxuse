import { useMouseInElement } from '@reaxuse/core'
import { useRef } from 'react'

export default function UseMouseInElementDemo() {
  const target = useRef<HTMLDivElement>(null)
  const inlineTarget = useRef<HTMLSpanElement>(null)

  const mouse = useMouseInElement(target)
  const inlineMouse = useMouseInElement(inlineTarget)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div
          ref={target}
          style={{
            width: '120px',
            height: '80px',
            border: '2px dashed #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
          }}
        >
          Hover me
        </div>
        <pre>
          {JSON.stringify(mouse, null, 2)}
        </pre>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ border: '2px dashed #ccc', padding: '8px' }}>
          <span
            ref={inlineTarget}
            style={{
              lineHeight: '2',
              background: 'rgba(63, 185, 131, 0.3)',
              userSelect: 'none',
            }}
          >
            Hover me, I&apos;m an inline element
          </span>
        </div>
        <pre>
          {JSON.stringify(inlineMouse, null, 2)}
        </pre>
      </div>
    </div>
  )
}
