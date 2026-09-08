import { logicOr } from '@reaxuse/math'
import { useState } from 'react'

export default function LogicOrDemo() {
  const [a, setA] = useState(true)
  const [b, setB] = useState(false)
  const [c, setC] = useState(0)

  const result = logicOr(a, b, c)

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
          type="number"
          step="1"
          value={c}
          onChange={event => setC(Number(event.target.value))}
        />
      </p>
      <p>
        result:
        {' '}
        <strong>{String(result)}</strong>
      </p>
    </div>
  )
}
