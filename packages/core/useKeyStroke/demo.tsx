import { useKeyStroke } from '@reaxuse/core'
import { useState } from 'react'

export default function UseKeyStrokeDemo() {
  const [translateX, setTranslateX] = useState(0)
  const [translateY, setTranslateY] = useState(0)

  useKeyStroke(['w', 'W', 'ArrowUp'], (e) => {
    if (e.key === 'ArrowUp')
      e.preventDefault()
    setTranslateY(y => y - 10)
  })

  useKeyStroke(['s', 'S', 'ArrowDown'], (e) => {
    if (e.key === 'ArrowDown')
      e.preventDefault()
    setTranslateY(y => y + 10)
  })

  useKeyStroke(['a', 'A', 'ArrowLeft'], () => {
    setTranslateX(x => x - 10)
  })

  useKeyStroke(['d', 'D', 'ArrowRight'], () => {
    setTranslateX(x => x + 10)
  }, { dedupe: true })

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: 400,
          height: 100,
          margin: 'auto',
          overflow: 'hidden',
          border: '1px solid rgba(161, 161, 161, 0.19)',
          borderRadius: 5,
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            background: '#a1a1a1',
            borderRadius: '50%',
            transform: `translate(${translateX}px, ${translateY}px)`,
          }}
        />
      </div>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <p>Use the arrow keys or w a s d keys to control the movement of the ball.</p>
        <p>Repeated events are ignored on the key `d` or `-&gt;`.</p>
      </div>
    </div>
  )
}
