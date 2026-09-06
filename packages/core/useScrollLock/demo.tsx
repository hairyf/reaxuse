import type { CSSProperties } from 'react'
import { useScrollLock } from '@reaxuse/core'
import { useRef } from 'react'

const boxStyle: CSSProperties = {
  width: 300,
  height: 300,
  margin: 'auto',
  overflow: 'scroll',
  background: 'rgba(107, 114, 128, 0.1)',
  borderRadius: 4,
}

const innerStyle: CSSProperties = {
  width: 500,
  height: 400,
  position: 'relative',
}

const labelStyle: CSSProperties = {
  position: 'absolute',
  background: 'rgba(107, 114, 128, 0.1)',
  padding: '4px 8px',
}

const panelStyle: CSSProperties = {
  margin: 'auto',
  padding: '16px 24px',
  borderRadius: 4,
  display: 'flex',
  flexDirection: 'column',
  width: 240,
  gap: 8,
  background: 'rgba(107, 114, 128, 0.1)',
}

const corners: Array<{ label: string, style: CSSProperties }> = [
  { label: 'TopLeft', style: { left: 0, top: 0 } },
  { label: 'BottomLeft', style: { left: 0, bottom: 0 } },
  { label: 'TopRight', style: { right: 0, top: 0 } },
  { label: 'BottomRight', style: { right: 0, bottom: 0 } },
  { label: 'Scroll Me', style: { left: '33.33%', top: '33.33%' } },
]

export default function UseScrollLockDemo() {
  const el = useRef<HTMLDivElement>(null)
  const [isLocked, setIsLocked] = useScrollLock(el)

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      <div ref={el} style={boxStyle}>
        <div style={innerStyle}>
          {corners.map(({ label, style }) => (
            <div key={label} style={{ ...labelStyle, ...style }}>
              {label}
            </div>
          ))}
        </div>
      </div>
      <div style={panelStyle}>
        <div>
          <span style={{ opacity: 0.75 }}>isLocked</span>
          {' '}
          <strong>{isLocked ? 'true' : 'false'}</strong>
        </div>
        <button style={{ opacity: 0.75 }} onClick={() => setIsLocked(!isLocked)}>
          {isLocked ? 'Unlock' : 'Lock'}
        </button>
      </div>
    </div>
  )
}
