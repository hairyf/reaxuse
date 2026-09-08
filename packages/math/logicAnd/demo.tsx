import { logicAnd } from '@reaxuse/math'
import { useState } from 'react'

export default function LogicAndDemo() {
  const [a, setA] = useState(true)
  const [b, setB] = useState(true)
  const [c, setC] = useState(true)

  const result = logicAnd(a, b, c)

  return (
    <div>
      <p>
        a:
        {' '}
        <input
          type="checkbox"
          checked={a}
          onChange={event => setA(event.target.checked)}
        />
      </p>
      <p>
        b:
        {' '}
        <input
          type="checkbox"
          checked={b}
          onChange={event => setB(event.target.checked)}
        />
      </p>
      <p>
        c:
        {' '}
        <input
          type="checkbox"
          checked={c}
          onChange={event => setC(event.target.checked)}
        />
      </p>
      <p>
        logicAnd(a, b, c) =
        {' '}
        <strong>{String(result)}</strong>
      </p>
    </div>
  )
}
