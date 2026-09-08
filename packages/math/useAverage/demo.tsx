import { useAverage } from '@reaxuse/math'
import { useState } from 'react'

export default function UseAverageDemo() {
  const [a, setA] = useState(1)
  const [b, setB] = useState(3)
  const [c, setC] = useState(2)

  const average = useAverage(a, b, c)

  return (
    <div>
      <p>
        a:
        {' '}
        <input
          type="number"
          value={a}
          onChange={event => setA(Number(event.target.value))}
        />
      </p>
      <p>
        b:
        {' '}
        <input
          type="number"
          value={b}
          onChange={event => setB(Number(event.target.value))}
        />
      </p>
      <p>
        c:
        {' '}
        <input
          type="number"
          value={c}
          onChange={event => setC(Number(event.target.value))}
        />
      </p>
      <p>
        average:
        {' '}
        <strong>{average}</strong>
      </p>
    </div>
  )
}
