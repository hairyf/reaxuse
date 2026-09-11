import type { CSSProperties } from 'react'
import { useDraggable } from '@reause/core'
import { useRef, useState } from 'react'

/**
 * Convert the hook's `style` CSS string (`left: ?px; top: ?px;`) into a React
 * style object so it can be applied via the `style` prop.
 */
function styleStringToObject(style: string): CSSProperties {
  const result: Record<string, string> = {}
  for (const declaration of style.split(';')) {
    const colonIndex = declaration.indexOf(':')
    if (colonIndex === -1)
      continue
    const key = declaration.slice(0, colonIndex).trim()
    const value = declaration.slice(colonIndex + 1).trim()
    if (key && value)
      result[key.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())] = value
  }
  return result
}

const boxStyle: CSSProperties = {
  position: 'fixed',
  padding: '8px 16px',
  border: '1px solid rgba(128, 128, 128, 0.3)',
  borderRadius: 4,
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  background: 'var(--vp-c-bg)',
  userSelect: 'none',
  cursor: 'move',
  touchAction: 'none',
  zIndex: 31,
}

export default function UseDraggableDemo() {
  const el = useRef<HTMLDivElement>(null)
  const el2 = useRef<HTMLDivElement>(null)
  const handle = useRef<HTMLDivElement>(null)
  const el3 = useRef<HTMLDivElement>(null)
  const [disabled, setDisabled] = useState(false)
  const [innerWidth] = useState(() => (typeof window === 'undefined' ? 200 : window.innerWidth))

  const { x, y, style } = useDraggable(el, {
    initialValue: { x: innerWidth / 4.2, y: 80 },
    preventDefault: true,
    disabled,
  })

  const handleBox = useDraggable(el2, {
    initialValue: { x: innerWidth / 3.6, y: 240 },
    preventDefault: true,
    handle,
    disabled,
  })

  const noCapture = useDraggable(el3, {
    initialValue: { x: innerWidth / 3.3, y: 330 },
    preventDefault: true,
    disabled,
    capture: false,
  })

  return (
    <div>
      <div>
        <label style={{ fontSize: 12, userSelect: 'none' }}>
          <input
            type="checkbox"
            name="enabled"
            checked={disabled}
            onChange={e => setDisabled(e.target.checked)}
          />
          <span>Disabled drag and drop</span>
        </label>
      </div>
      <p style={{ textAlign: 'center', opacity: 0.6, fontStyle: 'italic' }}>
        Check the floating boxes
      </p>

      <div ref={el} style={{ ...boxStyle, ...styleStringToObject(style) }}>
        <span aria-hidden="true">👋</span>
        {' '}
        Drag me!
        <div style={{ fontSize: 12, opacity: 0.6 }}>
          I am at
          {' '}
          {Math.round(x)}
          ,
          {' '}
          {Math.round(y)}
        </div>
      </div>

      <div ref={el2} style={{ ...boxStyle, ...styleStringToObject(handleBox.style) }}>
        <div ref={handle} style={{ cursor: 'move' }}>
          <span aria-hidden="true">👋</span>
          {' '}
          Drag here!
        </div>
        <div style={{ fontSize: 12, opacity: 0.6 }}>
          Handle that triggers the drag event
        </div>
        <div style={{ fontSize: 12, opacity: 0.6 }}>
          I am at
          {' '}
          {Math.round(handleBox.x)}
          ,
          {' '}
          {Math.round(handleBox.y)}
        </div>
      </div>

      <div ref={el3} style={{ ...boxStyle, ...styleStringToObject(noCapture.style) }}>
        Not Use Captured Element
        <div
          style={{ fontSize: 12, opacity: 0.6, cursor: 'default' }}
          onPointerDown={e => e.stopPropagation()}
        >
          Dragging here will not work
        </div>
        <div style={{ fontSize: 12, opacity: 0.6 }}>
          {Math.round(noCapture.x)}
          ,
          {' '}
          {Math.round(noCapture.y)}
        </div>
      </div>
    </div>
  )
}
