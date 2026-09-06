import { useIntersectionObserver } from '@reaxuse/core'
import { useRef, useState } from 'react'

export default function UseIntersectionObserverDemo() {
  const root = useRef<HTMLDivElement | null>(null)
  const target = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [top, setTop] = useState(0)
  const [right, setRight] = useState(0)
  const [bottom, setBottom] = useState(0)
  const [left, setLeft] = useState(0)

  const rootMargin = `${top || 0}px ${right || 0}px ${bottom || 0}px ${left || 0}px`

  useIntersectionObserver(
    target,
    ([entry]) => {
      setIsVisible(entry?.isIntersecting || false)
    },
    { root, rootMargin },
  )

  return (
    <div>
      <p style={{ textAlign: 'center', margin: '0 0 8px' }}>
        {`RootMargin: ${rootMargin}`}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        <input type="text" placeholder="Top" value={top} onChange={e => setTop(Number(e.target.value))} />
        <input type="text" placeholder="Right" value={right} onChange={e => setRight(Number(e.target.value))} />
        <input type="text" placeholder="Bottom" value={bottom} onChange={e => setBottom(Number(e.target.value))} />
        <input type="text" placeholder="Left" value={left} onChange={e => setLeft(Number(e.target.value))} />
      </div>
      <div
        ref={root}
        style={{
          border: '2px dashed #ccc',
          height: 200,
          margin: '2rem 1rem',
          overflowY: 'scroll',
        }}
      >
        <p style={{ textAlign: 'center', padding: '2em 0', marginBottom: 300, fontStyle: 'italic', fontSize: '1.2rem', opacity: 0.8 }}>
          Scroll me down!
        </p>
        <div
          ref={target}
          style={{
            border: '2px dashed #0ea5e9',
            padding: 10,
            maxHeight: 150,
            margin: '0 2rem 400px',
          }}
        >
          <p>Hello world!</p>
        </div>
      </div>
      <p style={{ textAlign: 'center' }}>
        {'Element '}
        <strong>{isVisible ? 'inside' : 'outside'}</strong>
        {' the viewport'}
      </p>
    </div>
  )
}
