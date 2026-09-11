import { useMath } from '@reause/math'
import { useState } from 'react'

export default function UseMathDemo() {
  const [base, setBase] = useState(2)
  const [exponent, setExponent] = useState(3)
  const [num, setNum] = useState(2)

  const power = useMath('pow', base, exponent)
  const root = useMath('sqrt', num)

  return (
    <div>
      <p>
        base:
        {' '}
        <input
          type="number"
          value={base}
          onChange={event => setBase(Number(event.target.value))}
        />
      </p>
      <p>
        exponent:
        {' '}
        <input
          type="number"
          value={exponent}
          onChange={event => setExponent(Number(event.target.value))}
        />
      </p>
      <p>
        pow(base, exponent):
        {' '}
        <strong>{String(power)}</strong>
      </p>
      <p>
        num:
        {' '}
        <input
          type="number"
          value={num}
          onChange={event => setNum(Number(event.target.value))}
        />
      </p>
      <p>
        sqrt(num):
        {' '}
        <strong>{String(root)}</strong>
      </p>
    </div>
  )
}
