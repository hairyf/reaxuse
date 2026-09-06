import { useWindowScroll } from '@reaxuse/core'

export default function UseWindowScrollDemo() {
  const { x, y, setX, setY } = useWindowScroll({ behavior: 'smooth' })

  return (
    <div>
      <div>
        See scroll values in the lower right corner of the screen.
      </div>
      <div style={{ position: 'absolute', top: '100%', left: '100%', width: 10000, height: 10000 }} />
      <div style={{ position: 'fixed', right: '1rem', bottom: '1rem', padding: '0.5rem 1rem' }}>
        <p style={{ margin: '0 0 0.5rem' }}>
          Scroll value
        </p>
        x:
        {' '}
        {x}
        <br />
        y:
        {' '}
        {y}
      </div>
      <button onClick={() => setX(x + 200)}>
        scroll X
      </button>
      <button onClick={() => setY(y + 200)}>
        scroll Y
      </button>
    </div>
  )
}
