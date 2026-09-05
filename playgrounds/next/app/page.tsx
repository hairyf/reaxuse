'use client'

import { useCallback, useState } from 'react'
import { useCounter, useToggle } from '@reaxuse/shared'
import { useNow } from '@reaxuse/core'

export default function Page() {
  const [value, toggle] = useToggle()
  const counter = useCounter(0, { min: 0 })
  const now = useNow(1000)

  const [pressed, setPressed] = useState(false)
  const onPress = useCallback(() => setPressed(v => !v), [])

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
          Now: <code>{new Date(now).toLocaleTimeString()}</code>
        </p>
        <div className="row">
          <button type="button" onClick={onPress}>
            {pressed ? 'Paused (updates stopped)' : 'Click to pause'}
          </button>
        </div>
        <p className="hint">
          {pressed
            ? 'The interval keeps running — hold on…'
            : 'useNow(1000) updates every second'}
        </p>
      </section>
    </main>
  )
}
