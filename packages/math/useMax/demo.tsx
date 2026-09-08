import { useMax } from '@reaxuse/math'
import { useState } from 'react'

export default function UseMaxDemo() {
  const [a, setA] = useState(3)
  const [b, setB] = useState(5)
  const [c, setC] = useState(8)

  const max = useMax(a, b, c)

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
        max:
        {' '}
        <strong>{max}</strong>
      </p>
    </div>
  )
}
