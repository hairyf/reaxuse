import type { CSSProperties } from 'react'
import { useScroll } from '@reaxuse/core'
import { useEffect, useRef, useState } from 'react'

function BooleanDisplay({ value }: { value: boolean }) {
  return (
    <strong>
      {value ? 'true' : 'false'}
    </strong>
  )
}

const containerStyle: CSSProperties = {
  width: 300,
  height: 300,
  margin: 'auto',
  overflow: 'scroll',
  background: 'rgba(107, 114, 128, 0.1)',
  borderRadius: 4,
}

const innerStyle: CSSProperties = {
  width: 500,
  position: 'relative',
}

const cornerStyle: CSSProperties = {
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

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const corners: Array<{ label: string, style: CSSProperties }> = [
  { label: 'TopLeft', style: { left: 0, top: 0 } },
  { label: 'BottomLeft', style: { left: 0, bottom: 0 } },
  { label: 'TopRight', style: { right: 0, top: 0 } },
  { label: 'BottomRight', style: { right: 0, bottom: 0 } },
  { label: 'Scroll Me', style: { left: '33.33%', top: '33.33%' } },
]

export default function UseScrollDemo() {
  const el = useRef<HTMLDivElement>(null)
  const [smooth, setSmooth] = useState(false)
  const [displayX, setDisplayX] = useState('0')
  const [displayY, setDisplayY] = useState('0')
  const [height, setHeight] = useState(500)
  const behavior = smooth ? 'smooth' : 'auto'

  const { x, y, isScrolling, arrivedState, directions, measure, setX, setY } = useScroll(el, { behavior })
  const { left, right, top, bottom } = arrivedState
  const { left: toLeft, right: toRight, top: toTop, bottom: toBottom } = directions

  // keep the number inputs in sync with the scroll position
  useEffect(() => {
    setDisplayX(x.toFixed(1))
  }, [x])
  useEffect(() => {
    setDisplayY(y.toFixed(1))
  }, [y])

  function updateScrollPosition() {
    setHeight(h => (h === 500 ? 200 : 500))
    // wait for React to commit the new height before re-measuring
    requestAnimationFrame(() => measure())
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      <div ref={el} style={containerStyle}>
        <div style={{ ...innerStyle, height }}>
          {corners.map(({ label, style }) => (
            <div key={label} style={{ ...cornerStyle, ...style }}>
              {label}
            </div>
          ))}
        </div>
      </div>
      <div style={panelStyle}>
        <div style={rowStyle}>
          <span>X Position</span>
          <input
            type="number"
            min={0}
            max={200}
            step={10}
            value={displayX}
            onChange={e => setX(Number.parseFloat(e.target.value))}
            style={{ width: '100%', marginLeft: 8 }}
          />
        </div>
        <div style={rowStyle}>
          <span>Y Position</span>
          <input
            type="number"
            min={0}
            max={100}
            step={10}
            value={displayY}
            onChange={e => setY(Number.parseFloat(e.target.value))}
            style={{ width: '100%', marginLeft: 8 }}
          />
        </div>
        <div style={rowStyle}>
          <span>Measure</span>
          <button onClick={updateScrollPosition}>
            Toggle height
          </button>
        </div>
        <label style={rowStyle}>
          <span>Smooth scrolling</span>
          <input type="checkbox" checked={smooth} onChange={e => setSmooth(e.target.checked)} />
        </label>
        <div style={rowStyle}>
          <span>isScrolling</span>
          <BooleanDisplay value={isScrolling} />
        </div>
        <div style={rowStyle}>
          <span>Top Arrived</span>
          <BooleanDisplay value={top} />
        </div>
        <div style={rowStyle}>
          <span>Right Arrived</span>
          <BooleanDisplay value={right} />
        </div>
        <div style={rowStyle}>
          <span>Bottom Arrived</span>
          <BooleanDisplay value={bottom} />
        </div>
        <div style={rowStyle}>
          <span>Left Arrived</span>
          <BooleanDisplay value={left} />
        </div>
        <div style={rowStyle}>
          <span>Scrolling Up</span>
          <BooleanDisplay value={toTop} />
        </div>
        <div style={rowStyle}>
          <span>Scrolling Right</span>
          <BooleanDisplay value={toRight} />
        </div>
        <div style={rowStyle}>
          <span>Scrolling Down</span>
          <BooleanDisplay value={toBottom} />
        </div>
        <div style={rowStyle}>
          <span>Scrolling Left</span>
          <BooleanDisplay value={toLeft} />
        </div>
      </div>
    </div>
  )
}
