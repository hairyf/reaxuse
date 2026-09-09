'use client'

import { useCallback } from 'react'
import { useCounter, useToggle } from '@reaxuse/shared'
import { useNow } from '@reaxuse/core'

export default function Page() {
  const [value, toggle] = useToggle()
  const counter = useCounter(0, { min: 0 })
  const { now, isActive, pause, resume } = useNow({ controls: true })

  const onPress = useCallback(() => {
    if (isActive)
      pause()
    else
      resume()
  }, [isActive, pause, resume])

  return (
    <main className="page">
      <h1>reaxuse · Next.js playground</h1>
      <p className="sub">
        Live demos of the ported hooks — same examples as the VitePress docs.
      </p>

      <section>
        <h2>useToggle</h2>
        <p>
          Value: <code>{String(value)}</code>
        </p>
        <div className="row">
          <button type="button" onClick={() => toggle()}>Toggle</button>
          <button type="button" onClick={() => toggle(true)}>Set true</button>
          <button type="button" onClick={() => toggle(v => !v)}>Invert</button>
        </div>
      </section>

      <section>
        <h2>useCounter</h2>
        <p>
          Count: <code>{counter.count}</code>
        </p>
        <div className="row">
          <button type="button" onClick={() => counter.inc()}>Increment</button>
          <button type="button" onClick={() => counter.dec()}>Decrement</button>
          <button type="button" onClick={() => counter.set(0)}>Reset</button>
        </div>
      </section>

      <section>
        <h2>useNow</h2>
        <p>
          Now: <code>{now.toLocaleTimeString()}</code>
        </p>
        <div className="row">
          <button type="button" onClick={onPress}>
            {isActive ? 'Click to pause' : 'Paused (updates stopped)'}
          </button>
        </div>
        <p className="hint">
          {isActive
            ? 'useNow() updates every animation frame'
            : 'Paused — click again to resume'}
        </p>
      </section>
    </main>
  )
}
