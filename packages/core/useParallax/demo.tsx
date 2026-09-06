import type { CSSProperties } from 'react'
import { useParallax } from '@reaxuse/core'
import { useRef } from 'react'

export default function UseParallaxDemo() {
  const target = useRef<HTMLDivElement>(null)
  const { tilt, roll, source } = useParallax(target)

  const layerBase: CSSProperties = {
    position: 'absolute',
    height: '100%',
    width: '100%',
    transition: '.3s ease-out all',
  }

  const layer0: CSSProperties = {
    ...layerBase,
    background: 'radial-gradient(circle at 30% 30%, #7dd3fc, #0ea5e9)',
    transform: `translateX(${tilt * 10}px) translateY(${roll * 10}px) scale(1.33)`,
  }
  const layer1: CSSProperties = {
    ...layerBase,
    background: 'radial-gradient(circle at 70% 60%, #a5b4fc, #6366f1)',
    transform: `translateX(${tilt * 20}px) translateY(${roll * 20}px) scale(1.33)`,
  }
  const layer2: CSSProperties = {
    ...layerBase,
    background: 'radial-gradient(circle at 50% 80%, #fda4af, #f43f5e)',
    transform: `translateX(${tilt * 30}px) translateY(${roll * 30}px) scale(1.33)`,
  }

  const cardStyle: CSSProperties = {
    background: '#fff',
    height: '20rem',
    width: '15rem',
    borderRadius: '5px',
    border: '1px solid #cdcdcd',
    overflow: 'hidden',
    transition: '.3s ease-out all',
    boxShadow: '0 0 20px 0 rgba(255, 255, 255, 0.25)',
    transform: `rotateX(${roll * 20}deg) rotateY(${tilt * 20}deg)`,
  }

  return (
    <div>
      <div
        ref={target}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '500px',
        }}
      >
        <pre style={{ opacity: 0.4 }}>
          {JSON.stringify({ tilt, roll, source }, null, 2)}
        </pre>
        <div style={{ margin: '3em auto', perspective: '300px' }}>
          <div style={cardStyle}>
            <div
              style={{
                overflow: 'hidden',
                fontSize: '6rem',
                position: 'absolute',
                top: 'calc(50% - 1em)',
                left: 'calc(50% - 1em)',
                height: '2em',
                width: '2em',
                margin: 'auto',
              }}
            >
              <div style={layer0} />
              <div style={layer1} />
              <div style={layer2} />
            </div>
          </div>
        </div>
      </div>
      <div className="note opacity-1">
        {'Move your mouse over the area above. When a device orientation is available, it is used instead. Credit of the original concept to '}
        <a
          href="https://codepen.io/jaromvogel"
          target="__blank"
        >
          Jarom Vogel
        </a>
        .
      </div>
    </div>
  )
}
