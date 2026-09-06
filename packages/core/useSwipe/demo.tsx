import { useSwipe } from '@reaxuse/core'
import { useRef, useState } from 'react'

export default function UseSwipeDemo() {
  const target = useRef<HTMLDivElement>(null)
  const container = useRef<HTMLDivElement>(null)
  const [left, setLeft] = useState('0')
  const [opacity, setOpacity] = useState(1)
  // latest lengthX reachable inside the callbacks below — a closure over the
  // state value would be stale in React
  const lengthXRef = useRef(0)

  const { direction, isSwiping, lengthX, lengthY } = useSwipe(target, {
    passive: false,
    onSwipe() {
      const containerWidth = container.current?.offsetWidth
      if (containerWidth) {
        if (lengthXRef.current < 0) {
          const length = Math.abs(lengthXRef.current)
          setLeft(`${length}px`)
          setOpacity(1.1 - length / containerWidth)
        }
        else {
          setLeft('0')
          setOpacity(1)
        }
      }
    },
    onSwipeEnd() {
      const containerWidth = container.current?.offsetWidth
      if (containerWidth && lengthXRef.current < 0 && (Math.abs(lengthXRef.current) / containerWidth) >= 0.5) {
        setLeft('100%')
        setOpacity(0)
      }
      else {
        setLeft('0')
        setOpacity(1)
      }
    },
  })

  lengthXRef.current = lengthX

  function reset() {
    setLeft('0')
    setOpacity(1)
  }

  return (
    <div>
      <div className="usw-container">
        <button onClick={reset}>
          Reset
        </button>
        <div
          ref={target}
          className={isSwiping ? 'usw-overlay' : 'usw-overlay usw-animated'}
          style={{ left, opacity }}
        >
          <p>Swipe right</p>
        </div>
      </div>
      <p className="usw-status">
        Direction:
        {' '}
        {direction}
        <br />
        {`lengthX: ${lengthX} | lengthY: ${lengthY}`}
      </p>
      <style>
        {`
        .usw-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #ccc;
          overflow: hidden;
          user-select: none;
        }
        .usw-overlay {
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          position: absolute;
          background: #3fb983;
        }
        .usw-overlay.usw-animated {
          transition: all 0.2s ease-in-out;
        }
        .usw-overlay > p {
          color: #fff;
          font-weight: bold;
          text-align: center;
          overflow: hidden;
          white-space: nowrap;
        }
        .usw-status {
          text-align: center;
        }
      `}
      </style>
    </div>
  )
}
