import { usePointerSwipe } from '@reaxuse/core'
import { useRef, useState } from 'react'

export default function UsePointerSwipeDemo() {
  const target = useRef<HTMLDivElement>(null)
  const container = useRef<HTMLDivElement>(null)
  const [left, setLeft] = useState('0')
  const [opacity, setOpacity] = useState(1)
  // latest distanceX reachable inside the callbacks — a closure over the state
  // value would be stale in React
  const distanceXRef = useRef(0)

  const { isSwiping, distanceX } = usePointerSwipe(target, {
    disableTextSelect: true,
    onSwipe() {
      const containerWidth = container.current?.offsetWidth
      if (containerWidth) {
        if (distanceXRef.current < 0) {
          const distance = Math.abs(distanceXRef.current)
          setLeft(`${distance}px`)
          setOpacity(1.25 - distance / containerWidth)
        }
        else {
          setLeft('0')
          setOpacity(1)
        }
      }
    },
    onSwipeEnd() {
      const containerWidth = container.current?.offsetWidth
      if (containerWidth && distanceXRef.current < 0 && (Math.abs(distanceXRef.current) / containerWidth) >= 0.5) {
        setLeft('100%')
        setOpacity(0)
      }
      else {
        setLeft('0')
        setOpacity(1)
      }
    },
  })

  distanceXRef.current = distanceX

  function reset() {
    setLeft('0')
    setOpacity(1)
  }

  return (
    <div>
      <div className="us-pointer-swipe-container">
        <button onClick={reset}>
          Reset
        </button>
        <div
          ref={target}
          className={isSwiping ? 'us-pointer-swipe-overlay' : 'us-pointer-swipe-overlay us-pointer-swipe-animated'}
          style={{ left, opacity }}
        >
          <p>Swipe</p>
        </div>
      </div>
      <style>
        {`
        .us-pointer-swipe-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #ccc;
          overflow: hidden;
          user-select: none;
          height: 80px;
        }
        .us-pointer-swipe-overlay {
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          position: absolute;
          background: #3eaf7c;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .us-pointer-swipe-overlay.us-pointer-swipe-animated {
          transition: all 0.2s ease-in-out;
        }
        .us-pointer-swipe-overlay > p {
          color: #fff;
          font-weight: bold;
          text-align: center;
          overflow: hidden;
          white-space: nowrap;
        }
      `}
      </style>
    </div>
  )
}
