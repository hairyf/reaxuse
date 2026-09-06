import { usePrecision } from '@reaxuse/math'
import { useState } from 'react'

const MATH_METHODS = ['round', 'floor', 'ceil', 'trunc'] as const

export default function UsePrecisionDemo() {
  const [value, setValue] = useState(3.1415)
  const [digits, setDigits] = useState(2)
  const [math, setMath] = useState<(typeof MATH_METHODS)[number]>('round')

  const result = usePrecision(value, digits, { math })

  return (
    <div>
      <p>
        value:
        {' '}
        <input
          type="number"
          step="0.0001"
          value={value}
          onChange={event => setValue(Number(event.target.value))}
        />
      </p>
      <p>
        digits:
        {' '}
        <input
          type="number"
          min={0}
          max={10}
          value={digits}
          onChange={event => setDigits(Number(event.target.value))}
        />
      </p>
      <p>
        math:
        {' '}
        {MATH_METHODS.map(method => (
          <button key={method} onClick={() => setMath(method)}>{method}</button>
        ))}
      </p>
      <p>
        result:
        {' '}
        <strong>{String(result)}</strong>
      </p>
    </div>
  )
}
