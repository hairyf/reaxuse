import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useCounter, useToggle } from '@reause/shared'
import { useNow } from '@reause/core'

function App() {
  const [value, toggle] = useToggle()
  const { count, inc, dec, reset } = useCounter(0, { min: 0 })
  const now = useNow()

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>reause playground</h1>

      <section>
        <h2>useToggle</h2>
        <p>value: <strong>{String(value)}</strong></p>
        <button onClick={() => toggle()}>toggle</button>
      </section>

      <section>
        <h2>useCounter</h2>
        <p>count: <strong>{count}</strong></p>
        <button onClick={inc}>+</button>
        <button onClick={dec}>−</button>
        <button onClick={reset}>reset</button>
      </section>

      <section>
        <h2>useNow</h2>
        <p>now: <strong>{now.toLocaleTimeString()}</strong></p>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
